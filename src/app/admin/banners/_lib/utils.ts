export const bannerPositionOptions = [
  { value: "hero", label: "Hero (Banner chính)" },
  { value: "sidebar", label: "Sidebar (Bên cạnh)" },
  { value: "footer", label: "Footer (Chân trang)" },
  { value: "popup", label: "Popup (Bật lên)" },
  { value: "category", label: "Category (Danh mục)" },
] as const;

export const bannerTargetOptions = [
  { value: "_self", label: "Cùng tab" },
  { value: "_blank", label: "Tab mới" },
] as const;

export const bannerStatusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
] as const;

export function getBannerStatusText(banner: { is_active: boolean }) {
  return banner.is_active
    ? { text: "Hoạt động", variant: "default" as const }
    : { text: "Không hoạt động", variant: "secondary" as const };
}

export function getBannerPositionText(position: string): string {
  const option = bannerPositionOptions.find(opt => opt.value === position);
  return option?.label || position;
}

export function getBannerTargetText(target: string): string {
  const option = bannerTargetOptions.find(opt => opt.value === target);
  return option?.label || target;
}

export function isBannerActive(banner: {
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}): boolean {
  if (!banner.is_active) return false;

  const now = new Date();
  
  if (banner.start_date) {
    const startDate = new Date(banner.start_date);
    if (now < startDate) return false;
  }
  
  if (banner.end_date) {
    const endDate = new Date(banner.end_date);
    if (now > endDate) return false;
  }
  
  return true;
}

export function getBannerEffectiveStatus(banner: {
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}): {
  text: string;
  variant: "default" | "secondary" | "destructive" | "outline";
  color: string;
} {
  if (!banner.is_active) {
    return {
      text: "Tắt",
      variant: "secondary",
      color: "text-gray-500",
    };
  }

  const now = new Date();
  
  if (banner.start_date) {
    const startDate = new Date(banner.start_date);
    if (now < startDate) {
      return {
        text: "Chưa bắt đầu",
        variant: "outline",
        color: "text-blue-500",
      };
    }
  }
  
  if (banner.end_date) {
    const endDate = new Date(banner.end_date);
    if (now > endDate) {
      return {
        text: "Đã hết hạn",
        variant: "destructive",
        color: "text-red-500",
      };
    }
  }
  
  return {
    text: "Đang hoạt động",
    variant: "default",
    color: "text-green-500",
  };
}

export function formatBannerPeriod(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) {
    return "Vô thời hạn";
  }
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };
  
  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }
  
  if (startDate) {
    return `Từ ${formatDate(startDate)}`;
  }
  
  if (endDate) {
    return `Đến ${formatDate(endDate)}`;
  }
  
  return "Vô thời hạn";
}

export function validateBannerData(data: {
  title: string;
  image_url: string;
  position: string;
  start_date?: string;
  end_date?: string;
}): string[] {
  const errors: string[] = [];

  if (!data.title.trim()) {
    errors.push("Tiêu đề banner không được để trống");
  }

  if (!data.image_url.trim()) {
    errors.push("Hình ảnh banner không được để trống");
  }

  if (!data.position) {
    errors.push("Vị trí banner không được để trống");
  }

  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    
    if (startDate >= endDate) {
      errors.push("Ngày bắt đầu phải nhỏ hơn ngày kết thúc");
    }
  }

  return errors;
}

export function getBannerFormDefaults() {
  return {
    title: "",
    description: "",
    image_url: "",
    link_url: "",
    position: "hero" as const,
    is_active: true,
    start_date: "",
    end_date: "",
    target_type: "_self" as const,
    priority: 0,
  };
}

export function getDeleteBannerConfirmation(bannerTitle: string): {
  title: string;
  description: string;
} {
  return {
    title: "Xóa banner",
    description: `Bạn có chắc chắn muốn xóa banner "${bannerTitle}"? Hành động này không thể hoàn tác.`,
  };
}

export function sortBannersByPriority<T extends { priority: number }>(banners: T[]): T[] {
  return [...banners].sort((a, b) => b.priority - a.priority);
}

export function validateImageUrl(url: string): boolean {
  const imageRegex = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
  try {
    new URL(url);
    return imageRegex.test(url);
  } catch {
    return false;
  }
}

export function truncateDescription(description: string | null, maxLength: number = 100): string {
  if (!description) return "";
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + "...";
} 