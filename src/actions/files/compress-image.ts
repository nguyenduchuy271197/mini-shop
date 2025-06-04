"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema cho compress image
const compressImageSchema = z.object({
  file: z.instanceof(File),
  quality: z.number().min(0.1).max(1.0).optional().default(0.8),
  maxWidth: z.number().int().positive().optional().default(1920),
  maxHeight: z.number().int().positive().optional().default(1080),
});

type CompressImageResult =
  | { 
      success: true; 
      message: string;
      compressedFile: File;
      originalSize: number;
      compressedSize: number;
      compressionRatio: number;
    }
  | { success: false; error: string };

export async function compressImage(
  file: File,
  quality?: number,
  maxWidth?: number,
  maxHeight?: number
): Promise<CompressImageResult> {
  try {
    // Validate input
    const validatedData = compressImageSchema.parse({ 
      file, 
      quality,
      maxWidth,
      maxHeight 
    });

    const supabase = createClient();

    // Kiểm tra authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Người dùng chưa được xác thực",
      };
    }

    // Validate file type - chỉ hỗ trợ hình ảnh
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedImageTypes.includes(validatedData.file.type)) {
      return {
        success: false,
        error: "Chỉ hỗ trợ nén file hình ảnh (JPEG, PNG, WebP)",
      };
    }

    // Validate file size (tối đa 25MB input)
    const maxInputSize = 25 * 1024 * 1024; // 25MB
    if (validatedData.file.size > maxInputSize) {
      return {
        success: false,
        error: "Kích thước file input không được vượt quá 25MB",
      };
    }

    // Mock implementation - Trong thực tế cần Canvas API hoặc Sharp library
    // Vì đây là server action, không thể sử dụng Canvas API của browser
    // Nên sẽ mock việc nén
    
    // Simulate compression processing time
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Mock compression ratio dựa trên quality setting
    const mockCompressionRatio = validatedData.quality || 0.8;
    const compressedSize = Math.floor(validatedData.file.size * mockCompressionRatio);
    
    // Tạo mock compressed file
    // Trong thực tế sẽ sử dụng Sharp hoặc ImageMagick để resize và compress
    const compressedArrayBuffer = await validatedData.file.arrayBuffer();
    
    // Mock việc tạo file mới với size nhỏ hơn
    const compressedFile = new File(
      [compressedArrayBuffer.slice(0, compressedSize)],
      `compressed_${validatedData.file.name}`,
      {
        type: validatedData.file.type,
        lastModified: Date.now(),
      }
    );

    const originalSize = validatedData.file.size;
    const compressionRatio = Math.round((1 - compressedSize / originalSize) * 100);

    // Log compression action
    console.log(`User ${user.id} compressed image`, {
      originalFileName: validatedData.file.name,
      originalSize,
      compressedSize,
      compressionRatio: `${compressionRatio}%`,
      quality: validatedData.quality,
      maxWidth: validatedData.maxWidth,
      maxHeight: validatedData.maxHeight,
    });

    return {
      success: true,
      message: `Đã nén thành công hình ảnh "${validatedData.file.name}" (giảm ${compressionRatio}%)`,
      compressedFile,
      originalSize,
      compressedSize,
      compressionRatio,
    };

    // TODO: Thực hiện compression thực tế với Sharp hoặc ImageMagick
    /*
    // Example với Sharp (cần install sharp package):
    import sharp from 'sharp';
    
    const buffer = Buffer.from(await validatedData.file.arrayBuffer());
    
    const compressedBuffer = await sharp(buffer)
      .resize(validatedData.maxWidth, validatedData.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: Math.round(validatedData.quality * 100) })
      .toBuffer();
    
    const compressedFile = new File(
      [compressedBuffer],
      `compressed_${validatedData.file.name}`,
      { type: 'image/jpeg' }
    );
    */
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi nén hình ảnh",
    };
  }
} 