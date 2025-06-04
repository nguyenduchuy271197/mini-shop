"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho validate SKU
const validateSKUSchema = z.object({
  sku: z.string().min(1, "SKU là bắt buộc").max(50, "SKU không được vượt quá 50 ký tự"),
  productId: z.number().int().positive().optional(),
});

type ValidateSKUResult =
  | { 
      success: true; 
      isValid: boolean; 
      isUnique: boolean; 
      formatErrors: string[];
      existingProduct?: { id: number; name: string; sku: string };
    }
  | { success: false; error: string };

export async function validateSKU(
  sku: string,
  productId?: number
): Promise<ValidateSKUResult> {
  try {
    // Validate input
    const validatedData = validateSKUSchema.parse({ sku, productId });

    const supabase = createClient();

    const trimmedSKU = validatedData.sku.trim().toUpperCase();
    const formatErrors: string[] = [];

    // 1. Kiểm tra format SKU
    const formatValidation = validateSKUFormat(trimmedSKU);
    if (!formatValidation.isValid) {
      formatErrors.push(...formatValidation.errors);
    }

    // 2. Kiểm tra uniqueness trong database
    let isUnique = true;
    let existingProduct: { id: number; name: string; sku: string } | undefined;

    if (formatValidation.isValid) {
      let query = supabase
        .from("products")
        .select("id, name, sku")
        .eq("sku", trimmedSKU);

      // Nếu đang update product, loại trừ chính product đó
      if (validatedData.productId) {
        query = query.neq("id", validatedData.productId);
      }

      const { data: existingProducts, error } = await query;

      if (error) {
        console.error("SKU uniqueness check error:", error);
        return {
          success: false,
          error: "Lỗi khi kiểm tra tính duy nhất của SKU",
        };
      }

      if (existingProducts && existingProducts.length > 0) {
        // Filter out products with null SKU (shouldn't happen since we're querying by SKU)
        const validProducts = existingProducts.filter(p => p.sku !== null);
        if (validProducts.length > 0) {
          isUnique = false;
          existingProduct = validProducts[0] as { id: number; name: string; sku: string };
        }
      }
    }

    const isValid = formatErrors.length === 0;

    return {
      success: true,
      isValid,
      isUnique,
      formatErrors,
      existingProduct,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Validate SKU error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi validate SKU",
    };
  }
}

// Helper function validate SKU format
function validateSKUFormat(sku: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Kiểm tra độ dài
  if (sku.length < 3) {
    errors.push("SKU phải có ít nhất 3 ký tự");
  }

  if (sku.length > 50) {
    errors.push("SKU không được vượt quá 50 ký tự");
  }

  // Kiểm tra ký tự hợp lệ: chữ cái, số, dấu gạch ngang, gạch dưới
  const validSKURegex = /^[A-Z0-9\-_]+$/;
  if (!validSKURegex.test(sku)) {
    errors.push("SKU chỉ được chứa chữ cái in hoa, số, dấu gạch ngang (-) và gạch dưới (_)");
  }

  // Không được bắt đầu hoặc kết thúc bằng dấu gạch ngang hoặc gạch dưới
  if (sku.startsWith('-') || sku.startsWith('_') || sku.endsWith('-') || sku.endsWith('_')) {
    errors.push("SKU không được bắt đầu hoặc kết thúc bằng dấu gạch ngang hoặc gạch dưới");
  }

  // Không được có nhiều dấu gạch liên tiếp
  if (sku.includes('--') || sku.includes('__') || sku.includes('-_') || sku.includes('_-')) {
    errors.push("SKU không được có nhiều dấu gạch liên tiếp");
  }

  // Kiểm tra các pattern phổ biến (optional - có thể tùy chỉnh theo business rules)
  const recommendedPatterns = [
    /^[A-Z]{2,}-[A-Z0-9]{3,}$/, // VD: AB-123, CD-456A
    /^[A-Z]{3,}[0-9]{3,}$/, // VD: ABC123, DEFG456
    /^[A-Z]{2,}_[A-Z0-9]{3,}$/, // VD: AB_123, CD_456A
  ];

  const hasRecommendedPattern = recommendedPatterns.some(pattern => pattern.test(sku));
  
  // Không throw error cho pattern, chỉ warning
  if (!hasRecommendedPattern && errors.length === 0) {
    // Có thể log warning nhưng không fail validation
    console.log(`SKU "${sku}" doesn't follow recommended patterns but is still valid`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Helper function generate SKU suggestion
export async function generateSKUSuggestion(
  productName: string,
  categoryName?: string,
  brand?: string
): Promise<{ success: true; suggestions: string[] } | { success: false; error: string }> {
  try {
    const suggestions: string[] = [];
    
    // Tạo base từ tên sản phẩm
    const cleanName = productName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);

    // Pattern 1: Sử dụng tên sản phẩm + số random
    for (let i = 0; i < 3; i++) {
      const randomNum = Math.floor(Math.random() * 900) + 100;
      suggestions.push(`${cleanName}-${randomNum}`);
    }

    // Pattern 2: Sử dụng brand + tên sản phẩm
    if (brand) {
      const cleanBrand = brand
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 3);
      
      for (let i = 0; i < 2; i++) {
        const randomNum = Math.floor(Math.random() * 900) + 100;
        suggestions.push(`${cleanBrand}-${cleanName.substring(0, 4)}-${randomNum}`);
      }
    }

    // Pattern 3: Sử dụng category + tên sản phẩm
    if (categoryName) {
      const cleanCategory = categoryName
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 3);
      
      for (let i = 0; i < 2; i++) {
        const randomNum = Math.floor(Math.random() * 900) + 100;
        suggestions.push(`${cleanCategory}_${cleanName.substring(0, 4)}_${randomNum}`);
      }
    }

    // Pattern 4: Timestamp-based
    const timestamp = Date.now().toString().slice(-6);
    suggestions.push(`${cleanName.substring(0, 4)}-${timestamp}`);

    // Remove duplicates và giới hạn
    const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, 8);

    return {
      success: true,
      suggestions: uniqueSuggestions,
    };
  } catch (error) {
    console.error("Generate SKU suggestion error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi khi tạo gợi ý SKU",
    };
  }
}

// Helper function check SKU availability in bulk
export async function checkSKUAvailability(
  skus: string[]
): Promise<{ 
  success: true; 
  availability: Array<{ sku: string; isAvailable: boolean; existingProduct?: { id: number; name: string } }> 
} | { success: false; error: string }> {
  try {
    const supabase = createClient();

    const normalizedSKUs = skus.map(sku => sku.trim().toUpperCase());

    const { data: existingProducts, error } = await supabase
      .from("products")
      .select("id, name, sku")
      .in("sku", normalizedSKUs);

    if (error) {
      console.error("Bulk SKU availability check error:", error);
      return {
        success: false,
        error: "Lỗi khi kiểm tra availability của SKUs",
      };
    }

    const existingMap = new Map(
      existingProducts?.map(product => [product.sku, { id: product.id, name: product.name }]) || []
    );

    const availability = normalizedSKUs.map(sku => ({
      sku,
      isAvailable: !existingMap.has(sku),
      existingProduct: existingMap.get(sku),
    }));

    return {
      success: true,
      availability,
    };
  } catch (error) {
    console.error("Check SKU availability error:", error);
    return {
      success: false,
      error: "Đã xảy ra lỗi khi kiểm tra availability của SKUs",
    };
  }
} 