"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserProfileWithRoles } from "@/actions/users/get-profile";
import { QUERY_KEYS } from "@/lib/query-keys";

const isAuthError = (error: Error): boolean => {
  return error.message.includes("đăng nhập") || 
         error.message.includes("Người dùng chưa đăng nhập") ||
         error.message.includes("unauthenticated") ||
         error.message.includes("unauthorized");
};

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.profile(),
    queryFn: () => getUserProfile(userId),
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 2; // Reduce retry attempts for faster response
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - shorter for faster auth state updates
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    // Remove refetchInterval to avoid unnecessary requests
  });
}

export function useProfileWithRoles(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.profileWithRoles(),
    queryFn: () => getUserProfileWithRoles(userId),
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
} 