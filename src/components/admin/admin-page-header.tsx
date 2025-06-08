import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // For action buttons, stats, etc.
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AdminPageHeader({
  title,
  description,
  children,
  className,
  size = "lg",
}: AdminPageHeaderProps) {
  const titleSizes = {
    sm: "text-xl font-semibold",
    md: "text-2xl font-bold",
    lg: "text-3xl font-bold",
  };

  const descriptionClasses = "text-gray-600 mt-2";

  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className={titleSizes[size]}>{title}</h1>
          {description && <p className={descriptionClasses}>{description}</p>}
        </div>
        {children && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
