"use server";

import { createClient } from "@/lib/supabase/server";
import { Payment } from "@/types/custom.types";
import { z } from "zod";

// Validation schema cho date range
const dateRangeSchema = z.object({
  startDate: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày bắt đầu không hợp lệ"),
  endDate: z.string().refine(date => !isNaN(Date.parse(date)), "Ngày kết thúc không hợp lệ"),
});

const getPaymentAnalyticsSchema = z.object({
  dateRange: dateRangeSchema,
  groupBy: z.enum(["day", "week", "month"]).optional().default("day"),
  includeComparison: z.boolean().optional().default(false), // So sánh với kỳ trước
});

type GetPaymentAnalyticsData = z.infer<typeof getPaymentAnalyticsSchema>;

// Analytics data types
type PaymentAnalyticsData = {
  date: string;
  total_payments: number;
  total_amount: number;
  completed_amount: number;
  failed_amount: number;
  success_rate: number;
  average_payment_value: number;
  payments_by_status: Record<string, number>;
  payments_by_method: Record<string, number>;
};

type ComparisonData = {
  total_payments_change: number;
  total_amount_change: number;
  completed_amount_change: number;
  success_rate_change: number;
  change_percentage: {
    payments: number;
    amount: number;
    completed_amount: number;
    success_rate: number;
  };
};

// Return type
type GetPaymentAnalyticsResult =
  | {
      success: true;
      analytics: {
        period: {
          start_date: string;
          end_date: string;
          group_by: "day" | "week" | "month";
        };
        summary: {
          total_payments: number;
          total_amount: number;
          completed_payments: number;
          completed_amount: number;
          failed_payments: number;
          failed_amount: number;
          pending_payments: number;
          pending_amount: number;
          refunded_payments: number;
          refunded_amount: number;
          success_rate: number;
          average_payment_value: number;
          payments_by_status: Record<string, number>;
          payments_by_method: Record<string, number>;
          top_payment_methods: Array<{
            method: string;
            count: number;
            amount: number;
            percentage: number;
          }>;
        };
        timeline: PaymentAnalyticsData[];
        comparison?: ComparisonData;
      };
    }
  | { success: false; error: string };

