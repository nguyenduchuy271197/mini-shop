"use server";

import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/custom.types";
import { z } from "zod";

// Validation schema
const importProductsSchema = z.object({
  csvData: z.string().min(1, "Dữ liệu CSV không được để trống"),
  overwrite: z.boolean().optional().default(false),
  validateOnly: z.boolean().optional().default(false),
});

type ImportProductsData = z.infer<typeof importProductsSchema>;

// CSV row schema
const csvRowSchema = z.object({
  name: z.string().min(3, "Tên sản phẩm phải có ít nhất 3 ký tự"),
  slug: z.string().min(3, "Slug phải có ít nhất 3 ký tự").regex(/^[a-z0-9-]+$/, "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"),
  description: z.string().optional(),
  short_description: z.string().optional(),
  sku: z.string().optional(),
  price: z.string().transform((val) => {
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) throw new Error("Giá phải là số dương");
    return num;
  }),
  compare_price: z.string().optional().transform((val) => {
    if (!val || val === "") return undefined;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) throw new Error("Giá so sánh phải là số dương");
    return num;
  }),
  cost_price: z.string().optional().transform((val) => {
    if (!val || val === "") return undefined;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) throw new Error("Giá gốc phải là số dương");
    return num;
  }),
  stock_quantity: z.string().optional().transform((val) => {
    if (!val || val === "") return 0;
    const num = parseInt(val);
    if (isNaN(num) || num < 0) throw new Error("Số lượng tồn kho phải là số không âm");
    return num;
  }),
  low_stock_threshold: z.string().optional().transform((val) => {
    if (!val || val === "") return 10;
    const num = parseInt(val);
    if (isNaN(num) || num < 0) throw new Error("Ngưỡng tồn kho thấp phải là số không âm");
    return num;
  }),
  category_id: z.string().optional().transform((val) => {
    if (!val || val === "") return undefined;
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) throw new Error("ID danh mục phải là số dương");
    return num;
  }),
  brand: z.string().optional(),
  weight: z.string().optional().transform((val) => {
    if (!val || val === "") return undefined;
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) throw new Error("Trọng lượng phải là số dương");
    return num;
  }),
  images: z.string().optional().transform((val) => {
    if (!val || val === "") return [];
    return val.split("|").map(url => url.trim()).filter(url => url.length > 0);
  }),
  tags: z.string().optional().transform((val) => {
    if (!val || val === "") return [];
    return val.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
  }),
  is_active: z.string().optional().transform((val) => {
    if (!val || val === "") return true;
    return val.toLowerCase() === "true" || val === "1";
  }),
  is_featured: z.string().optional().transform((val) => {
    if (!val || val === "") return false;
    return val.toLowerCase() === "true" || val === "1";
  }),
});

type CSVRow = z.infer<typeof csvRowSchema>;

// Return type
type ImportProductsResult =
  | {
      success: true;
      message: string;
      imported: number;
      updated: number;
      skipped: number;
      errors: string[];
      products?: Product[];
    }
  | { success: false; error: string };

