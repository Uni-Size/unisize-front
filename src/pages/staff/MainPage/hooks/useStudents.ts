import { useCallback } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getRegisterStudents } from '../../../../api/student';
import type { RegisterStudent } from '../../../../api/student';

const registerStudentsQueryKey = ['staff', 'register-students', 'infinite'] as const;
const PAGE_SIZE = 20;

/**
 * 스태프 메인의 학생 목록(무한 스크롤).
 *
 * 페이지를 누적해 하나의 목록으로 보여주므로 useQuery가 아니라 useInfiniteQuery를 쓴다.
 * 반환 인터페이스는 기존 그대로라 호출부는 바뀌지 않는다.
 */
export function useStudents() {
  const queryClient = useQueryClient();

  const {
    data,
    isPending,
    error: queryError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: registerStudentsQueryKey,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      // 기존 코드는 네트워크 실패와 "success: false 응답"의 문구를 구분했다. 그대로 유지한다.
      const response = await getRegisterStudents({ page: pageParam, limit: PAGE_SIZE }).catch(
        (err) => {
          console.error('Failed to fetch students:', err);
          throw new Error('서버 연결에 실패했습니다.');
        },
      );
      if (!(response.success && response.data && Array.isArray(response.data.students))) {
        throw new Error(response.error?.message || '데이터를 불러오는데 실패했습니다.');
      }
      return response;
    },
    // 서버가 알려준 현재/전체 페이지로 다음 페이지 유무를 정한다(기존 hasMore 계산과 동일).
    getNextPageParam: (lastPage) =>
      lastPage.meta && lastPage.meta.page < lastPage.meta.total_pages
        ? lastPage.meta.page + 1
        : undefined,
  });

  const students: RegisterStudent[] = data?.pages.flatMap((p) => p.data.students) ?? [];
  // total은 마지막 응답 기준 (기존에도 매 응답의 total로 덮어썼다).
  const total = data?.pages.at(-1)?.data.total ?? 0;

  const loadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  // 기존 refresh는 page를 1로 되돌리고 목록을 첫 페이지로 교체했다.
  // resetQueries가 누적된 페이지를 버리고 initialPageParam부터 다시 가져온다.
  const refresh = useCallback(() => {
    void queryClient.resetQueries({ queryKey: registerStudentsQueryKey });
  }, [queryClient]);

  return {
    students,
    isLoading: isPending,
    error: queryError ? queryError.message : null,
    total,
    hasMore: hasNextPage,
    isFetchingMore: isFetchingNextPage,
    loadMore,
    refresh,
  };
}
