"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Date range type
type DateRange = {
  startDate: string;
  endDate: string;
};

type ExportFormat = "excel" | "pdf";

// Schema validation
const exportSalesReportSchema = z.object({
  startDate: z.string().datetime("Ngày bắt đầu không hợp lệ"),
  endDate: z.string().datetime("Ngày kết thúc không hợp lệ"),
  format: z.enum(["excel", "pdf"], {
    required_error: "Định dạng file là bắt buộc",
    invalid_type_error: "Định dạng file không hợp lệ"
  }),
}).refine((data) => {
  return new Date(data.endDate) > new Date(data.startDate);
}, {
  message: "Ngày kết thúc phải sau ngày bắt đầu",
  path: ["endDate"]
});

type ExportSalesReportResult =
  | { 
      success: true; 
      downloadUrl: string;
      fileName: string;
      fileSize: number;
    }
  | { success: false; error: string };

export async function exportSalesReport(
  dateRange: DateRange,
  format: ExportFormat
): Promise<ExportSalesReportResult> {
  try {
    // Validate input
    const validatedData = exportSalesReportSchema.parse({
      ...dateRange,
      format,
    });

    const supabase = createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa được xác thực",
      };
    }

    // Kiểm tra authorization - chỉ admin mới có thể export báo cáo
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleError || userRole?.role !== "admin") {
      return {
        success: false,
        error: "Chỉ admin mới có thể export báo cáo bán hàng",
      };
    }

    // Lấy dữ liệu đơn hàng chi tiết trong khoảng thời gian
    const { data: ordersData, error: ordersError } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        total_amount,
        subtotal,
        tax_amount,
        shipping_amount,
        discount_amount,
        status,
        payment_status,
        created_at,
        user_id,
        coupon_code,
        order_items (
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .gte("created_at", validatedData.startDate)
      .lte("created_at", validatedData.endDate)
      .order("created_at", { ascending: false });

    if (ordersError) {
      return {
        success: false,
        error: "Lỗi khi lấy dữ liệu đơn hàng",
      };
    }

    // Lấy thông tin khách hàng
    const userIds = Array.from(new Set(ordersData?.map(order => order.user_id).filter(Boolean))) as string[];
    const { data: customersData } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const customerMap = new Map(
      customersData?.map(customer => [customer.id, customer]) || []
    );

    // Chuẩn bị dữ liệu export
    const exportData = ordersData?.map(order => {
      const customer = customerMap.get(order.user_id || "");
      
      return {
        order_number: order.order_number,
        customer_name: customer?.full_name || "Guest",
        customer_email: customer?.email || "N/A",
        total_amount: order.total_amount,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        shipping_amount: order.shipping_amount,
        discount_amount: order.discount_amount,
        coupon_code: order.coupon_code || "N/A",
        status: order.status,
        payment_status: order.payment_status,
        created_at: new Date(order.created_at).toLocaleDateString("vi-VN"),
        items_count: order.order_items?.length || 0,
        items_detail: order.order_items?.map(item => 
          `${item.product_name} (${item.quantity}x${item.unit_price})`
        ).join("; ") || "",
      };
    }) || [];

    // Tạo file name
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `sales-report-${timestamp}.${validatedData.format}`;

    // Trong thực tế, bạn sẽ cần implement logic tạo file Excel/PDF
    // Ở đây chỉ mô phỏng việc tạo file và trả về URL
    
    // Mô phỏng việc tạo file và upload lên storage
    // const fileContent = generateExcelFile(exportData); // hoặc generatePDFFile(exportData)
    // const { data: uploadData, error: uploadError } = await supabase.storage
    //   .from('reports')
    //   .upload(`sales-reports/${fileName}`, fileContent);

    // Mô phỏng kết quả
    const mockDownloadUrl = `https://example.com/reports/${fileName}`;
    const mockFileSize = exportData.length * 100; // bytes ước tính

    return {
      success: true,
      downloadUrl: mockDownloadUrl,
      fileName,
      fileSize: mockFileSize,
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
      error: "Đã xảy ra lỗi không mong muốn khi export báo cáo bán hàng",
    };
  }
} 