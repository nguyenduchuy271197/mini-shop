"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/custom.types";
import { z } from "zod";

// Validation schema cho filters
const customerFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  gender: z.enum(["male", "female", "other"] as const).optional(),
  hasOrders: z.boolean().optional(),
  registeredAfter: z.string().optional(), // ISO date string
  registeredBefore: z.string().optional(), // ISO date string
}).optional();

const getCustomersSchema = z.object({
  pagination: z.object({
    page: z.number().int().min(1, "Trang phải lớn hơn 0"),
    limit: z.number().int().min(1, "Số lượng phải lớn hơn 0").max(100, "Số lượng tối đa 100"),
  }),
  filters: customerFiltersSchema,
});

type GetCustomersData = z.infer<typeof getCustomersSchema>;

// Extended customer type với thông tin bổ sung
type CustomerInfo = Profile & {
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  user_role?: "customer" | "admin";
};

// Return type
type GetCustomersResult =
  | {
      success: true;
      customers: CustomerInfo[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }
  | { success: false; error: string };

export async function getCustomers(data: GetCustomersData): Promise<GetCustomersResult> {
  try {
    // 1. Validate input
    const { pagination, filters } = getCustomersSchema.parse(data);

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
        error: "Bạn cần đăng nhập để xem danh sách khách hàng",
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
        error: "Bạn không có quyền xem danh sách khách hàng",
      };
    }

    // 4. First get all customer user IDs from user_roles
    const { data: customerRoles, error: customerRolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "customer");

    if (customerRolesError) {
      return {
        success: false,
        error: customerRolesError.message || "Không thể lấy danh sách vai trò khách hàng",
      };
    }

    const customerIds = customerRoles?.map(role => role.user_id) || [];

    if (customerIds.length === 0) {
      return {
        success: true,
        customers: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    // 5. Build query for profiles with customer IDs
    let profileQuery = supabase
      .from("profiles")
      .select("*")
      .in("id", customerIds);

    

    // 6. Apply filters to profileQuery for both data and count
    if (filters) {
      // Text search in name and email
      if (filters.search) {
        profileQuery = profileQuery.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      // Gender filter
      if (filters.gender) {
        profileQuery = profileQuery.eq("gender", filters.gender);
      }

      // Date range filters
      if (filters.registeredAfter) {
        profileQuery = profileQuery.gte("created_at", filters.registeredAfter);
      }

      if (filters.registeredBefore) {
        profileQuery = profileQuery.lte("created_at", filters.registeredBefore);
      }
    }

    // 7. Get total count for pagination (with same filters)
    let countQuery = supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .in("id", customerIds);
    
    // Apply same filters to count query
    if (filters) {
      if (filters.search) {
        countQuery = countQuery.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters.gender) {
        countQuery = countQuery.eq("gender", filters.gender);
      }

      if (filters.registeredAfter) {
        countQuery = countQuery.gte("created_at", filters.registeredAfter);
      }

      if (filters.registeredBefore) {
        countQuery = countQuery.lte("created_at", filters.registeredBefore);
      }
    }

    const { count: totalCount, error: countError } = await countQuery;



    if (countError) {
      return {
        success: false,
        error: countError.message || "Không thể đếm số lượng khách hàng",
      };
    }

    if (totalCount === null) {
      return {
        success: false,
        error: "Không thể đếm số lượng khách hàng",
      };
    }

    // 8. Get customers with pagination
    const offset = (pagination.page - 1) * pagination.limit;

    const { data: customers, error: customersError } = await profileQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + pagination.limit - 1);

    if (customersError) {
      return {
        success: false,
        error: customersError.message || "Không thể lấy danh sách khách hàng",
      };
    }

    if (!customers) {
      return {
        success: false,
        error: "Không tìm thấy khách hàng",
      };
    }

    // 9. Enrich customer data with order statistics
    const customerUserIds = customers.map(customer => customer.id);
    let enrichedCustomers: CustomerInfo[] = customers.map(customer => ({
      ...customer,
      user_role: "customer" as const,
      total_orders: 0,
      total_spent: 0,
      last_order_date: undefined,
    }));

    if (customerUserIds.length > 0) {
      // Get order statistics for each customer
      const { data: orderStats, error: orderStatsError } = await supabase
        .from("orders")
        .select("user_id, total_amount, created_at")
        .in("user_id", customerUserIds)
        .neq("status", "cancelled");

      if (!orderStatsError && orderStats) {
        // Calculate statistics per customer
        const statsMap = orderStats.reduce((acc, order) => {
          if (!order.user_id) return acc;
          
          if (!acc[order.user_id]) {
            acc[order.user_id] = {
              total_orders: 0,
              total_spent: 0,
              last_order_date: order.created_at,
            };
          }
          
          acc[order.user_id].total_orders += 1;
          acc[order.user_id].total_spent += Number(order.total_amount);
          
          // Keep the most recent order date
          if (order.created_at > acc[order.user_id].last_order_date) {
            acc[order.user_id].last_order_date = order.created_at;
          }
          
          return acc;
        }, {} as Record<string, { total_orders: number; total_spent: number; last_order_date: string }>);

        // Merge statistics back to customers
        enrichedCustomers = enrichedCustomers.map(customer => ({
          ...customer,
          ...statsMap[customer.id],
        }));
      }

      // Filter by hasOrders if specified
      if (filters?.hasOrders !== undefined) {
        enrichedCustomers = enrichedCustomers.filter(customer => 
          filters.hasOrders ? (customer.total_orders || 0) > 0 : (customer.total_orders || 0) === 0
        );
      }
    }

    // 10. Calculate pagination info
    const totalPages = Math.ceil(totalCount / pagination.limit);

    return {
      success: true,
      customers: enrichedCustomers,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: totalCount,
        totalPages,
      },
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách khách hàng",
    };
  }
} 