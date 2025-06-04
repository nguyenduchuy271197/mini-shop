"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho generate slug
const generateSlugSchema = z.object({
  text: z.string().min(1, "Văn bản là bắt buộc").max(200, "Văn bản không được vượt quá 200 ký tự"),
  type: z.enum(["product", "category"], {
    errorMap: () => ({ message: "Loại phải là 'product' hoặc 'category'" })
  }),
  forceUnique: z.boolean().optional().default(true),
});

type GenerateSlugResult =
  | { success: true; slug: string; originalSlug: string; isUnique: boolean }
  | { success: false; error: string };

export async function generateSlug(
  text: string,
  type: "product" | "category",
  forceUnique: boolean = true
): Promise<GenerateSlugResult> {
  try {
    // Validate input
    const validatedData = generateSlugSchema.parse({ text, type, forceUnique });

    const supabase = createClient();

    // Tạo slug cơ bản từ text
    const baseSlug = createBaseSlug(validatedData.text);
    
    if (!baseSlug) {
      return {
        success: false,
        error: "Không thể tạo slug từ văn bản đã cho",
      };
    }

    let finalSlug = baseSlug;
    let isUnique = true;

    // Kiểm tra uniqueness nếu được yêu cầu
    if (validatedData.forceUnique) {
      const { slug: uniqueSlug, isUnique: checkResult } = await ensureUniqueSlug(
        supabase,
        baseSlug,
        validatedData.type
      );
      finalSlug = uniqueSlug;
      isUnique = checkResult;
    }

    // Log slug generation
    console.log("Generated slug:", {
      originalText: validatedData.text,
      type: validatedData.type,
      originalSlug: baseSlug,
      finalSlug,
      isUnique,
    });

    return {
      success: true,
      slug: finalSlug,
      originalSlug: baseSlug,
      isUnique,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Generate slug error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi tạo slug",
    };
  }
}

// Helper function tạo slug cơ bản
function createBaseSlug(text: string): string {
  // Chuyển đổi tiếng Việt sang không dấu
  const vietnameseMap: Record<string, string> = {
    'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
    'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
    'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
    'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
    'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
    'đ': 'd',
    'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
    'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
    'Đ': 'D'
  };

  const slug = text
    .trim()
    .toLowerCase()
    // Thay thế ký tự tiếng Việt
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    // Thay thế ký tự đặc biệt bằng dấu gạch ngang
    .replace(/[^a-z0-9]+/g, '-')
    // Loại bỏ dấu gạch ngang ở đầu và cuối
    .replace(/^-+|-+$/g, '')
    // Thay thế nhiều dấu gạch ngang liên tiếp bằng một dấu
    .replace(/-+/g, '-');

  return slug;
}

// Helper function đảm bảo slug unique
async function ensureUniqueSlug(
  supabase: ReturnType<typeof createClient>,
  baseSlug: string,
  type: "product" | "category"
): Promise<{ slug: string; isUnique: boolean }> {
  const tableName = type === "product" ? "products" : "categories";
  let counter = 0;
  let currentSlug = baseSlug;
  let isUnique = true;

  // Kiểm tra slug hiện tại có tồn tại không
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select("id")
      .eq("slug", currentSlug)
      .limit(1);

    if (error) {
      console.error(`Error checking slug uniqueness in ${tableName}:`, error);
      break;
    }

    // Nếu không tìm thấy record nào, slug là unique
    if (!data || data.length === 0) {
      break;
    }

    // Nếu tìm thấy, thêm số vào cuối và thử lại
    counter++;
    currentSlug = `${baseSlug}-${counter}`;
    isUnique = false;

    // Giới hạn số lần thử để tránh infinite loop
    if (counter > 999) {
      currentSlug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return { slug: currentSlug, isUnique };
}

// Helper function validate slug format
export function validateSlugFormat(slug: string): { isValid: boolean; error?: string } {
  if (!slug || slug.length === 0) {
    return { isValid: false, error: "Slug không được để trống" };
  }

  if (slug.length > 100) {
    return { isValid: false, error: "Slug không được vượt quá 100 ký tự" };
  }

  // Kiểm tra format: chỉ chứa chữ thường, số, và dấu gạch ngang
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(slug)) {
    return { isValid: false, error: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang" };
  }

  // Không được bắt đầu hoặc kết thúc bằng dấu gạch ngang
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { isValid: false, error: "Slug không được bắt đầu hoặc kết thúc bằng dấu gạch ngang" };
  }

  // Không được có nhiều dấu gạch ngang liên tiếp
  if (slug.includes('--')) {
    return { isValid: false, error: "Slug không được có nhiều dấu gạch ngang liên tiếp" };
  }

  return { isValid: true };
} 