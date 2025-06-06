"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface ProductsSortingProps {
  sortBy: string;
  sortOrder: string;
}

const sortOptions = [
  { value: "created_at-desc", label: "Mới nhất" },
  { value: "created_at-asc", label: "Cũ nhất" },
  { value: "name-asc", label: "Tên A-Z" },
  { value: "name-desc", label: "Tên Z-A" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "stock_quantity-desc", label: "Nhiều hàng nhất" },
  { value: "stock_quantity-asc", label: "Ít hàng nhất" },
];

export default function ProductsSorting({
  sortBy,
  sortOrder,
}: ProductsSortingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValue = `${sortBy}-${sortOrder}`;

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    const params = new URLSearchParams(searchParams);

    params.set("sortBy", field);
    params.set("sortOrder", order);
    params.set("page", "1"); // Reset to first page

    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Sắp xếp theo:</span>
      <Select value={currentValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
