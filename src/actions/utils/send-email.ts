"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Email data type
export type EmailData = {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, string | number | boolean>;
  attachments?: Array<{
    filename: string;
    content: string; // Base64 encoded
    contentType: string;
  }>;
  priority?: "low" | "normal" | "high";
  replyTo?: string;
  from?: string;
};

// Validation schema cho send email
const sendEmailSchema = z.object({
  to: z.union([
    z.string().email("Email không hợp lệ"),
    z.array(z.string().email("Email không hợp lệ")).min(1, "Phải có ít nhất một người nhận")
  ]),
  cc: z.union([
    z.string().email("Email CC không hợp lệ"),
    z.array(z.string().email("Email CC không hợp lệ"))
  ]).optional(),
  bcc: z.union([
    z.string().email("Email BCC không hợp lệ"),
    z.array(z.string().email("Email BCC không hợp lệ"))
  ]).optional(),
  subject: z.string().min(1, "Chủ đề email là bắt buộc").max(200, "Chủ đề không được vượt quá 200 ký tự"),
  htmlContent: z.string().max(500000, "Nội dung HTML không được vượt quá 500KB").optional(),
  textContent: z.string().max(100000, "Nội dung text không được vượt quá 100KB").optional(),
  templateId: z.string().optional(),
  templateData: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  attachments: z.array(z.object({
    filename: z.string().min(1, "Tên file là bắt buộc"),
    content: z.string().min(1, "Nội dung file là bắt buộc"),
    contentType: z.string().min(1, "Content type là bắt buộc"),
  })).max(10, "Không được gửi quá 10 file đính kèm").optional(),
  priority: z.enum(["low", "normal", "high"]).optional().default("normal"),
  replyTo: z.string().email("Email reply-to không hợp lệ").optional(),
  from: z.string().email("Email từ không hợp lệ").optional(),
}).refine((data) => {
  return data.htmlContent || data.textContent || data.templateId;
}, {
  message: "Phải có ít nhất một trong: htmlContent, textContent, hoặc templateId",
  path: ["htmlContent"],
});

type SendEmailResult =
  | { 
      success: true; 
      message: string; 
      messageId: string;
      recipients: number;
      provider: string;
    }
  | { success: false; error: string };

export async function sendEmail(emailData: EmailData): Promise<SendEmailResult> {
  try {
    // Validate input
    const validatedData = sendEmailSchema.parse(emailData);

    const supabase = createClient();

    // Kiểm tra authentication (có thể optional tùy use case)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Chuẩn bị recipients
    const toEmails = Array.isArray(validatedData.to) ? validatedData.to : [validatedData.to];
    const ccEmails = validatedData.cc ? (Array.isArray(validatedData.cc) ? validatedData.cc : [validatedData.cc]) : [];
    const bccEmails = validatedData.bcc ? (Array.isArray(validatedData.bcc) ? validatedData.bcc : [validatedData.bcc]) : [];
    
    const totalRecipients = toEmails.length + ccEmails.length + bccEmails.length;

    // Kiểm tra giới hạn recipients
    if (totalRecipients > 100) {
      return {
        success: false,
        error: "Không được gửi email cho quá 100 người nhận cùng lúc",
      };
    }

    // Prepare email content
    let finalHtmlContent = validatedData.htmlContent;
    let finalTextContent = validatedData.textContent;

    // Nếu sử dụng template
    if (validatedData.templateId) {
      const templateResult = await processEmailTemplate(
        validatedData.templateId,
        validatedData.templateData || {}
      );
      
      if (!templateResult.success) {
        return {
          success: false,
          error: `Lỗi xử lý template: ${templateResult.error}`,
        };
      }

      finalHtmlContent = templateResult.htmlContent;
      finalTextContent = templateResult.textContent;
    }

    // Validate attachments size
    if (validatedData.attachments) {
      const totalSize = validatedData.attachments.reduce((sum, att) => {
        // Estimate base64 decoded size
        return sum + (att.content.length * 0.75);
      }, 0);

      if (totalSize > 25 * 1024 * 1024) { // 25MB limit
        return {
          success: false,
          error: "Tổng kích thước file đính kèm không được vượt quá 25MB",
        };
      }
    }

    // Prepare email payload cho provider
    const emailPayload = {
      from: validatedData.from || process.env.DEFAULT_FROM_EMAIL || "noreply@minishop.com",
      to: toEmails,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      bcc: bccEmails.length > 0 ? bccEmails : undefined,
      subject: validatedData.subject,
      html: finalHtmlContent,
      text: finalTextContent,
      attachments: validatedData.attachments,
      priority: validatedData.priority,
      replyTo: validatedData.replyTo,
      headers: {
        'X-Priority': validatedData.priority === 'high' ? '1' : validatedData.priority === 'low' ? '5' : '3',
        'X-Mailer': 'MiniShop Email Service',
      },
    };

    // Mock email sending - trong thực tế sẽ sử dụng SendGrid, AWS SES, Resend, etc.
    const mockResult = await sendEmailViaMockProvider(emailPayload);

    if (!mockResult.success) {
      return {
        success: false,
        error: `Lỗi gửi email: ${mockResult.error}`,
      };
    }

    // Log email sending
    const logData = {
      user_id: user?.id || null,
      to_emails: toEmails,
      cc_emails: ccEmails,
      bcc_emails: bccEmails,
      subject: validatedData.subject,
      template_id: validatedData.templateId || null,
      message_id: mockResult.messageId,
      provider: mockResult.provider,
      status: 'sent',
      sent_at: new Date().toISOString(),
    };

    console.log("Email sent:", logData);

    // Store trong database (mock)
    // Trong thực tế sẽ insert vào email_logs table
    Promise.resolve().then(() => {
      console.log("Email log stored:", logData);
    });

    return {
      success: true,
      message: `Đã gửi email thành công đến ${totalRecipients} người nhận`,
      messageId: mockResult.messageId,
      recipients: totalRecipients,
      provider: mockResult.provider,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Send email error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi gửi email",
    };
  }
}

