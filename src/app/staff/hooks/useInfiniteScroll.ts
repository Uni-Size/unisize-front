import { useCallback, useRef } from "react";

interface UseInfiniteScrollProps {
  isLoading: boolean;
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function useInfiniteScroll({
  isLoading,
  isFetchingMore,
  hasMore,
  onLoadMore,
}: UseInfiniteScrollProps) {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (isLoading || isFetchingMore) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetchingMore, hasMore, onLoadMore]
  );

  return { lastElementRef };
}
