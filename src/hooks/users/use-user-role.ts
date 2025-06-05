"use client";

import { useQuery } from "@tanstack/react-query";
import { 
  getUserRole, 
  getCurrentUserRole, 
  checkUserHasRole 
} from "@/actions/users/get-user-role";
import { QUERY_KEYS } from "@/lib/query-keys";
import { AppRole } from "@/types/custom.types";

const isAuthError = (error: Error): boolean => {
  return error.message.includes("đăng nhập") || error.message.includes("quyền");
};

export function useUserRole(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.userRole(userId),
    queryFn: () => getUserRole(userId),
    enabled: !!userId,
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useCurrentUserRole() {
  return useQuery({
    queryKey: QUERY_KEYS.auth.currentUserRole(),
    queryFn: getCurrentUserRole,
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useCheckUserRole(userId: string, role: AppRole) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.checkRole(userId, role),
    queryFn: () => checkUserHasRole(userId, role),
    enabled: !!userId && !!role,
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 3;
    },
  });
} 