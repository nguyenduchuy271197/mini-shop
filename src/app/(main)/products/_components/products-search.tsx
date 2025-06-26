"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ProductsSearchProps {
  initialQuery?: string;
}

export default function ProductsSearch({
  initialQuery = "",
}: ProductsSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const params = new URLSearchParams(searchParams);

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      } else {
        params.delete("search");
      }

      // Reset to first page when searching
      params.set("page", "1");

      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Debounce search - but don't trigger on initial mount with empty query
  // and don't trigger again if query is empty after initial mount
  useEffect(() => {
    // Skip on initial mount if query is empty
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (!query.trim()) {
        return;
      }
    }

    // Also skip if query is empty and we're not on initial mount
    // This prevents triggering search when user clears input or component re-renders
    if (!query.trim()) {
      return;
    }

    const timeout = setTimeout(() => {
      handleSearch(query);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [query, handleSearch]); // Remove handleSearch from dependencies to prevent infinite loops

  const handleClear = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-12 py-3 text-base"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