export async function importProductsFromCSV(data: ImportProductsData): Promise<ImportProductsResult> {
  try {
    // 1. Validate input
    const { csvData, overwrite, validateOnly } = importProductsSchema.parse(data);

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
        error: "Bạn cần đăng nhập để nhập sản phẩm",
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
        error: "Bạn không có quyền nhập sản phẩm",
      };
    }

    // 4. Parse CSV data
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        error: "File CSV phải có ít nhất 2 dòng (header và 1 dòng dữ liệu)",
      };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const requiredHeaders = ['name', 'slug', 'price'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Thiếu các cột bắt buộc trong CSV: ${missingHeaders.join(", ")}`,
      };
    }

    // 5. Parse rows
    const rows: CSVRow[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const rowData: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || "";
        });

        const parsedRow = csvRowSchema.parse(rowData);
        rows.push(parsedRow);
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Dòng ${i + 1}: ${error.errors[0].message}`);
        } else {
          errors.push(`Dòng ${i + 1}: Lỗi phân tích dữ liệu`);
        }
      }
    }

    if (errors.length > 0 && !validateOnly) {
      return {
        success: false,
        error: `Có lỗi trong CSV:\n${errors.join('\n')}`,
      };
    }

    // If validation only, return results
    if (validateOnly) {
      return {
        success: true,
        message: `Đã xác thực ${rows.length} sản phẩm. ${errors.length > 0 ? `Có ${errors.length} lỗi.` : 'Không có lỗi.'}`,
        imported: 0,
        updated: 0,
        skipped: rows.length,
        errors,
      };
    }

    // 6. Get existing products to check for duplicates
    const slugs = rows.map(row => row.slug);
    const skus = rows.filter(row => row.sku).map(row => row.sku!);
    
    const { data: existingProducts, error: fetchError } = await supabase
      .from("products")
      .select("id, slug, sku")
      .or(`slug.in.(${slugs.join(",")}),sku.in.(${skus.join(",")})`);

    if (fetchError) {
      console.error("Error fetching existing products:", fetchError);
    }

    const existingBySlug = new Map(existingProducts?.map(p => [p.slug, p]) || []);
    const existingBySku = new Map(existingProducts?.filter(p => p.sku).map(p => [p.sku, p]) || []);

    // 7. Get valid categories
    const categoryIds = Array.from(new Set(rows.filter(row => row.category_id).map(row => row.category_id!)));
    let validCategories = new Set<number>();
    
    if (categoryIds.length > 0) {
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("id")
        .in("id", categoryIds)
        .eq("is_active", true);

      if (!categoriesError && categories) {
        validCategories = new Set(categories.map(c => c.id));
      }
    }

    // 8. Process rows
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    const processedProducts: Product[] = [];

    for (const row of rows) {
      try {
        // Validate category if provided
        if (row.category_id && !validCategories.has(row.category_id)) {
          errors.push(`Sản phẩm "${row.name}": Danh mục ID ${row.category_id} không tồn tại hoặc không hoạt động`);
          skipped++;
          continue;
        }

        // Validate price logic
        if (row.compare_price && row.compare_price <= row.price) {
          errors.push(`Sản phẩm "${row.name}": Giá so sánh phải lớn hơn giá bán`);
          skipped++;
          continue;
        }

        if (row.cost_price && row.cost_price >= row.price) {
          errors.push(`Sản phẩm "${row.name}": Giá gốc phải nhỏ hơn giá bán`);
          skipped++;
          continue;
        }

        // Check for existing product
        const existingBySlugMatch = existingBySlug.get(row.slug);
        const existingBySkuMatch = row.sku ? existingBySku.get(row.sku) : null;
        
        if (existingBySlugMatch || existingBySkuMatch) {
          if (!overwrite) {
            skipped++;
            continue;
          }

          // Update existing product
          const existingProduct = existingBySlugMatch || existingBySkuMatch!;
          const updateData = {
            ...row,
            category_id: row.category_id || null,
            description: row.description || null,
            short_description: row.short_description || null,
            sku: row.sku || null,
            compare_price: row.compare_price || null,
            cost_price: row.cost_price || null,
            brand: row.brand || null,
            weight: row.weight || null,
            updated_at: new Date().toISOString(),
          };

          const { data: updatedProduct, error: updateError } = await supabase
            .from("products")
            .update(updateData)
            .eq("id", existingProduct.id)
            .select()
            .single();

          if (updateError) {
            errors.push(`Lỗi cập nhật sản phẩm "${row.name}": ${updateError.message}`);
            skipped++;
          } else if (updatedProduct) {
            processedProducts.push(updatedProduct);
            updated++;
          }
        } else {
          // Create new product
          const newProductData = {
            ...row,
            category_id: row.category_id || null,
            description: row.description || null,
            short_description: row.short_description || null,
            sku: row.sku || null,
            compare_price: row.compare_price || null,
            cost_price: row.cost_price || null,
            brand: row.brand || null,
            weight: row.weight || null,
            dimensions: null,
            meta_title: null,
            meta_description: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { data: newProduct, error: insertError } = await supabase
            .from("products")
            .insert(newProductData)
            .select()
            .single();

          if (insertError) {
            errors.push(`Lỗi tạo sản phẩm "${row.name}": ${insertError.message}`);
            skipped++;
          } else if (newProduct) {
            processedProducts.push(newProduct);
            imported++;
          }
        }
      } catch (error) {
        errors.push(`Lỗi xử lý sản phẩm "${row.name}": ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        skipped++;
      }
    }

    let message = `Hoàn thành nhập sản phẩm: ${imported} tạo mới, ${updated} cập nhật, ${skipped} bỏ qua`;
    
    if (errors.length > 0) {
      message += `. Có ${errors.length} lỗi.`;
    }

    return {
      success: true,
      message,
      imported,
      updated,
      skipped,
      errors,
      products: processedProducts,
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
      error: "Đã xảy ra lỗi không mong muốn khi nhập sản phẩm từ CSV",
    };
  }
} 