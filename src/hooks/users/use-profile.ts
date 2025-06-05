"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserProfileWithRoles } from "@/actions/users/get-profile";
import { QUERY_KEYS } from "@/lib/query-keys";

const isAuthError = (error: Error): boolean => {
  return error.message.includes("đăng nhập");
};

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.profile(),
    queryFn: () => getUserProfile(userId),
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 3;
    },
  });
}

export function useProfileWithRoles(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.auth.profileWithRoles(),
    queryFn: () => getUserProfileWithRoles(userId),
    retry: (failureCount: number, error: Error) => {
      if (isAuthError(error)) return false;
      return failureCount < 3;
    },
  });
} 