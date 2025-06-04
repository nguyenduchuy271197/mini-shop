"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment, Order } from "@/types/custom.types";
import { z } from "zod";

// Define type for payment with order data for reconciliation
type PaymentForReconciliation = Payment & {
  order: Pick<Order, "id" | "order_number" | "total_amount" | "status"> | null;
};

// Validation schema
const reconcilePaymentsSchema = z.object({
  date: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày không hợp lệ"),
  includePartial: z.boolean().optional().default(false), // Bao gồm thanh toán một phần
  autoFix: z.boolean().optional().default(false), // Tự động sửa các vấn đề đơn giản
});

type ReconcilePaymentsData = z.infer<typeof reconcilePaymentsSchema>;

// Reconciliation result types
type ReconciliationIssue = {
  type: "amount_mismatch" | "status_mismatch" | "missing_payment" | "duplicate_payment" | "orphan_payment";
  severity: "low" | "medium" | "high";
  payment_id?: number;
  order_id?: number;
  order_number?: string;
  description: string;
  expected_value?: string | number;
  actual_value?: string | number;
  suggestion?: string;
  auto_fixable: boolean;
};

type ReconciliationSummary = {
  total_payments_checked: number;
  total_orders_checked: number;
  total_issues_found: number;
  issues_by_type: Record<string, number>;
  issues_by_severity: Record<string, number>;
  total_amount_discrepancy: number;
  auto_fixed_count: number;
};

// Return type
type ReconcilePaymentsResult =
  | {
      success: true;
      message: string;
      reconciliation: {
        date: string;
        summary: ReconciliationSummary;
        issues: ReconciliationIssue[];
        fixed_issues: ReconciliationIssue[];
      };
    }
  | { success: false; error: string };