export async function getPaymentAnalytics(data: GetPaymentAnalyticsData): Promise<GetPaymentAnalyticsResult> {
  try {
    // 1. Validate input
    const { dateRange, groupBy, includeComparison } = getPaymentAnalyticsSchema.parse(data);

    // Validate date range logic
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);

    if (startDate > endDate) {
      return {
        success: false,
        error: "Ngày bắt đầu phải trước ngày kết thúc",
      };
    }

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
        error: "Bạn cần đăng nhập để xem thống kê thanh toán",
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
        error: "Bạn không có quyền xem thống kê thanh toán",
      };
    }

    // 4. Get payments data for the specified period
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .gte("created_at", dateRange.startDate)
      .lte("created_at", dateRange.endDate)
      .order("created_at", { ascending: true });

    if (paymentsError) {
      return {
        success: false,
        error: paymentsError.message || "Không thể lấy dữ liệu thanh toán",
      };
    }

    const paymentsList = payments || [];

    // 5. Calculate summary statistics
    const completedPayments = paymentsList.filter(p => p.status === 'completed');
    const failedPayments = paymentsList.filter(p => p.status === 'failed');
    const pendingPayments = paymentsList.filter(p => p.status === 'pending');
    const refundedPayments = paymentsList.filter(p => p.status === 'refunded');

    const summary = {
      total_payments: paymentsList.length,
      total_amount: paymentsList.reduce((sum, payment) => sum + Number(payment.amount), 0),
      completed_payments: completedPayments.length,
      completed_amount: completedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      failed_payments: failedPayments.length,
      failed_amount: failedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      pending_payments: pendingPayments.length,
      pending_amount: pendingPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      refunded_payments: refundedPayments.length,
      refunded_amount: refundedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      success_rate: paymentsList.length > 0 ? (completedPayments.length / paymentsList.length) * 100 : 0,
      average_payment_value: paymentsList.length > 0 
        ? paymentsList.reduce((sum, payment) => sum + Number(payment.amount), 0) / paymentsList.length 
        : 0,
      payments_by_status: paymentsList.reduce((acc, payment) => {
        acc[payment.status] = (acc[payment.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      payments_by_method: paymentsList.reduce((acc, payment) => {
        acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      top_payment_methods: [] as Array<{
        method: string;
        count: number;
        amount: number;
        percentage: number;
      }>,
    };

    // Calculate top payment methods
    const methodStats = paymentsList.reduce((acc, payment) => {
      const method = payment.payment_method;
      if (!acc[method]) {
        acc[method] = { count: 0, amount: 0 };
      }
      acc[method].count += 1;
      acc[method].amount += Number(payment.amount);
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);

    summary.top_payment_methods = Object.entries(methodStats)
      .map(([method, stats]) => ({
        method,
        count: stats.count,
        amount: stats.amount,
        percentage: paymentsList.length > 0 ? (stats.count / paymentsList.length) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 6. Generate timeline data grouped by specified period
    const timeline: PaymentAnalyticsData[] = [];
    
    // Helper function to format date based on groupBy
    const formatDateKey = (date: Date, groupBy: string): string => {
      switch (groupBy) {
        case "day":
          return date.toISOString().split('T')[0];
        case "week":
          const week = new Date(date);
          week.setDate(date.getDate() - date.getDay());
          return week.toISOString().split('T')[0];
        case "month":
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        default:
          return date.toISOString().split('T')[0];
      }
    };

    // Group payments by date period
    const groupedPayments = paymentsList.reduce((acc, payment) => {
      const dateKey = formatDateKey(new Date(payment.created_at), groupBy);
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(payment);
      return acc;
    }, {} as Record<string, Payment[]>);

    // Generate timeline entries
    Object.entries(groupedPayments).forEach(([dateKey, payments]) => {
      const completedInPeriod = payments.filter(p => p.status === 'completed');
      const failedInPeriod = payments.filter(p => p.status === 'failed');
      
      timeline.push({
        date: dateKey,
        total_payments: payments.length,
        total_amount: payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
        completed_amount: completedInPeriod.reduce((sum, payment) => sum + Number(payment.amount), 0),
        failed_amount: failedInPeriod.reduce((sum, payment) => sum + Number(payment.amount), 0),
        success_rate: payments.length > 0 ? (completedInPeriod.length / payments.length) * 100 : 0,
        average_payment_value: payments.length > 0 
          ? payments.reduce((sum, payment) => sum + Number(payment.amount), 0) / payments.length 
          : 0,
        payments_by_status: payments.reduce((acc, payment) => {
          acc[payment.status] = (acc[payment.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        payments_by_method: payments.reduce((acc, payment) => {
          acc[payment.payment_method] = (acc[payment.payment_method] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      });
    });

    // Sort timeline by date
    timeline.sort((a, b) => a.date.localeCompare(b.date));

    // 7. Calculate comparison data if requested
    let comparison: ComparisonData | undefined;
    
    if (includeComparison) {
      // Calculate previous period of same length
      const periodLength = endDate.getTime() - startDate.getTime();
      const previousStartDate = new Date(startDate.getTime() - periodLength);
      const previousEndDate = new Date(endDate.getTime() - periodLength);

      const { data: previousPayments, error: previousPaymentsError } = await supabase
        .from("payments")
        .select("*")
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString());

      if (!previousPaymentsError && previousPayments) {
        const previousCompleted = previousPayments.filter(p => p.status === 'completed');
        
        const previousSummary = {
          total_payments: previousPayments.length,
          total_amount: previousPayments.reduce((sum, payment) => sum + Number(payment.amount), 0),
          completed_amount: previousCompleted.reduce((sum, payment) => sum + Number(payment.amount), 0),
          success_rate: previousPayments.length > 0 ? (previousCompleted.length / previousPayments.length) * 100 : 0,
        };

        comparison = {
          total_payments_change: summary.total_payments - previousSummary.total_payments,
          total_amount_change: summary.total_amount - previousSummary.total_amount,
          completed_amount_change: summary.completed_amount - previousSummary.completed_amount,
          success_rate_change: summary.success_rate - previousSummary.success_rate,
          change_percentage: {
            payments: previousSummary.total_payments > 0 
              ? ((summary.total_payments - previousSummary.total_payments) / previousSummary.total_payments) * 100 
              : 0,
            amount: previousSummary.total_amount > 0 
              ? ((summary.total_amount - previousSummary.total_amount) / previousSummary.total_amount) * 100 
              : 0,
            completed_amount: previousSummary.completed_amount > 0 
              ? ((summary.completed_amount - previousSummary.completed_amount) / previousSummary.completed_amount) * 100 
              : 0,
            success_rate: previousSummary.success_rate > 0 
              ? ((summary.success_rate - previousSummary.success_rate) / previousSummary.success_rate) * 100 
              : 0,
          },
        };
      }
    }

    return {
      success: true,
      analytics: {
        period: {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
          group_by: groupBy,
        },
        summary,
        timeline,
        comparison,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy thống kê thanh toán",
    };
  }
} 