// Helper function process email template
async function processEmailTemplate(
  templateId: string,
  templateData: Record<string, string | number | boolean>
): Promise<{ 
  success: true; 
  htmlContent: string; 
  textContent: string 
} | { 
  success: false; 
  error: string 
}> {
  try {
    // Mock email templates
    const templates: Record<string, { html: string; text: string; subject: string }> = {
      'welcome': {
        html: `
          <h1>Chào mừng {{name}} đến với MiniShop!</h1>
          <p>Cảm ơn bạn đã đăng ký tài khoản. Email của bạn là: {{email}}</p>
          <p>Chúc bạn có trải nghiệm mua sắm tuyệt vời!</p>
        `,
        text: `Chào mừng {{name}} đến với MiniShop! Cảm ơn bạn đã đăng ký tài khoản. Email của bạn là: {{email}}`,
        subject: 'Chào mừng đến với MiniShop'
      },
      'order-confirmation': {
        html: `
          <h1>Xác nhận đơn hàng #{{orderNumber}}</h1>
          <p>Xin chào {{customerName}},</p>
          <p>Đơn hàng của bạn đã được xác nhận với tổng giá trị: {{totalAmount}}đ</p>
          <p>Chúng tôi sẽ liên hệ với bạn sớm nhất để giao hàng.</p>
        `,
        text: `Xác nhận đơn hàng #{{orderNumber}}. Xin chào {{customerName}}, đơn hàng của bạn đã được xác nhận với tổng giá trị: {{totalAmount}}đ`,
        subject: 'Xác nhận đơn hàng #{{orderNumber}}'
      },
      'password-reset': {
        html: `
          <h1>Đặt lại mật khẩu</h1>
          <p>Xin chào {{name}},</p>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào liên kết bên dưới để đặt lại:</p>
          <a href="{{resetLink}}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none;">Đặt lại mật khẩu</a>
          <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        `,
        text: `Đặt lại mật khẩu. Xin chào {{name}}, bạn đã yêu cầu đặt lại mật khẩu. Truy cập: {{resetLink}} để đặt lại. Liên kết này sẽ hết hạn sau 1 giờ.`,
        subject: 'Đặt lại mật khẩu'
      }
    };

    const template = templates[templateId];
    if (!template) {
      return {
        success: false,
        error: `Template "${templateId}" không tồn tại`,
      };
    }

    // Replace template variables
    let htmlContent = template.html;
    let textContent = template.text;

    Object.entries(templateData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), stringValue);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return {
      success: true,
      htmlContent,
      textContent,
    };
  } catch (error) {
    console.error("Process email template error:", error);
    return {
      success: false,
      error: "Lỗi xử lý template email",
    };
  }
}

// Mock email provider
async function sendEmailViaMockProvider(emailPayload: {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
  priority?: string;
  replyTo?: string;
  headers?: Record<string, string>;
}): Promise<{ success: true; messageId: string; provider: string } | { success: false; error: string }> {
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    // Simulate success/failure (95% success rate)
    const isSuccess = Math.random() > 0.05;

    if (!isSuccess) {
      return {
        success: false,
        error: "Mock provider error: Rate limit exceeded",
      };
    }

    console.log("Mock email sent:", {
      messageId,
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
    });

    return {
      success: true,
      messageId,
      provider: "MockEmailProvider",
    };
  } catch (mockError) {
    console.error("Mock provider error:", mockError);
    return {
      success: false,
      error: "Mock provider connection error",
    };
  }
}

// Helper function get email status
export async function getEmailStatus(
  messageIdParam: string
): Promise<{ 
  success: true; 
  status: "sent" | "delivered" | "bounced" | "spam" | "opened" | "clicked";
  timestamp: string;
} | { 
  success: false; 
  error: string 
}> {
  try {
    console.log("Getting email status for message:", messageIdParam);
    
    // Mock email status tracking
    const statuses = ["sent", "delivered", "opened"] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      success: true,
      status: randomStatus,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Get email status error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi khi lấy trạng thái email",
    };
  }
} 