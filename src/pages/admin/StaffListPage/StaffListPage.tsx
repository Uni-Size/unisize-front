import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { StaffEditModal } from '@components/organisms/StaffEditModal';
import { StaffRegisterModal } from '@components/organisms/StaffRegisterModal';
import { Table } from '@components/atoms/Table';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import type { StaffEditData } from '@components/organisms/StaffEditModal';
import { getStaffList, updateStaff, deleteStaff, type StaffItem, type StaffListResponse } from '@/api/staff';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { formatDate } from '@/utils/dateUtils';
import { downloadCSV } from '@/utils/csvUtils';
import { formatGender } from '@/utils/genderUtils';

interface StaffRow {
  id: string;
  no: number;
  name: string;
  gender: '남' | '여';
  employeeId: string;
  registeredDate: string;
}

const toStaffRow = (item: StaffItem, absoluteIndex: number): StaffRow => ({
  id: item.id,
  no: absoluteIndex + 1,
  name: item.employee_name,
  gender: formatGender(item.gender) as '남' | '여',
  employeeId: item.employee_id,
  registeredDate: formatDate(item.created_at),
});

const toStaffEditData = (row: StaffRow): StaffEditData => ({
  id: row.id,
  employeeId: row.employeeId,
  name: row.name,
  gender: row.gender,
  registeredDate: row.registeredDate,
});

const itemsPerPage = 10;

// 페이지 번호가 queryKey에 들어가므로 페이지 이동 = 다른 캐시 엔트리 = 자동 재조회.
const staffListQueryKey = (page: number) => ['admin', 'staff', 'list', page] as const;

export const StaffListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffEditData | null>(null);
  const queryClient = useQueryClient();

  const { data, isFetching, error: queryError } = useQuery({
    queryKey: staffListQueryKey(currentPage),
    queryFn: (): Promise<StaffListResponse> =>
      getStaffList({ page: currentPage, limit: itemsPerPage }).catch((err) => {
        console.error('스태프 목록 조회 실패:', err);
        throw err;
      }),
  });

  // No.는 절대 순번이라 페이지 오프셋을 더해야 한다 (page가 queryKey에 있으므로 data와 항상 짝이 맞는다).
  const staffList: StaffRow[] =
    data?.data.map((item, i) => toStaffRow(item, (currentPage - 1) * itemsPerPage + i)) ?? [];
  const totalPages = data?.meta.total_pages ?? 1;
  // isPending이 아니라 isFetching: 기존 코드는 재조회 때도 로딩 표시를 켜고 테이블을 비웠다.
  const loading = isFetching;
  const error = queryError
    ? getApiErrorMessage(queryError, '스태프 목록을 불러오는 중 오류가 발생했습니다.')
    : null;

  // 목록을 바꾸는 작업(수정/삭제/등록) 후 재조회. 현재 페이지만이 아니라
  // 캐시에 남은 다른 페이지도 낡으므로 prefix로 전부 무효화한다.
  const invalidateStaffList = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'staff', 'list'] });

  const handleEditClick = (staff: StaffRow) => {
    setSelectedStaff(toStaffEditData(staff));
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStaff(null);
  };

  const handleUpdateStaff = async (data: StaffEditData) => {
    try {
      await updateStaff(data.id, {
        employee_name: data.name,
        gender: data.gender === '남' ? 'M' : 'F',
      });
      handleCloseEditModal();
      invalidateStaffList();
    } catch (err) {
      console.error('스태프 정보 수정 실패:', err);
      alert(getApiErrorMessage(err, '스태프 정보 수정에 실패했습니다.'));
    }
  };

  const handleDeleteClick = async (staff: StaffRow) => {
    const confirmed = window.confirm(`${staff.name} 스태프를 삭제하시겠습니까?`);
    if (!confirmed) return;

    try {
      await deleteStaff(staff.id);
      invalidateStaffList();
    } catch (err) {
      console.error('스태프 삭제 실패:', err);
      alert(getApiErrorMessage(err, '스태프 삭제에 실패했습니다.'));
    }
  };

  const handleExportCSV = () => {
    downloadCSV(
      ['No.', '연락처', '이름', '성별', '등록일'],
      staffList.map((s) => [s.no, s.employeeId, s.name, s.gender, s.registeredDate]),
      '스태프목록',
    );
  };

  const columns: Column<StaffRow>[] = [
    { key: 'no', header: 'No.', width: '34px', align: 'center' },
    { key: 'employeeId', header: '연락처', width: '100px', align: 'center' },
    { key: 'name', header: '이름', align: 'center' },
    { key: 'gender', header: '성별', width: '28px', align: 'center' },
{ key: 'registeredDate', header: '등록일', align: 'center' },
    {
      key: 'actions',
      header: '관리',
      width: '120px',
      align: 'center',
      render: (item) => (
        <div className="flex gap-1">
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-neutral-050 text-bg-800"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item);
            }}
          >
            수정
          </button>
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-red-200 text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(item);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="스태프 관리"
          buttonLabel="스태프 추가"
          onButtonClick={() => setIsRegisterModalOpen(true)}
          actions={
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-15 font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportCSV}
              disabled={staffList.length === 0}
            >
              CSV 내보내기
            </button>
          }
        />

        <div className="flex-1">
          <Table
            columns={columns}
            data={loading ? [] : staffList}
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

      <StaffEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        staff={selectedStaff}
        onUpdate={handleUpdateStaff}
      />

      <StaffRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={invalidateStaffList}
      />
    </AdminLayout>
  );
};
