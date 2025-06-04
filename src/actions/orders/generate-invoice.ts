"use server";

import { createClient } from "@/lib/supabase/server";
import { Order, OrderItem, Product, Profile } from "@/types/custom.types";
import { Database } from "@/types/database.types";
import { z } from "zod";

// Validation schema
const generateInvoiceSchema = z.object({
  orderId: z.number().positive("ID đơn hàng không hợp lệ"),
  includeDetails: z.boolean().optional().default(true),
  language: z.enum(["vi", "en"]).optional().default("vi"),
});

type GenerateInvoiceData = z.infer<typeof generateInvoiceSchema>;

// Address type for invoice (simplified from database Json)
type InvoiceAddress = {
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
};

// Invoice data structure
type InvoiceData = {
  invoice_number: string;
  issue_date: string;
  due_date: string;
  order: Pick<Order, "id" | "order_number" | "status" | "created_at" | "total_amount" | "subtotal" | "tax_amount" | "shipping_amount" | "discount_amount">;
  customer: Pick<Profile, "id" | "full_name" | "email">;
  billing_address: InvoiceAddress | null;
  shipping_address: InvoiceAddress | null;
  items: Array<OrderItem & {
    product?: Pick<Product, "id" | "name" | "sku"> | null;
  }>;
  payment_info: {
    payment_status: string;
    payment_method?: string;
    paid_amount: number;
    remaining_amount: number;
  };
  company_info: {
    name: string;
    address: string;
    tax_id?: string;
    phone?: string;
    email?: string;
  };
};

// Return type
type GenerateInvoiceResult =
  | { success: true; message: string; invoice: InvoiceData }
  | { success: false; error: string };

export async function generateInvoice(data: GenerateInvoiceData): Promise<GenerateInvoiceResult> {
  try {
    // 1. Validate input
    const { orderId, includeDetails } = generateInvoiceSchema.parse(data);

    // 2. Create Supabase client
    const supabase = createClient();

    // 3. Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để tạo hóa đơn",
      };
    }

    // 4. Check admin permissions
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || !userRole || userRole.role !== "admin") {
      return {
        success: false,
        error: "Bạn không có quyền tạo hóa đơn",
      };
    }

    // 5. Get order details with customer info
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        payment_status,
        user_id,
        created_at,
        total_amount,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        billing_address,
        shipping_address
      `)
      .eq("id", orderId)
      .single();

    if (orderError) {
      if (orderError.code === "PGRST116") {
        return {
          success: false,
          error: "Không tìm thấy đơn hàng",
        };
      }
      return {
        success: false,
        error: orderError.message || "Không thể lấy thông tin đơn hàng",
      };
    }

    if (!order) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng",
      };
    }

    // 6. Check if order is eligible for invoice generation
    const eligibleStatuses = ["confirmed", "processing", "shipped", "delivered"];
    if (!eligibleStatuses.includes(order.status)) {
      return {
        success: false,
        error: "Chỉ có thể tạo hóa đơn cho đơn hàng đã xác nhận",
      };
    }

    // 7. Get customer information
    if (!order.user_id) {
      return {
        success: false,
        error: "Đơn hàng không có thông tin khách hàng",
      };
    }

    const { data: customer, error: customerError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", order.user_id)
      .single();

    if (customerError || !customer) {
      return {
        success: false,
        error: "Không thể lấy thông tin khách hàng",
      };
    }

    // 8. Get order items with product details if requested
    let orderItems: Array<OrderItem & { product?: Pick<Product, "id" | "name" | "sku"> | null }> = [];

    if (includeDetails) {
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId)
        .order("id", { ascending: true });

      if (itemsError) {
        return {
          success: false,
          error: itemsError.message || "Không thể lấy chi tiết sản phẩm",
        };
      }

      if (items && items.length > 0) {
        // Get product details
        const productIds = items.map(item => item.product_id);
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("id, name, sku")
          .in("id", productIds);

        if (productsError) {
          console.error("Error fetching products:", productsError);
        }

        // Map products to items
        const productsMap = new Map<number, Pick<Product, "id" | "name" | "sku">>();
        products?.forEach(product => {
          productsMap.set(product.id, product);
        });

        orderItems = items.map(item => ({
          ...item,
          product: productsMap.get(item.product_id) || null,
        }));
      }
    }

    // 9. Get payment information
    const { data: payments } = await supabase
      .from("payments")
      .select("amount, status, transaction_id")
      .eq("order_id", orderId)
      .eq("type", "payment");

    const paidAmount = payments?.reduce((sum, payment) => 
      payment.status === "paid" ? sum + payment.amount : sum, 0) || 0;

    // 10. Generate invoice number
    const invoiceNumber = `INV-${order.order_number}-${Date.now().toString().slice(-6)}`;

    // 11. Calculate dates
    const issueDate = new Date().toISOString();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now

    // 12. Company information (you can make this configurable)
    const companyInfo = {
      name: "Mini Shop",
      address: "123 Đường ABC, Quận 1, TP.HCM, Việt Nam",
      tax_id: "0123456789",
      phone: "+84 123 456 789",
      email: "info@minishop.com",
    };

    // 13. Parse addresses from JSON
    const parseAddress = (addressJson: Database["public"]["Tables"]["orders"]["Row"]["billing_address"]): InvoiceAddress | null => {
      if (!addressJson || typeof addressJson !== 'object' || Array.isArray(addressJson)) return null;
      try {
        // Type guard to ensure it's an object with string keys
        const addr = addressJson as Record<string, string | null | undefined>;
        return {
          first_name: addr.first_name || '',
          last_name: addr.last_name || '',
          company: addr.company || undefined,
          address_line_1: addr.address_line_1 || '',
          address_line_2: addr.address_line_2 || undefined,
          city: addr.city || '',
          state: addr.state || '',
          postal_code: addr.postal_code || '',
          country: addr.country || '',
          phone: addr.phone || undefined,
        };
      } catch {
        return null;
      }
    };

    // 14. Prepare invoice data
    const invoiceData: InvoiceData = {
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate,
      order: {
        id: order.id,
        order_number: order.order_number,
        status: order.status,
        created_at: order.created_at,
        total_amount: order.total_amount,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        shipping_amount: order.shipping_amount,
        discount_amount: order.discount_amount,
      },
      customer,
      billing_address: parseAddress(order.billing_address),
      shipping_address: parseAddress(order.shipping_address),
      items: orderItems,
      payment_info: {
        payment_status: order.payment_status,
        payment_method: undefined, // Payment method not available in current schema
        paid_amount: paidAmount,
        remaining_amount: Math.max(0, order.total_amount - paidAmount),
      },
      company_info: companyInfo,
    };

    return {
      success: true,
      message: `Đã tạo hóa đơn ${invoiceNumber} cho đơn hàng ${order.order_number}`,
      invoice: invoiceData,
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
      error: "Đã xảy ra lỗi không mong muốn khi tạo hóa đơn",
    };
  }
} 