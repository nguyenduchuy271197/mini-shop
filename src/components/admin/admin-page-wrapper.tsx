import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminPageWrapperProps {
  children: ReactNode;
  className?: string;
  spacing?: "default" | "compact" | "loose";
  container?: boolean;
}

export function AdminPageWrapper({
  children,
  className,
  spacing = "default",
  container = true,
}: AdminPageWrapperProps) {
  const spacingClasses = {
    compact: "space-y-4",
    default: "space-y-6",
    loose: "space-y-8",
  };

  const containerClasses = container ? "container mx-auto px-4 py-6" : "p-6";

  return (
    <div className={cn(containerClasses, spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}
