"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho send SMS
const sendSMSSchema = z.object({
  phoneNumber: z.string()
    .min(10, "Số điện thoại phải có ít nhất 10 chữ số")
    .max(15, "Số điện thoại không được vượt quá 15 chữ số")
    .regex(/^[+]?[0-9\s\-()]+$/, "Số điện thoại không hợp lệ"),
  message: z.string()
    .min(1, "Nội dung tin nhắn là bắt buộc")
    .max(320, "Nội dung tin nhắn không được vượt quá 320 ký tự"), // SMS limit
  templateId: z.string().optional(),
  templateData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
  sendAt: z.date().optional(), // Scheduled SMS
  trackDelivery: z.boolean().optional().default(true),
});

type SendSMSResult =
  | { 
      success: true; 
      message: string; 
      messageId: string;
      segments: number;
      cost: number;
      provider: string;
      scheduledFor?: string;
    }
  | { success: false; error: string };

export async function sendSMS(
  phoneNumber: string,
  message: string,
  options?: {
    templateId?: string;
    templateData?: Record<string, string | number | boolean>;
    priority?: "low" | "normal" | "high";
    sendAt?: Date;
    trackDelivery?: boolean;
  }
): Promise<SendSMSResult> {
  try {
    // Validate input
    const validatedData = sendSMSSchema.parse({ 
      phoneNumber, 
      message,
      ...options
    });

    const supabase = createClient();

    // Kiểm tra authentication (có thể optional tùy use case)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(validatedData.phoneNumber);
    
    if (!normalizedPhone.success) {
      return {
        success: false,
        error: normalizedPhone.error,
      };
    }

    // Prepare message content
    let finalMessage = validatedData.message;

    // Nếu sử dụng template
    if (validatedData.templateId) {
      const templateResult = await processSMSTemplate(
        validatedData.templateId,
        validatedData.templateData || {}
      );
      
      if (!templateResult.success) {
        return {
          success: false,
          error: `Lỗi xử lý template: ${templateResult.error}`,
        };
      }

      finalMessage = templateResult.message;
    }

    // Validate final message length
    if (finalMessage.length > 320) {
      return {
        success: false,
        error: "Nội dung tin nhắn sau khi xử lý template không được vượt quá 320 ký tự",
      };
    }

    // Calculate SMS segments và cost
    const segments = calculateSMSSegments(finalMessage);
    const estimatedCost = calculateSMSCost(segments, normalizedPhone.countryCode);

    // Check scheduling
    const isScheduled = validatedData.sendAt && validatedData.sendAt > new Date();

    // Rate limiting check (mock)
    const rateLimitCheck = await checkSMSRateLimit(user?.id, normalizedPhone.phone);
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        error: `Đã vượt quá giới hạn gửi SMS: ${rateLimitCheck.message}`,
      };
    }

    // Prepare SMS payload
    const smsPayload = {
      to: normalizedPhone.phone,
      message: finalMessage,
      priority: validatedData.priority,
      trackDelivery: validatedData.trackDelivery,
      sendAt: validatedData.sendAt,
      userId: user?.id,
    };

    // Send SMS via provider
    const smsResult = await sendSMSViaMockProvider(smsPayload);

    if (!smsResult.success) {
      return {
        success: false,
        error: `Lỗi gửi SMS: ${smsResult.error}`,
      };
    }

    // Log SMS sending
    const logData = {
      user_id: user?.id || null,
      phone_number: normalizedPhone.phone,
      message: finalMessage,
      template_id: validatedData.templateId || null,
      message_id: smsResult.messageId,
      provider: smsResult.provider,
      segments,
      cost: estimatedCost,
      status: isScheduled ? 'scheduled' : 'sent',
      sent_at: isScheduled ? null : new Date().toISOString(),
      scheduled_for: isScheduled ? validatedData.sendAt?.toISOString() : null,
    };

    console.log("SMS sent:", logData);

    // Store trong database (mock)
    Promise.resolve().then(() => {
      console.log("SMS log stored:", logData);
    });

    return {
      success: true,
      message: isScheduled 
        ? `Đã lên lịch gửi SMS đến ${normalizedPhone.phone}`
        : `Đã gửi SMS thành công đến ${normalizedPhone.phone}`,
      messageId: smsResult.messageId,
      segments,
      cost: estimatedCost,
      provider: smsResult.provider,
      scheduledFor: isScheduled ? validatedData.sendAt?.toISOString() : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Send SMS error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi gửi SMS",
    };
  }
}

