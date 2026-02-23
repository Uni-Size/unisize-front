import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { StaffEditModal } from '@components/organisms/StaffEditModal';
import { StaffRegisterModal } from '@components/organisms/StaffRegisterModal';
import { Table } from '@components/atoms/Table';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import type { StaffEditData } from '@components/organisms/StaffEditModal';
import { getStaffList, type StaffItem } from '@/api/staff';
import { getApiErrorMessage } from '@/utils/errorUtils';

interface StaffRow {
  id: number;
  no: number;
  name: string;
  gender: '남' | '여';
  phone: string;
  employeeId: string;
  registeredDate: string;
}

const toStaffRow = (item: StaffItem, index: number): StaffRow => ({
  id: item.id,
  no: index + 1,
  name: item.employee_name,
  gender: item.gender === 'M' ? '남' : '여',
  phone: item.phone ?? '-',
  employeeId: item.employee_id,
  registeredDate: item.created_at,
});

const toStaffEditData = (row: StaffRow): StaffEditData => ({
  id: row.id,
  employeeId: row.employeeId,
  name: row.name,
  gender: row.gender,
  phone: row.phone,
  registeredDate: row.registeredDate,
});

export const StaffListPage = () => {
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffEditData | null>(null);
  const itemsPerPage = 10;

  const fetchStaffList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaffList();
      setStaffList(data.map(toStaffRow));
    } catch (err) {
      console.error('스태프 목록 조회 실패:', err);
      setError(getApiErrorMessage(err, '스태프 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  const handleEditClick = (staff: StaffRow) => {
    setSelectedStaff(toStaffEditData(staff));
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedStaff(null);
  };

  const handleUpdateStaff = (data: StaffEditData) => {
    console.log('스태프 정보 수정:', data);
    handleCloseEditModal();
    fetchStaffList();
  };

  const columns: Column<StaffRow>[] = [
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
        <div className="flex gap-1">
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#e5e7eb] text-[#374151]"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(item);
            }}
          >
            수정
          </button>
          <button className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#fecaca] text-[#991b1b]">삭제</button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(staffList.length / itemsPerPage);
  const paginatedStaff = staffList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="스태프 관리"
          buttonLabel="스태프 추가"
          onButtonClick={() => setIsRegisterModalOpen(true)}
        />

        <div className="flex-1">
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

      <StaffEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        staff={selectedStaff}
        onUpdate={handleUpdateStaff}
      />

      <StaffRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={fetchStaffList}
      />
    </AdminLayout>
  );
};
