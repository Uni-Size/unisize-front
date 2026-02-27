import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import { getPendingStaffList, approveStaff, type StaffItem } from '@/api/staff';
import { getApiErrorMessage } from '@/utils/errorUtils';

interface PendingStaffRow {
  id: number;
  no: number;
  employeeId: string;
  name: string;
  gender: '남' | '여';
  phone: string;
  registeredDate: string;
}

const toPendingRow = (item: StaffItem, index: number): PendingStaffRow => ({
  id: item.id,
  no: index + 1,
  employeeId: item.employee_id,
  name: item.employee_name,
  gender: item.gender === 'M' ? '남' : '여',
  phone: item.phone ?? '-',
  registeredDate: item.created_at,
});

export const StaffApprovalPage = () => {
  const [pendingList, setPendingList] = useState<PendingStaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ReactNode>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchPendingList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingStaffList();
      setPendingList(data.map(toPendingRow));
    } catch (err) {
      console.error('승인 대기 목록 조회 실패:', err);
      setError(getApiErrorMessage(err, '승인 대기 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingList();
  }, [fetchPendingList]);

  const handleApprove = async (staffId: number) => {
    try {
      await approveStaff(staffId);
      fetchPendingList();
    } catch (error) {
      console.error('승인 실패:', error);
      alert('승인에 실패했습니다.');
    }
  };

  const columns: Column<PendingStaffRow>[] = [
    { key: 'no', header: 'No.', width: '34px', align: 'center' },
    { key: 'employeeId', header: '사번', width: '100px', align: 'center' },
    { key: 'name', header: '이름', align: 'center' },
    { key: 'gender', header: '성별', width: '28px', align: 'center' },
    { key: 'phone', header: '연락처', align: 'center' },
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

  const totalPages = Math.ceil(pendingList.length / itemsPerPage);
  const paginatedStaff = pendingList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5">
        <AdminHeader title="스태프 승인대기" />

        <div className="bg-white rounded-lg p-2.5">
          <Table
            columns={columns}
            data={loading ? [] : paginatedStaff}
            onRowClick={(staff) => console.log('Staff clicked:', staff)}
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
