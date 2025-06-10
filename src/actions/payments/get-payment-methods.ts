"use server";

import { z } from "zod";

// Validation schema
const getPaymentMethodsSchema = z.object({
  amount: z.number().positive("Số tiền phải lớn hơn 0").optional(),
  currency: z.string().optional().default("VND"),
});

const getPaymentMethodDetailsSchema = z.object({
  method: z.enum(["vnpay", "cod", "stripe"], {
    required_error: "Phương thức thanh toán là bắt buộc",
  }),
});

const isPaymentMethodAvailableSchema = z.object({
  method: z.enum(["vnpay", "cod", "stripe"], {
    required_error: "Phương thức thanh toán là bắt buộc",
  }),
  amount: z.number().positive("Số tiền phải lớn hơn 0"),
});

type GetPaymentMethodsData = z.infer<typeof getPaymentMethodsSchema>;
type GetPaymentMethodDetailsData = z.infer<typeof getPaymentMethodDetailsSchema>;
type IsPaymentMethodAvailableData = z.infer<typeof isPaymentMethodAvailableSchema>;

// Payment method info
type PaymentMethodInfo = {
  id: string;
  name: string;
  display_name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  fee_percentage: number;
  fixed_fee: number;
  processing_time: string;
  is_active: boolean;
  supports_refund: boolean;
  supported_currencies: string[];
  icon_url?: string;
  instructions?: string;
};

// Return types
type GetPaymentMethodsResult =
  | { success: true; methods: PaymentMethodInfo[] }
  | { success: false; error: string };

type GetPaymentMethodDetailsResult =
  | { success: true; method: PaymentMethodInfo }
  | { success: false; error: string };

type IsPaymentMethodAvailableResult =
  | { success: true; available: boolean; reason?: string }
  | { success: false; error: string };

type GetRecommendedPaymentMethodsResult =
  | { success: true; recommended: PaymentMethodInfo[]; other: PaymentMethodInfo[] }
  | { success: false; error: string };

export async function getAvailablePaymentMethods(data?: GetPaymentMethodsData): Promise<GetPaymentMethodsResult> {
  try {
    // 1. Validate input
    const { amount, currency } = data 
      ? getPaymentMethodsSchema.parse(data) 
      : { amount: undefined, currency: "VND" };

    // 2. Get all payment methods
    const allMethods = getAllPaymentMethods();

    // 3. Filter methods based on amount if provided
    let availableMethods = allMethods.filter(method => method.is_active);

    if (amount) {
      availableMethods = availableMethods.filter(method => 
        amount >= method.min_amount && amount <= method.max_amount
      );
    }

    // 4. Filter by currency
    availableMethods = availableMethods.filter(method => 
      method.supported_currencies.includes(currency)
    );

    return {
      success: true,
      methods: availableMethods,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy danh sách phương thức thanh toán",
    };
  }
}

export async function getPaymentMethodDetails(data: GetPaymentMethodDetailsData): Promise<GetPaymentMethodDetailsResult> {
  try {
    // 1. Validate input
    const { method } = getPaymentMethodDetailsSchema.parse(data);

    // 2. Get method details
    const allMethods = getAllPaymentMethods();
    const methodDetails = allMethods.find(m => m.id === method);

    if (!methodDetails) {
      return {
        success: false,
        error: "Không tìm thấy phương thức thanh toán",
      };
    }

    return {
      success: true,
      method: methodDetails,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy thông tin phương thức thanh toán",
    };
  }
}

export async function isPaymentMethodAvailable(data: IsPaymentMethodAvailableData): Promise<IsPaymentMethodAvailableResult> {
  try {
    // 1. Validate input
    const { method, amount } = isPaymentMethodAvailableSchema.parse(data);

    // 2. Get method details
    const allMethods = getAllPaymentMethods();
    const methodDetails = allMethods.find(m => m.id === method);

    if (!methodDetails) {
      return {
        success: true,
        available: false,
        reason: "Phương thức thanh toán không tồn tại",
      };
    }

    if (!methodDetails.is_active) {
      return {
        success: true,
        available: false,
        reason: "Phương thức thanh toán hiện không khả dụng",
      };
    }

    if (amount < methodDetails.min_amount) {
      return {
        success: true,
        available: false,
        reason: `Số tiền tối thiểu là ${methodDetails.min_amount.toLocaleString('vi-VN')}₫`,
      };
    }

    if (amount > methodDetails.max_amount) {
      return {
        success: true,
        available: false,
        reason: `Số tiền tối đa là ${methodDetails.max_amount.toLocaleString('vi-VN')}₫`,
      };
    }

    return {
      success: true,
      available: true,
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
      error: "Đã xảy ra lỗi không mong muốn khi kiểm tra phương thức thanh toán",
    };
  }
}

