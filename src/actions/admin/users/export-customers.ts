"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho export filters
const exportCustomersFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  hasOrders: z.boolean().optional(),
  registeredAfter: z.string().optional(), // ISO date string
  registeredBefore: z.string().optional(), // ISO date string
  includeOrderStats: z.boolean().optional().default(true),
  includeAddresses: z.boolean().optional().default(false),
}).optional();

const exportCustomersSchema = z.object({
  filters: exportCustomersFiltersSchema,
  format: z.enum(["csv", "json"]).optional().default("csv"),
});

type ExportCustomersData = z.infer<typeof exportCustomersSchema>;

// Customer export data type
type CustomerExportData = {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  created_at: string;
  total_orders?: number;
  total_spent?: number;
  last_order_date?: string;
  shipping_address?: string;
  billing_address?: string;
};

// Return type
type ExportCustomersResult =
  | {
      success: true;
      data: string; // CSV hoặc JSON string
      filename: string;
      format: "csv" | "json";
      totalRecords: number;
    }
  | { success: false; error: string };

export async function exportCustomers(data?: ExportCustomersData): Promise<ExportCustomersResult> {
  try {
    // 1. Validate input
    const { filters, format } = data ? exportCustomersSchema.parse(data) : { filters: undefined, format: "csv" as const };

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
        error: "Bạn cần đăng nhập để xuất danh sách khách hàng",
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
        error: "Bạn không có quyền xuất danh sách khách hàng",
      };
    }

    // 4. Build base query cho profiles
    let profileQuery = supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        phone,
        gender,
        date_of_birth,
        created_at,
        user_roles!inner(role)
      `)
      .eq("user_roles.role", "customer");

    // 5. Apply filters
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

    // 6. Get all customers (no pagination for export)
    const { data: customers, error: customersError } = await profileQuery
      .order("created_at", { ascending: false });

    if (customersError) {
      return {
        success: false,
        error: customersError.message || "Không thể lấy danh sách khách hàng",
      };
    }

    if (!customers || customers.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy khách hàng để xuất",
      };
    }

    // 7. Enrich customer data
    const customerIds = customers.map(customer => customer.id);
    let exportData: CustomerExportData[] = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      full_name: customer.full_name || undefined,
      phone: customer.phone || undefined,
      gender: customer.gender || undefined,
      date_of_birth: customer.date_of_birth || undefined,
      created_at: customer.created_at,
    }));

    // 8. Get order statistics if requested
    if (filters?.includeOrderStats && customerIds.length > 0) {
      const { data: orderStats, error: orderStatsError } = await supabase
        .from("orders")
        .select("user_id, total_amount, created_at")
        .in("user_id", customerIds)
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

        // Merge statistics to export data
        exportData = exportData.map(customer => ({
          ...customer,
          total_orders: statsMap[customer.id]?.total_orders || 0,
          total_spent: statsMap[customer.id]?.total_spent || 0,
          last_order_date: statsMap[customer.id]?.last_order_date || undefined,
        }));
      }

      // Filter by hasOrders if specified
      if (filters?.hasOrders !== undefined) {
        exportData = exportData.filter(customer => 
          filters.hasOrders ? (customer.total_orders || 0) > 0 : (customer.total_orders || 0) === 0
        );
      }
    }

    // 9. Get addresses if requested
    if (filters?.includeAddresses && customerIds.length > 0) {
      const { data: addresses, error: addressesError } = await supabase
        .from("addresses")
        .select("user_id, type, address_line_1, city, state, is_default")
        .in("user_id", customerIds);

      if (!addressesError && addresses) {
        // Group addresses by user and type
        const addressMap = addresses.reduce((acc, address) => {
          if (!acc[address.user_id]) {
            acc[address.user_id] = { shipping: null, billing: null };
          }
          
          const addressString = `${address.address_line_1}, ${address.city}, ${address.state}`;
          
          if (address.type === "shipping" && (address.is_default || !acc[address.user_id].shipping)) {
            acc[address.user_id].shipping = addressString;
          }
          
          if (address.type === "billing" && (address.is_default || !acc[address.user_id].billing)) {
            acc[address.user_id].billing = addressString;
          }
          
          return acc;
        }, {} as Record<string, { shipping: string | null; billing: string | null }>);

        // Add addresses to export data
        exportData = exportData.map(customer => ({
          ...customer,
          shipping_address: addressMap[customer.id]?.shipping || undefined,
          billing_address: addressMap[customer.id]?.billing || undefined,
        }));
      }
    }

    // 10. Format data based on requested format
    let formattedData: string;
    let filename: string;
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === "json") {
      formattedData = JSON.stringify(exportData, null, 2);
      filename = `customers-export-${timestamp}.json`;
    } else {
      // CSV format
      if (exportData.length === 0) {
        formattedData = "Không có dữ liệu để xuất";
      } else {
        // Generate CSV headers based on available fields
        const headers = Object.keys(exportData[0]).filter(key => exportData.some(item => item[key as keyof CustomerExportData] !== undefined));
        
        // Create CSV content
        const csvHeaders = headers.map(header => {
          switch (header) {
            case 'id': return 'ID';
            case 'email': return 'Email';
            case 'full_name': return 'Họ tên';
            case 'phone': return 'Số điện thoại';
            case 'gender': return 'Giới tính';
            case 'date_of_birth': return 'Ngày sinh';
            case 'created_at': return 'Ngày đăng ký';
            case 'total_orders': return 'Tổng đơn hàng';
            case 'total_spent': return 'Tổng chi tiêu';
            case 'last_order_date': return 'Đơn hàng cuối';
            case 'shipping_address': return 'Địa chỉ giao hàng';
            case 'billing_address': return 'Địa chỉ thanh toán';
            default: return header;
          }
        });

        const csvRows = exportData.map(customer => 
          headers.map(header => {
            const value = customer[header as keyof CustomerExportData];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        );

        formattedData = [csvHeaders.join(','), ...csvRows].join('\n');
      }
      filename = `customers-export-${timestamp}.csv`;
    }

    return {
      success: true,
      data: formattedData,
      filename,
      format,
      totalRecords: exportData.length,
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
      error: "Đã xảy ra lỗi không mong muốn khi xuất danh sách khách hàng",
    };
  }
} 