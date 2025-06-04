"use server";

import { z } from "zod";

// Validation schema
const validateAddressSchema = z.object({
  type: z.enum(["shipping", "billing"], {
    required_error: "Loại địa chỉ là bắt buộc",
  }),
  first_name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  last_name: z.string().min(2, "Họ phải có ít nhất 2 ký tự"),
  company: z.string().optional(),
  address_line_1: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  address_line_2: z.string().optional(),
  city: z.string().min(2, "Thành phố phải có ít nhất 2 ký tự"),
  state: z.string().min(2, "Tỉnh/Thành phải có ít nhất 2 ký tự"),
  postal_code: z.string().min(4, "Mã bưu điện phải có ít nhất 4 ký tự"),
  country: z.string().min(2, "Quốc gia phải có ít nhất 2 ký tự").default("VN"),
  phone: z.string().optional(),
});

type ValidateAddressData = z.infer<typeof validateAddressSchema>;

// Validation result details
type ValidationIssue = {
  field: string;
  message: string;
  severity: "error" | "warning" | "info";
};

// Return type
type ValidateAddressResult =
  | {
      success: true;
      isValid: true;
      message: string;
      issues?: ValidationIssue[];
    }
  | {
      success: true;
      isValid: false;
      issues: ValidationIssue[];
    }
  | { success: false; error: string };

export async function validateAddress(data: ValidateAddressData): Promise<ValidateAddressResult> {
  try {
    // 1. Basic schema validation
    const validatedData = validateAddressSchema.parse(data);
    const issues: ValidationIssue[] = [];

    // 2. Phone number validation (if provided)
    if (validatedData.phone) {
      if (!validatePhoneNumber(validatedData.phone)) {
        issues.push({
          field: "phone",
          message: "Số điện thoại không hợp lệ",
          severity: "error",
        });
      }
    }

    // 3. Postal code validation by country
    if (!validatePostalCode(validatedData.postal_code, validatedData.country)) {
      issues.push({
        field: "postal_code",
        message: "Mã bưu điện không hợp lệ cho quốc gia này",
        severity: "error",
      });
    }

    // 4. State/Province validation for Vietnam
    if (validatedData.country === "VN") {
      if (!validateVietnameseProvince(validatedData.state)) {
        issues.push({
          field: "state",
          message: "Tỉnh/Thành phố không hợp lệ",
          severity: "warning",
        });
      }
    }

    // 5. City validation for Vietnam
    if (validatedData.country === "VN") {
      if (!validateVietnameseCity(validatedData.city)) {
        issues.push({
          field: "city",
          message: "Thành phố/Quận/Huyện có thể không chính xác",
          severity: "warning",
        });
      }
    }

    // 6. Address format validation
    if (!validateAddressFormat(validatedData.address_line_1)) {
      issues.push({
        field: "address_line_1",
        message: "Địa chỉ cần có thông tin đầy đủ hơn",
        severity: "info",
      });
    }

    // 7. Business address validation
    if (validatedData.type === "billing" && !validatedData.company) {
      issues.push({
        field: "company",
        message: "Nên cung cấp tên công ty cho địa chỉ thanh toán",
        severity: "info",
      });
    }

    // 8. Name validation
    if (containsSpecialCharacters(validatedData.first_name) || 
        containsSpecialCharacters(validatedData.last_name)) {
      issues.push({
        field: "name",
        message: "Tên không nên chứa ký tự đặc biệt",
        severity: "warning",
      });
    }

    // 9. Determine if address is valid
    const hasErrors = issues.some(issue => issue.severity === "error");

    if (hasErrors) {
      return {
        success: true,
        isValid: false,
        issues,
      };
    }

    return {
      success: true,
      isValid: true,
      message: "Địa chỉ hợp lệ",
      issues: issues.length > 0 ? issues : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues: ValidationIssue[] = error.errors.map(err => ({
        field: err.path.join("."),
        message: err.message,
        severity: "error" as const,
      }));

      return {
        success: true,
        isValid: false,
        issues,
      };
    }

    return {
      success: false,
      error: "Đã xảy ra lỗi không mong muốn khi xác thực địa chỉ",
    };
  }
}

/**
 * Validate phone number format
 */
function validatePhoneNumber(phone: string): boolean {
  // Remove all spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
  
  // Vietnamese phone number patterns
  const vietnamesePatterns = [
    /^(84|0)(3|5|7|8|9)\d{8}$/,  // Mobile
    /^(84|0)(2\d)\d{7,8}$/,      // Landline
  ];
  
  return vietnamesePatterns.some(pattern => pattern.test(cleanPhone));
}

/**
 * Validate postal code by country
 */
function validatePostalCode(postalCode: string, country: string): boolean {
  switch (country) {
    case "VN":
      // Vietnamese postal codes are 6 digits
      return /^\d{6}$/.test(postalCode);
    case "US":
      // US ZIP codes
      return /^\d{5}(-\d{4})?$/.test(postalCode);
    case "GB":
      // UK postal codes
      return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(postalCode);
    default:
      // Basic validation for other countries
      return postalCode.length >= 4 && postalCode.length <= 10;
  }
}

/**
 * Validate Vietnamese province/city
 */
function validateVietnameseProvince(province: string): boolean {
  const vietnameseProvinces = [
    "Hà Nội", "TP Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ",
    "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu",
    "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước",
    "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông",
    "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang",
    "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình",
    "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu",
    "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định",
    "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên",
    "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị",
    "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên",
    "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang",
    "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
  ];
  
  return vietnameseProvinces.some(p => 
    p.toLowerCase().includes(province.toLowerCase()) || 
    province.toLowerCase().includes(p.toLowerCase())
  );
}

/**
 * Validate Vietnamese city/district
 */
function validateVietnameseCity(city: string): boolean {
  // Basic validation - check if city name seems reasonable
  const cityPatterns = [
    /^(Quận|Huyện|Thành phố|Thị xã|Thị trần)\s+/i,
    /^(Q\.|H\.|TP\.|TX\.|TT\.)\s*/i,
  ];
  
  // If it follows district/city naming convention, it's likely valid
  if (cityPatterns.some(pattern => pattern.test(city))) {
    return true;
  }
  
  // If it's just a name without prefix, still consider it valid
  return city.length >= 2;
}

/**
 * Validate address format
 */
function validateAddressFormat(address: string): boolean {
  // Check for common address components
  const hasNumber = /\d/.test(address);
  const hasStreetIndicator = /(đường|phố|ngõ|hẻm|street|st|road|rd|avenue|ave)/i.test(address);
  
  return hasNumber || hasStreetIndicator || address.length >= 10;
}

/**
 * Check for special characters in names
 */
function containsSpecialCharacters(name: string): boolean {
  // Allow Vietnamese characters, spaces, and basic punctuation
  const allowedPattern = /^[a-zA-ZÀ-ỹ\s\.\-\']+$/;
  return !allowedPattern.test(name);
} 