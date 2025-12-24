import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingStaff, approveStaff, bulkApproveStaff, getStaffList, resetStaffPassword } from "@/api/staffApi";

// 스태프 대기 목록 조회
export function usePendingStaff(page: number, limit: number = 10) {
  return useQuery({
    queryKey: ["pendingStaff", page, limit],
    queryFn: () => getPendingStaff(page, limit),
  });
}

// 스태프 목록 조회 (승인된 스태프)
export function useStaffList(page: number, limit: number = 10) {
  return useQuery({
    queryKey: ["staffList", page, limit],
    queryFn: () => getStaffList(page, limit),
  });
}

// 단일 스태프 승인
export function useApproveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: number) => approveStaff(staffId),
    onSuccess: () => {
      // 성공 시 대기 목록과 스태프 목록 쿼리 무효화하여 자동 refetch
      queryClient.invalidateQueries({ queryKey: ["pendingStaff"] });
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
    },
  });
}

// 일괄 스태프 승인
export function useBulkApproveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userIds: number[]) => bulkApproveStaff(userIds),
    onSuccess: () => {
      // 성공 시 대기 목록과 스태프 목록 쿼리 무효화하여 자동 refetch
      queryClient.invalidateQueries({ queryKey: ["pendingStaff"] });
      queryClient.invalidateQueries({ queryKey: ["staffList"] });
    },
  });
}

// 스태프 비밀번호 초기화
export function useResetStaffPassword() {
  return useMutation({
    mutationFn: (targetEmployeeId: string) => resetStaffPassword(targetEmployeeId),
  });
}
