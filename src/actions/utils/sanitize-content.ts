"use server";

import { z } from "zod";

// Validation schema cho sanitize content
const sanitizeContentSchema = z.object({
  content: z.string().max(100000, "Nội dung không được vượt quá 100.000 ký tự"),
  options: z.object({
    allowedTags: z.array(z.string()).optional(),
    allowedAttributes: z.record(z.string(), z.array(z.string())).optional(),
    removeScripts: z.boolean().optional().default(true),
    removeStyles: z.boolean().optional().default(false),
    allowLinks: z.boolean().optional().default(true),
    allowImages: z.boolean().optional().default(true),
    maxLength: z.number().int().positive().optional(),
  }).optional().default({}),
});

type SanitizeContentResult =
  | { 
      success: true; 
      sanitizedContent: string; 
      removedElements: string[];
      warnings: string[];
      originalLength: number;
      sanitizedLength: number;
    }
  | { success: false; error: string };

export async function sanitizeContent(
  content: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
    removeScripts?: boolean;
    removeStyles?: boolean;
    allowLinks?: boolean;
    allowImages?: boolean;
    maxLength?: number;
  }
): Promise<SanitizeContentResult> {
  try {
    // Validate input
    const validatedData = sanitizeContentSchema.parse({ content, options });

    const originalLength = validatedData.content.length;
    const removedElements: string[] = [];
    const warnings: string[] = [];

    let sanitizedContent = validatedData.content;

    // Default allowed tags
    const defaultAllowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'span', 'div'
    ];

    const allowedTags = validatedData.options.allowedTags || defaultAllowedTags;

    // Add conditional tags
    if (validatedData.options.allowLinks) {
      allowedTags.push('a');
    }
    if (validatedData.options.allowImages) {
      allowedTags.push('img');
    }

    // Default allowed attributes for logging purposes
    const defaultAllowedAttributes = {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'p': ['class'],
      'div': ['class'],
      'span': ['class'],
      'h1': ['class'],
      'h2': ['class'],
      'h3': ['class'],
      'h4': ['class'],
      'h5': ['class'],
      'h6': ['class'],
    };

    // Log for potential future use
    console.log("Default allowed attributes configured:", Object.keys(defaultAllowedAttributes));

    // 1. Remove script tags và nội dung
    if (validatedData.options.removeScripts) {
      const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
      const scriptMatches = sanitizedContent.match(scriptRegex);
      if (scriptMatches) {
        removedElements.push(...scriptMatches.map(() => 'script'));
        sanitizedContent = sanitizedContent.replace(scriptRegex, '');
      }
    }

    // 2. Remove style tags nếu được yêu cầu
    if (validatedData.options.removeStyles) {
      const styleRegex = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
      const styleMatches = sanitizedContent.match(styleRegex);
      if (styleMatches) {
        removedElements.push(...styleMatches.map(() => 'style'));
        sanitizedContent = sanitizedContent.replace(styleRegex, '');
      }
    }

    // 3. Remove dangerous attributes
    const dangerousAttributes = [
      'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
      'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
      'javascript:', 'vbscript:', 'data:', 'about:', 'mocha:'
    ];

    dangerousAttributes.forEach(attr => {
      const attrRegex = new RegExp(`\\s${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
      if (attrRegex.test(sanitizedContent)) {
        removedElements.push(`${attr} attribute`);
        sanitizedContent = sanitizedContent.replace(attrRegex, '');
      }
    });

    // 4. Apply max length nếu được set
    if (validatedData.options.maxLength && sanitizedContent.length > validatedData.options.maxLength) {
      sanitizedContent = sanitizedContent.substring(0, validatedData.options.maxLength);
      warnings.push(`Content truncated to ${validatedData.options.maxLength} characters`);
    }

    const sanitizedLength = sanitizedContent.length;

    console.log("Content sanitized:", {
      originalLength,
      sanitizedLength,
      removedElements: removedElements.length,
      warnings: warnings.length,
    });

    return {
      success: true,
      sanitizedContent,
      removedElements: Array.from(new Set(removedElements)), // Remove duplicates
      warnings,
      originalLength,
      sanitizedLength,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Sanitize content error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi sanitize nội dung",
    };
  }
} 