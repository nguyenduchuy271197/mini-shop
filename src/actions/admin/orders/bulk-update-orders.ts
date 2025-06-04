"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, Profile, OrderStatus } from "@/types/custom.types";
import { z } from "zod";

// Define type for order with customer data from Supabase query
type OrderWithCustomer = Order & {
  customer: Pick<Profile, "email" | "full_name"> | null;
};

// Validation schema
const bulkUpdateOrdersSchema = z.object({
  orderIds: z.array(z.number().positive("ID đơn hàng phải lớn hơn 0")).min(1, "Phải có ít nhất một đơn hàng").max(100, "Tối đa 100 đơn hàng"),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  notes: z.string().optional(), // Ghi chú cho việc cập nhật
  notifyCustomers: z.boolean().optional().default(false), // Thông báo cho khách hàng
});

type BulkUpdateOrdersData = z.infer<typeof bulkUpdateOrdersSchema>;

// Return type
type BulkUpdateOrdersResult =
  | {
      success: true;
      message: string;
      updated: {
        count: number;
        orders: Array<{
          id: number;
          order_number: string;
          old_status: OrderStatus;
          new_status: OrderStatus;
          customer_email?: string;
        }>;
      };
      failed: Array<{
        id: number;
        order_number?: string;
        error: string;
      }>;
    }
  | { success: false; error: string };

export async function bulkUpdateOrderStatus(data: BulkUpdateOrdersData): Promise<BulkUpdateOrdersResult> {
  try {
    // 1. Validate input
    const { orderIds, status, notes, notifyCustomers } = bulkUpdateOrdersSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Check admin authorization
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật đơn hàng",
      };
    }

    // Check if user is admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền cập nhật đơn hàng",
      };
    }

    // 4. Get existing orders
    const { data: existingOrders, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .in("id", orderIds);

    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "Không thể lấy thông tin đơn hàng",
      };
    }

    if (!existingOrders || existingOrders.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng nào",
      };
    }

    // Get customer information separately if needed
    const userIds = existingOrders.map(order => order.user_id).filter(Boolean) as string[];
    const customerData: Map<string, Pick<Profile, "email" | "full_name">> = new Map();
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      
      if (profiles) {
        profiles.forEach(profile => {
          customerData.set(profile.id, {
            email: profile.email,
            full_name: profile.full_name,
          });
        });
      }
    }

    // Create typed orders with customer data
    const typedExistingOrders: OrderWithCustomer[] = existingOrders.map(order => ({
      ...order,
      customer: order.user_id ? customerData.get(order.user_id) || null : null,
    }));

    // 5. Validate status transitions and business rules
    const validationResults = typedExistingOrders.map(order => {
      const validation = validateStatusTransition(order.status as OrderStatus, status as OrderStatus);
      return {
        order,
        isValid: validation.isValid,
        error: validation.error,
      };
    });

    const validOrders = validationResults.filter(result => result.isValid);
    const invalidOrders = validationResults.filter(result => !result.isValid);

    if (validOrders.length === 0) {
      return {
        success: false,
        error: "Không có đơn hàng nào có thể cập nhật được",
      };
    }

    // 6. Perform bulk update
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
      ...(notes && { notes: notes }),
    };

    const validOrderIds = validOrders.map(result => result.order.id);

    const { data: updatedOrders, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .in("id", validOrderIds)
      .select();

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Không thể cập nhật đơn hàng",
      };
    }

    if (!updatedOrders) {
      return {
        success: false,
        error: "Không thể cập nhật đơn hàng",
      };
    }

    // 7. Prepare success response
    const updated = {
      count: updatedOrders.length,
      orders: validOrders.map(result => ({
        id: result.order.id,
        order_number: result.order.order_number,
        old_status: result.order.status as OrderStatus,
        new_status: status as OrderStatus,
        customer_email: result.order.customer?.email,
      })),
    };

    const failed = invalidOrders.map(result => ({
      id: result.order.id,
      order_number: result.order.order_number,
      error: result.error || "Không thể cập nhật",
    }));

    // 8. Handle customer notifications if requested
    if (notifyCustomers && updated.orders.length > 0) {
      // Here you would implement email notification logic
      // For now, we'll just log the notification intent
      console.log(`Sending notifications to customers for ${updated.orders.length} orders with status: ${status}`);
      
      // Example notification logic would go here:
      // await sendOrderStatusNotifications(updated.orders, status);
    }

    // 9. Create success message
    const statusText = getStatusDisplayName(status);
    let message = `Đã cập nhật thành công ${updated.count} đơn hàng thành trạng thái "${statusText}"`;
    
    if (failed.length > 0) {
      message += `. ${failed.length} đơn hàng không thể cập nhật.`;
    }

    if (notes) {
      message += ` Ghi chú: ${notes}`;
    }

    return {
      success: true,
      message,
      updated,
      failed,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi cập nhật đơn hàng",
    };
  }
}

// Helper function to validate status transitions
function validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): { isValid: boolean; error?: string } {
  // Define valid status transitions
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': ['refunded'], // Can refund delivered orders
    'cancelled': [], // Cannot change from cancelled
    'refunded': [], // Cannot change from refunded
  };

  // If trying to set the same status
  if (currentStatus === newStatus) {
    return {
      isValid: false,
      error: `Đơn hàng đã ở trạng thái "${getStatusDisplayName(newStatus)}"`,
    };
  }

  // Check if transition is allowed
  const allowedTransitions = validTransitions[currentStatus] || [];
  
  if (!allowedTransitions.includes(newStatus)) {
    return {
      isValid: false,
      error: `Không thể chuyển từ trạng thái "${getStatusDisplayName(currentStatus)}" sang "${getStatusDisplayName(newStatus)}"`,
    };
  }

  return { isValid: true };
}

// Helper function to get display name for status
function getStatusDisplayName(status: OrderStatus): string {
  const statusNames: Record<OrderStatus, string> = {
    'pending': 'Chờ xử lý',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipped': 'Đã giao vận',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy',
    'refunded': 'Đã hoàn tiền',
  };

  return statusNames[status] || status;
} 