// Helper function normalize phone number
function normalizePhoneNumber(phoneNumber: string): { 
  success: true; 
  phone: string; 
  countryCode: string 
} | { 
  success: false; 
  error: string 
} {
  try {
    // Remove all non-digit characters except +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');

    // Nếu bắt đầu bằng 0, thay thế bằng +84 (Vietnam)
    if (cleaned.startsWith('0')) {
      cleaned = '+84' + cleaned.substring(1);
    }

    // Nếu không bắt đầu bằng +, thêm +84
    if (!cleaned.startsWith('+')) {
      cleaned = '+84' + cleaned;
    }

    // Validate length
    if (cleaned.length < 12 || cleaned.length > 16) {
      return {
        success: false,
        error: "Độ dài số điện thoại không hợp lệ",
      };
    }

    // Extract country code
    let countryCode = '+84'; // Default Vietnam
    if (cleaned.startsWith('+84')) {
      countryCode = '+84';
    } else if (cleaned.startsWith('+1')) {
      countryCode = '+1';
    } else if (cleaned.startsWith('+852')) {
      countryCode = '+852';
    }
    // Add more country codes as needed

    return {
      success: true,
      phone: cleaned,
      countryCode,
    };
  } catch (normalizeError) {
    console.error("Normalize phone error:", normalizeError);
    return {
      success: false,
      error: "Lỗi khi chuẩn hóa số điện thoại",
    };
  }
}

// Helper function process SMS template
async function processSMSTemplate(
  templateId: string,
  templateData: Record<string, string | number | boolean>
): Promise<{ 
  success: true; 
  message: string;
} | { 
  success: false; 
  error: string 
}> {
  try {
    // Mock SMS templates
    const templates: Record<string, string> = {
      'otp': 'Mã xác thực của bạn là: {{code}}. Mã có hiệu lực trong {{expiry}} phút.',
      'order-confirmation': 'MiniShop: Đơn hàng #{{orderNumber}} đã được xác nhận. Tổng tiền: {{amount}}đ. Cảm ơn bạn!',
      'delivery-notification': 'MiniShop: Đơn hàng #{{orderNumber}} đang được giao. Dự kiến: {{estimatedTime}}. Theo dõi: {{trackingLink}}',
      'password-reset': 'MiniShop: Mã đặt lại mật khẩu của bạn là {{code}}. Có hiệu lực trong 10 phút.',
      'welcome': 'Chào mừng {{name}} đến với MiniShop! Cảm ơn bạn đã đăng ký. Hãy bắt đầu mua sắm ngay!'
    };

    const template = templates[templateId];
    if (!template) {
      return {
        success: false,
        error: `Template SMS "${templateId}" không tồn tại`,
      };
    }

    // Replace template variables
    let message = template;

    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value);
      message = message.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return {
      success: true,
      message,
    };
  } catch (error) {
    console.error("Process SMS template error:", error);
    return {
      success: false,
      error: "Lỗi xử lý template SMS",
    };
  }
}

// Helper function calculate SMS segments
function calculateSMSSegments(message: string): number {
  // Check if message contains non-GSM characters (tiếng Việt có dấu)
  const hasUnicode = /[^\x00-\x7F]/.test(message);
  
  if (hasUnicode) {
    // Unicode SMS: 70 characters per segment
    return Math.ceil(message.length / 70);
  } else {
    // GSM 7-bit: 160 characters per segment
    return Math.ceil(message.length / 160);
  }
}

// Helper function calculate SMS cost
function calculateSMSCost(segments: number, countryCode: string): number {
  // Mock pricing (VND)
  const pricing: Record<string, number> = {
    '+84': 500, // Vietnam: 500 VND per segment
    '+1': 1000,  // US: 1000 VND per segment
    '+852': 800, // Hong Kong: 800 VND per segment
  };

  const pricePerSegment = pricing[countryCode] || 1000; // Default price
  return segments * pricePerSegment;
}