export async function reconcilePayments(data: ReconcilePaymentsData): Promise<ReconcilePaymentsResult> {
  try {
    // 1. Validate input
    const { date, autoFix } = reconcilePaymentsSchema.parse(data);

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
        error: "Bạn cần đăng nhập để thực hiện đối soát thanh toán",
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
        error: "Bạn không có quyền thực hiện đối soát thanh toán",
      };
    }

    // 4. Calculate date range for the specified date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 5. Get payments for the specified date with order information
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .order("created_at", { ascending: true });

    if (paymentsError) {
      return {
        success: false,
        error: paymentsError.message || "Không thể lấy dữ liệu thanh toán",
      };
    }

    // Get order information separately
    let paymentsList: PaymentForReconciliation[] = [];
    
    if (payments && payments.length > 0) {
      const orderIds = payments.map(p => p.order_id);
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, total_amount, status")
        .in("id", orderIds);

      const orderMap = new Map(orders?.map(o => [o.id, o]) || []);

      paymentsList = payments.map(payment => ({
        ...payment,
        order: orderMap.get(payment.order_id) || null,
      }));
    } else {
      paymentsList = [];
    }

    // 6. Get orders for the specified date that should have payments
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("id, order_number, total_amount, status, payment_status")
      .gte("created_at", startOfDay.toISOString())
      .lte("created_at", endOfDay.toISOString())
      .in("status", ["confirmed", "processing", "shipped", "delivered"]) // Orders that should have payments
      .order("created_at", { ascending: true });

    if (ordersError) {
      return {
        success: false,
        error: ordersError.message || "Không thể lấy dữ liệu đơn hàng",
      };
    }

    const ordersList = orders || [];

    // 7. Perform reconciliation checks
    const issues: ReconciliationIssue[] = [];
    const fixedIssues: ReconciliationIssue[] = [];

    // Check 1: Amount mismatches between payments and orders
    for (const payment of paymentsList) {
      if (payment.order) {
        const orderAmount = Number(payment.order.total_amount);
        const paymentAmount = Number(payment.amount);
        
        if (Math.abs(orderAmount - paymentAmount) > 0.01) { // Allow for small rounding differences
          const issue: ReconciliationIssue = {
            type: "amount_mismatch",
            severity: orderAmount > paymentAmount ? "high" : "medium",
            payment_id: payment.id,
            order_id: payment.order.id,
            order_number: payment.order.order_number,
            description: `Số tiền thanh toán không khớp với tổng đơn hàng`,
            expected_value: orderAmount,
            actual_value: paymentAmount,
            suggestion: `Kiểm tra lại số tiền thanh toán cho đơn hàng ${payment.order.order_number}`,
            auto_fixable: false,
          };
          issues.push(issue);
        }
      }
    }

    // Check 2: Status mismatches between payments and orders
    for (const payment of paymentsList) {
      if (payment.order) {
        const shouldBeCompleted = payment.order.status === "delivered" && payment.status !== "completed";
        const shouldBePending = payment.order.status === "pending" && payment.status === "completed";
        
        if (shouldBeCompleted || shouldBePending) {
          const expectedStatus = shouldBeCompleted ? "completed" : "pending";
          const issue: ReconciliationIssue = {
            type: "status_mismatch",
            severity: "medium",
            payment_id: payment.id,
            order_id: payment.order.id,
            order_number: payment.order.order_number,
            description: `Trạng thái thanh toán không khớp với trạng thái đơn hàng`,
            expected_value: expectedStatus,
            actual_value: payment.status,
            suggestion: `Cập nhật trạng thái thanh toán thành "${expectedStatus}"`,
            auto_fixable: autoFix,
          };
          
          // Auto-fix if enabled and safe
          if (autoFix && (shouldBeCompleted || shouldBePending)) {
            const { error: updateError } = await supabase
              .from("payments")
              .update({ 
                status: expectedStatus,
                updated_at: new Date().toISOString()
              })
              .eq("id", payment.id);
              
            if (!updateError) {
              fixedIssues.push(issue);
            } else {
              issues.push(issue);
            }
          } else {
            issues.push(issue);
          }
        }
      }
    }

    // Check 3: Missing payments for orders that should have them
    const paymentOrderIds = new Set(paymentsList.map(p => p.order_id).filter(Boolean));
    
    for (const order of ordersList) {
      if (!paymentOrderIds.has(order.id) && order.payment_status === "paid") {
        const issue: ReconciliationIssue = {
          type: "missing_payment",
          severity: "high",
          order_id: order.id,
          order_number: order.order_number,
          description: `Đơn hàng được đánh dấu đã thanh toán nhưng không có bản ghi thanh toán`,
          expected_value: "Payment record exists",
          actual_value: "No payment record",
          suggestion: `Tạo bản ghi thanh toán cho đơn hàng ${order.order_number}`,
          auto_fixable: false,
        };
        issues.push(issue);
      }
    }

    // Check 4: Duplicate payments for the same order
    const orderPaymentCounts = paymentsList.reduce((acc, payment) => {
      if (payment.order_id) {
        acc[payment.order_id] = (acc[payment.order_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    for (const [orderId, count] of Object.entries(orderPaymentCounts)) {
      if (count > 1) {
        const orderIdNum = parseInt(orderId);
        const duplicatePayments = paymentsList.filter(p => p.order_id === orderIdNum);
        const order = duplicatePayments[0]?.order;
        
        const issue: ReconciliationIssue = {
          type: "duplicate_payment",
          severity: "high",
          order_id: orderIdNum,
          order_number: order?.order_number,
          description: `Đơn hàng có nhiều hơn một bản ghi thanh toán`,
          expected_value: 1,
          actual_value: count,
          suggestion: `Xem xét và hợp nhất các bản ghi thanh toán trùng lặp`,
          auto_fixable: false,
        };
        issues.push(issue);
      }
    }

    // Check 5: Orphan payments (payments without valid orders)
    for (const payment of paymentsList) {
      if (!payment.order) {
        const issue: ReconciliationIssue = {
          type: "orphan_payment",
          severity: "medium",
          payment_id: payment.id,
          description: `Bản ghi thanh toán không có đơn hàng tương ứng`,
          expected_value: "Valid order reference",
          actual_value: "No order found",
          suggestion: `Kiểm tra và liên kết thanh toán với đơn hàng chính xác`,
          auto_fixable: false,
        };
        issues.push(issue);
      }
    }

    // 8. Calculate summary statistics
    const summary: ReconciliationSummary = {
      total_payments_checked: paymentsList.length,
      total_orders_checked: ordersList.length,
      total_issues_found: issues.length,
      issues_by_type: issues.reduce((acc, issue) => {
        acc[issue.type] = (acc[issue.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      issues_by_severity: issues.reduce((acc, issue) => {
        acc[issue.severity] = (acc[issue.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      total_amount_discrepancy: issues
        .filter(issue => issue.type === "amount_mismatch")
        .reduce((sum, issue) => {
          const expected = Number(issue.expected_value) || 0;
          const actual = Number(issue.actual_value) || 0;
          return sum + Math.abs(expected - actual);
        }, 0),
      auto_fixed_count: fixedIssues.length,
    };

    // 9. Create success message
    let message = `Đối soát thanh toán hoàn thành cho ngày ${date}. `;
    message += `Kiểm tra ${summary.total_payments_checked} thanh toán và ${summary.total_orders_checked} đơn hàng. `;
    
    if (summary.total_issues_found === 0) {
      message += `Không phát hiện vấn đề nào.`;
    } else {
      message += `Phát hiện ${summary.total_issues_found} vấn đề.`;
      if (summary.auto_fixed_count > 0) {
        message += ` Đã tự động sửa ${summary.auto_fixed_count} vấn đề.`;
      }
    }

    return {
      success: true,
      message,
      reconciliation: {
        date,
        summary,
        issues,
        fixed_issues: fixedIssues,
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
      error: "Đã xảy ra lỗi không mong muốn khi thực hiện đối soát thanh toán",
    };
  }
} 