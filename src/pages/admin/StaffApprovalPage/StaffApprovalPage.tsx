import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import { getPendingStaffList, approveStaff, type StaffItem, type StaffListResponse } from '@/api/staff';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { formatDate } from '@/utils/dateUtils';
import { downloadCSV } from '@/utils/csvUtils';
import { formatGender } from '@/utils/genderUtils';
import { Toast } from '@components/atoms/Toast';

interface PendingStaffRow {
  id: string;
  no: number;
  employeeId: string;
  name: string;
  gender: '남' | '여';
  registeredDate: string;
}

const toPendingRow = (item: StaffItem, absoluteIndex: number): PendingStaffRow => ({
  id: item.id,
  no: absoluteIndex + 1,
  employeeId: item.employee_id,
  name: item.employee_name,
  gender: formatGender(item.gender) as '남' | '여',
  registeredDate: formatDate(item.created_at),
});

const itemsPerPage = 10;

// 페이지 번호가 queryKey에 들어가므로 페이지 이동 = 다른 캐시 엔트리 = 자동 재조회.
const pendingStaffQueryKey = (page: number) => ['admin', 'staff', 'pending', page] as const;

export const StaffApprovalPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  const queryClient = useQueryClient();

  const { data, isFetching, error: queryError } = useQuery({
    queryKey: pendingStaffQueryKey(currentPage),
    queryFn: (): Promise<StaffListResponse> =>
      getPendingStaffList({ page: currentPage, limit: itemsPerPage }).catch((err) => {
        console.error('승인 대기 목록 조회 실패:', err);
        throw err;
      }),
  });

  // No.는 절대 순번이라 페이지 오프셋을 더해야 한다 (page가 queryKey에 있으므로 data와 항상 짝이 맞는다).
  const pendingList: PendingStaffRow[] =
    data?.data.map((item, i) => toPendingRow(item, (currentPage - 1) * itemsPerPage + i)) ?? [];
  const totalPages = data?.meta.total_pages ?? 1;
  // isPending이 아니라 isFetching: 기존 코드는 재조회 때도 로딩 표시를 켜고 테이블을 비웠다.
  const loading = isFetching;
  const error = queryError
    ? getApiErrorMessage(queryError, '승인 대기 목록을 불러오는 중 오류가 발생했습니다.')
    : null;

  const handleApprove = async (staffId: string) => {
    try {
      await approveStaff(staffId);
      // 승인된 항목이 목록에서 빠지면 뒤 페이지 순번이 밀리므로 prefix로 전부 무효화한다.
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'pending'] });
      setToast({ message: '승인이 완료되었습니다.', variant: 'success' });
    } catch (error) {
      console.error('승인 실패:', error);
      setToast({ message: '승인에 실패했습니다.', variant: 'error' });
    }
  };

  const handleExportCSV = () => {
    downloadCSV(
      ['No.', '연락처', '이름', '성별', '등록일'],
      pendingList.map((s) => [s.no, s.employeeId, s.name, s.gender, s.registeredDate]),
      '스태프승인대기목록',
    );
  };

  const columns: Column<PendingStaffRow>[] = [
    { key: 'no', header: 'No.', width: '34px', align: 'center' },
    { key: 'employeeId', header: '연락처', width: '100px', align: 'center' },
    { key: 'name', header: '이름', align: 'center' },
    { key: 'gender', header: '성별', width: '28px', align: 'center' },
    { key: 'registeredDate', header: '등록일', align: 'center' },
    {
      key: 'actions',
      header: '관리',
      width: '80px',
      align: 'center',
      render: (item) => (
        <Button
          variant="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleApprove(item.id);
          }}
        >
          승인
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex flex-col gap-5">
        <AdminHeader
          title="스태프 승인대기"
          actions={
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-15 font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportCSV}
              disabled={pendingList.length === 0}
            >
              CSV 내보내기
            </button>
          }
        />

        <div className="bg-white rounded-lg p-2.5">
          <Table
            columns={columns}
            data={loading ? [] : pendingList}
            onRowClick={(staff) => console.log('Staff clicked:', staff)}
            getRowKey={(row) => row.id}
            emptyMessage={loading ? "로딩 중..." : error ?? "데이터가 없습니다."}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};
