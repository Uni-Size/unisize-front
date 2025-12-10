import { useState, useEffect, useCallback } from "react";
import { getMeasuringStudents, RegisterStudent } from "@/api/studentApi";

export function useMeasuringStudents() {
  const [students, setStudents] = useState<RegisterStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchStudents = useCallback(
    async (pageNum: number, isInitial = false) => {
      try {
        if (isInitial) {
          setIsLoading(true);
        } else {
          setIsFetchingMore(true);
        }
        setError(null);

        const response = await getMeasuringStudents({
          page: pageNum,
          limit: 20,
        });

        if (response.success && response.data && Array.isArray(response.data.students)) {
          setStudents((prev) =>
            isInitial
              ? response.data.students
              : [...prev, ...response.data.students]
          );
          setTotal(response.data.total || 0);
          setHasMore(response.meta?.page < response.meta?.total_pages);
        } else {
          setError(
            response.error?.message || "데이터를 불러오는데 실패했습니다."
          );
        }
      } catch (err) {
        setError("서버 연결에 실패했습니다.");
        console.error("Failed to fetch measuring students:", err);
      } finally {
        if (isInitial) {
          setIsLoading(false);
        } else {
          setIsFetchingMore(false);
        }
      }
    },
    []
  );

  // 초기 데이터 로드
  useEffect(() => {
    fetchStudents(1, true);
  }, [fetchStudents]);

  // 페이지 변경 시 추가 데이터 로드
  useEffect(() => {
    if (page > 1) {
      fetchStudents(page, false);
    }
  }, [page, fetchStudents]);

  const loadMore = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const refresh = useCallback(() => {
    setPage(1);
    fetchStudents(1, true);
  }, [fetchStudents]);

  return {
    students,
    isLoading,
    error,
    total,
    hasMore,
    isFetchingMore,
    loadMore,
    refresh,
  };
}
