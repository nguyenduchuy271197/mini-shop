import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Thời gian cache query (30 phút)
      staleTime: 1000 * 60 * 30,
      // Thời gian giữ cache trong memory (1 giờ)
      gcTime: 1000 * 60 * 60,
      // Retry khi query failed
      retry: (failureCount, error: any) => {
        // Không retry nếu lỗi 4xx (client error)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry tối đa 3 lần cho các lỗi khác
        return failureCount < 3;
      },
      // Refetch khi window focus (tắt để tối ưu performance)
      refetchOnWindowFocus: false,
      // Refetch khi reconnect network
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutation 1 lần
      retry: 1,
      // Timeout cho mutations (30 giây)
      networkMode: "online",
    },
  },
}); 