// Helper function check SMS rate limit
async function checkSMSRateLimit(
  userId?: string,
  phoneNumber?: string
): Promise<{ allowed: true } | { allowed: false; message: string }> {
  try {
    // Mock rate limiting
    // Trong thực tế sẽ check với Redis hoặc database

    // Limit per user: 10 SMS per hour
    if (userId) {
      const userLimit = 10;
      const currentCount = Math.floor(Math.random() * 15); // Mock current count
      
      if (currentCount >= userLimit) {
        return {
          allowed: false,
          message: `Bạn đã gửi ${currentCount}/${userLimit} SMS trong giờ qua`,
        };
      }
    }

    // Limit per phone: 5 SMS per hour
    if (phoneNumber) {
      const phoneLimit = 5;
      const currentCount = Math.floor(Math.random() * 8); // Mock current count
      
      if (currentCount >= phoneLimit) {
        return {
          allowed: false,
          message: `Số điện thoại này đã nhận ${currentCount}/${phoneLimit} SMS trong giờ qua`,
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { allowed: true }; // Allow on error để không block service
  }
}

// Mock SMS provider
async function sendSMSViaMockProvider(smsPayload: {
  to: string;
  message: string;
  priority?: string;
  trackDelivery?: boolean;
  sendAt?: Date;
  userId?: string;
}): Promise<{ success: true; messageId: string; provider: string } | { success: false; error: string }> {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock message ID
    const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Simulate success/failure (98% success rate)
    const isSuccess = Math.random() > 0.02;

    if (!isSuccess) {
      return {
        success: false,
        error: "Mock SMS provider error: Invalid phone number",
      };
    }

    console.log("Mock SMS sent:", {
      messageId,
      to: smsPayload.to,
      message: smsPayload.message.substring(0, 50) + (smsPayload.message.length > 50 ? '...' : ''),
    });

    return {
      success: true,
      messageId,
      provider: "MockSMSProvider",
    };
  } catch {
    return {
      success: false,
      error: "Mock SMS provider connection error",
    };
  }
}

// Helper function get SMS status
export async function getSMSStatus(
  messageIdParam: string
): Promise<{ 
  success: true; 
  status: "sent" | "delivered" | "failed" | "pending";
  timestamp: string;
  errorCode?: string;
} | { 
  success: false; 
  error: string 
}> {
  try {
    console.log("Getting SMS status for message:", messageIdParam);
    
    // Mock SMS status tracking
    const statuses = ["sent", "delivered"] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      success: true,
      status: randomStatus,
      timestamp: new Date().toISOString(),
    };
  } catch (statusError) {
    console.error("Get SMS status error:", statusError);
    return {
      success: false,
      error: "Đã xảy ra lỗi khi lấy trạng thái SMS",
    };
  }
}

// Helper function send bulk SMS
export async function sendBulkSMS(
  phoneNumbers: string[],
  message: string,
  options?: {
    templateId?: string;
    templateData?: Record<string, string | number | boolean>;
    priority?: "low" | "normal" | "high";
    batchSize?: number;
  }
): Promise<{
  success: true;
  results: Array<{
    phoneNumber: string;
    messageId?: string;
    success: boolean;
    error?: string;
  }>;
  totalSent: number;
  totalFailed: number;
} | {
  success: false;
  error: string;
}> {
  try {
    const batchSize = options?.batchSize || 50;
    
    if (phoneNumbers.length > 1000) {
      return {
        success: false,
        error: "Không được gửi SMS cho quá 1000 số điện thoại cùng lúc",
      };
    }

    const results = [];
    let totalSent = 0;
    let totalFailed = 0;

    // Process in batches
    for (let i = 0; i < phoneNumbers.length; i += batchSize) {
      const batch = phoneNumbers.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (phone) => {
        const result = await sendSMS(phone, message, options);
        
        if (result.success) {
          totalSent++;
          return {
            phoneNumber: phone,
            messageId: result.messageId,
            success: true,
          };
        } else {
          totalFailed++;
          return {
            phoneNumber: phone,
            success: false,
            error: result.error,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Delay between batches để tránh rate limiting
      if (i + batchSize < phoneNumbers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      success: true,
      results,
      totalSent,
      totalFailed,
    };
  } catch (bulkError) {
    console.error("Send bulk SMS error:", bulkError);
    return {
      success: false,
      error: "Đã xảy ra lỗi khi gửi SMS hàng loạt",
    };
  }
} 