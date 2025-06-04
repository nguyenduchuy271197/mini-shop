"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema
const exportProductsSchema = z.object({
  filters: z.object({
    categoryId: z.number().positive("ID danh mục không hợp lệ").optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    brand: z.string().optional(),
    minPrice: z.number().min(0, "Giá tối thiểu không thể âm").optional(),
    maxPrice: z.number().min(0, "Giá tối đa không thể âm").optional(),
    lowStock: z.boolean().optional(), // Products below low stock threshold
    outOfStock: z.boolean().optional(), // Products with 0 stock
    searchTerm: z.string().optional(),
  }).optional().default({}),
  format: z.enum(["csv", "json"]).optional().default("csv"),
  includeInactive: z.boolean().optional().default(false),
});

type ExportProductsData = z.infer<typeof exportProductsSchema>;

// Return type
type ExportProductsResult =
  | {
      success: true;
      message: string;
      data: string;
      fileName: string;
      totalExported: number;
    }
  | { success: false; error: string };

export async function exportProducts(data?: ExportProductsData): Promise<ExportProductsResult> {
  try {
    // 1. Validate input
    const { filters, format, includeInactive } = exportProductsSchema.parse(data || {});

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
        error: "Bạn cần đăng nhập để xuất dữ liệu sản phẩm",
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
        error: "Bạn không có quyền xuất dữ liệu sản phẩm",
      };
    }

    // 4. Build query with filters
    let query = supabase
      .from("products")
      .select(`
        *,
        categories (
          id,
          name
        )
      `);

    // Apply filters
    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }

    if (filters.isActive !== undefined) {
      query = query.eq("is_active", filters.isActive);
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq("is_featured", filters.isFeatured);
    }

    if (filters.brand) {
      query = query.ilike("brand", `%${filters.brand}%`);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    if (filters.searchTerm) {
      query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%,sku.ilike.%${filters.searchTerm}%`);
    }

    // Execute query
    const { data: products, error: fetchError } = await query.order("created_at", { ascending: false });

    if (fetchError) {
      return {
        success: false,
        error: fetchError.message || "Không thể lấy dữ liệu sản phẩm",
      };
    }

    if (!products || products.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm nào để xuất",
      };
    }

    // 5. Apply additional filters that require computation
    let filteredProducts = products;

    if (filters.lowStock) {
      filteredProducts = filteredProducts.filter(p => p.stock_quantity <= p.low_stock_threshold);
    }

    if (filters.outOfStock) {
      filteredProducts = filteredProducts.filter(p => p.stock_quantity === 0);
    }

    if (filteredProducts.length === 0) {
      return {
        success: false,
        error: "Không tìm thấy sản phẩm nào phù hợp với bộ lọc",
      };
    }

    // 6. Format data based on requested format
    const timestamp = new Date().toISOString().split('T')[0];
    let exportData: string;
    let fileName: string;

    if (format === "json") {
      // JSON format
      const jsonData = filteredProducts.map(product => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        short_description: product.short_description,
        sku: product.sku,
        price: product.price,
        compare_price: product.compare_price,
        cost_price: product.cost_price,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        category_id: product.category_id,
        category_name: Array.isArray(product.categories) 
          ? product.categories[0]?.name 
          : product.categories?.name || null,
        brand: product.brand,
        weight: product.weight,
        dimensions: product.dimensions,
        images: product.images,
        tags: product.tags,
        is_active: product.is_active,
        is_featured: product.is_featured,
        meta_title: product.meta_title,
        meta_description: product.meta_description,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      exportData = JSON.stringify(jsonData, null, 2);
      fileName = `products-export-${timestamp}.json`;
    } else {
      // CSV format
      const headers = [
        'id', 'name', 'slug', 'description', 'short_description', 'sku',
        'price', 'compare_price', 'cost_price', 'stock_quantity', 'low_stock_threshold',
        'category_id', 'category_name', 'brand', 'weight', 'images', 'tags',
        'is_active', 'is_featured', 'meta_title', 'meta_description',
        'created_at', 'updated_at'
      ];

      const csvRows = filteredProducts.map(product => {
        const categoryName = Array.isArray(product.categories) 
          ? product.categories[0]?.name 
          : product.categories?.name || "";

        return [
          product.id,
          `"${(product.name || "").replace(/"/g, '""')}"`,
          product.slug || "",
          `"${(product.description || "").replace(/"/g, '""')}"`,
          `"${(product.short_description || "").replace(/"/g, '""')}"`,
          product.sku || "",
          product.price || 0,
          product.compare_price || "",
          product.cost_price || "",
          product.stock_quantity || 0,
          product.low_stock_threshold || 10,
          product.category_id || "",
          `"${categoryName.replace(/"/g, '""')}"`,
          `"${(product.brand || "").replace(/"/g, '""')}"`,
          product.weight || "",
          `"${(product.images || []).join("|")}"`,
          `"${(product.tags || []).join(",")}"`,
          product.is_active,
          product.is_featured,
          `"${(product.meta_title || "").replace(/"/g, '""')}"`,
          `"${(product.meta_description || "").replace(/"/g, '""')}"`,
          product.created_at,
          product.updated_at,
        ].join(',');
      });

      exportData = [headers.join(','), ...csvRows].join('\n');
      fileName = `products-export-${timestamp}.csv`;
    }

    // 7. Create filter description for message
    const filterDescriptions: string[] = [];
    if (filters.categoryId) filterDescriptions.push(`danh mục ${filters.categoryId}`);
    if (filters.isActive !== undefined) filterDescriptions.push(filters.isActive ? "đang hoạt động" : "không hoạt động");
    if (filters.isFeatured) filterDescriptions.push("sản phẩm nổi bật");
    if (filters.brand) filterDescriptions.push(`thương hiệu "${filters.brand}"`);
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange = `giá ${filters.minPrice || 0} - ${filters.maxPrice || "∞"}`;
      filterDescriptions.push(priceRange);
    }
    if (filters.lowStock) filterDescriptions.push("tồn kho thấp");
    if (filters.outOfStock) filterDescriptions.push("hết hàng");
    if (filters.searchTerm) filterDescriptions.push(`tìm kiếm "${filters.searchTerm}"`);

    const filterText = filterDescriptions.length > 0 
      ? ` với bộ lọc: ${filterDescriptions.join(", ")}`
      : "";

    return {
      success: true,
      message: `Đã xuất ${filteredProducts.length} sản phẩm thành file ${format.toUpperCase()}${filterText}`,
      data: exportData,
      fileName,
      totalExported: filteredProducts.length,
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
      error: "Đã xảy ra lỗi không mong muốn khi xuất dữ liệu sản phẩm",
    };
  }
} 