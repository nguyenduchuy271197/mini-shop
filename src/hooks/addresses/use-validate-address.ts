"use client";

import { useMutation } from "@tanstack/react-query";
import { validateAddress } from "@/actions/addresses/validate-address";
import { useToast } from "@/hooks/use-toast";

export interface ValidateAddressData {
  type: "shipping" | "billing";
  first_name: string;
  last_name: string;
  company?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

function isClientError(error: Error): boolean {
  return error.message.includes("validation") || 
         error.message.includes("required") ||
         error.message.includes("invalid");
}

export function useValidateAddress() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ValidateAddressData) => validateAddress(data),
    onSuccess: (result) => {
      if (result.success) {
        if (result.isValid) {
          toast({
            title: "Địa chỉ hợp lệ",
            description: result.message,
          });
        } else {
          // Show validation warnings/errors but don't block the UI
          const errorMessages = result.issues
            .filter(issue => issue.severity === "error")
            .map(issue => issue.message);
          
          if (errorMessages.length > 0) {
            toast({
              variant: "destructive",
              title: "Địa chỉ không hợp lệ",
              description: errorMessages.join(", "),
            });
          }
        }
      } else {
        toast({
          variant: "destructive",
          title: "Lỗi",
          description: result.error,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: isClientError(error) 
          ? error.message 
          : "Không thể xác thực địa chỉ. Vui lòng thử lại sau.",
      });
    },
    retry: (failureCount: number, error: Error) => {
      return !isClientError(error) && failureCount < 3;
    },
  });
} 