export async function getRecommendedPaymentMethods(data?: GetPaymentMethodsData): Promise<GetRecommendedPaymentMethodsResult> {
  try {
    // 1. Get available methods
    const result = await getAvailablePaymentMethods(data);
    
    if (!result.success) {
      return result;
    }

    const { amount } = data 
      ? getPaymentMethodsSchema.parse(data) 
      : { amount: undefined };

    // 2. Sort methods by recommendation score
    const scoredMethods = result.methods.map(method => ({
      ...method,
      score: calculateRecommendationScore(method, amount),
    }));

    scoredMethods.sort((a, b) => b.score - a.score);

    // 3. Split into recommended (top 2) and other methods
    const recommended = scoredMethods.slice(0, 2).map(({ id, name, display_name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time, is_active, supports_refund, supported_currencies, icon_url, instructions }) => ({
      id, name, display_name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time, is_active, supports_refund, supported_currencies, icon_url, instructions
    }));
    const other = scoredMethods.slice(2).map(({ id, name, display_name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time, is_active, supports_refund, supported_currencies, icon_url, instructions }) => ({
      id, name, display_name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time, is_active, supports_refund, supported_currencies, icon_url, instructions
    }));

    return {
      success: true,
      recommended,
      other,
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
      error: "Đã xảy ra lỗi không mong muốn khi lấy gợi ý phương thức thanh toán",
    };
  }
}

/**
 * Get all payment methods configuration
 */
function getAllPaymentMethods(): PaymentMethodInfo[] {
  return [
    {
      id: "vnpay",
      name: "VNPay",
      display_name: "VNPay QR Code",
      description: "Thanh toán qua VNPay bằng QR Code hoặc Internet Banking",
      min_amount: 10000, // 10,000 VND
      max_amount: 500000000, // 500M VND
      fee_percentage: 0.01, // 1%
      fixed_fee: 0,
      processing_time: "Tức thì",
      is_active: true,
      supports_refund: true,
      supported_currencies: ["VND"],
      icon_url: "/icons/vnpay.svg",
      instructions: "Quét mã QR hoặc đăng nhập Internet Banking để thanh toán",
    },
    {
      id: "stripe",
      name: "Stripe",
      display_name: "Thẻ tín dụng/ghi nợ",
      description: "Thanh toán bằng thẻ Visa, Mastercard, American Express",
      min_amount: 10000, // 10,000 VND
      max_amount: 500000000, // 500M VND
      fee_percentage: 0.029, // 2.9% + 30¢
      fixed_fee: 0,
      processing_time: "Tức thì",
      is_active: true,
      supports_refund: true,
      supported_currencies: ["VND"],
      icon_url: "/icons/stripe.svg",
      instructions: "Thanh toán an toàn với thẻ tín dụng/ghi nợ",
    },
    {
      id: "cod",
      name: "COD",
      display_name: "Thanh toán khi nhận hàng",
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      min_amount: 50000, // 50,000 VND
      max_amount: 10000000, // 10M VND
      fee_percentage: 0.01, // 1%
      fixed_fee: 15000, // 15,000 VND
      processing_time: "Khi giao hàng",
      is_active: true,
      supports_refund: false,
      supported_currencies: ["VND"],
      icon_url: "/icons/cod.svg",
      instructions: "Chuẩn bị tiền mặt để thanh toán khi nhận hàng",
    },
  ];
}

/**
 * Calculate recommendation score for payment method
 */
function calculateRecommendationScore(method: PaymentMethodInfo, amount?: number): number {
  let score = 0;

  // Base score for each method
  const baseScores: Record<string, number> = {
    stripe: 85,
    vnpay: 80,
    cod: 50,
  };

  score += baseScores[method.id] || 0;

  // Amount-based scoring
  if (amount) {
    // Prefer lower fee methods for higher amounts
    const totalFee = amount * method.fee_percentage + method.fixed_fee;
    const feePercentage = totalFee / amount;
    
    if (feePercentage < 0.01) score += 20; // Less than 1% fee
    else if (feePercentage < 0.02) score += 10; // Less than 2% fee
    else if (feePercentage > 0.03) score -= 10; // More than 3% fee

    // Prefer instant payment for higher amounts
    if (amount > 1000000 && method.processing_time === "Tức thì") {
      score += 15;
    }

    // Prefer COD for smaller amounts
    if (amount < 500000 && method.id === "cod") {
      score += 10;
    }
  }

  // Prefer methods that support refund
  if (method.supports_refund) {
    score += 10;
  }

  // Prefer faster processing
  if (method.processing_time === "Tức thì") {
    score += 15;
  }

  return score;
} 