import { useState } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import './StaffListPage.css';

interface Staff {
  id: string;
  no: number;
  year: string;
  name: string;
  gender: '남' | '여';
  phone: string;
  registeredDate: string;
}

const mockStaff: Staff[] = [
  { id: '1', no: 1, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
  { id: '2', no: 2, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
  { id: '3', no: 3, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
  { id: '4', no: 4, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
  { id: '5', no: 5, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
  { id: '6', no: 6, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
  { id: '7', no: 7, year: '2026', name: '김인철', gender: '남', phone: '010-5571-8239', registeredDate: '25/12/12' },
];

export const StaffListPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columns: Column<Staff>[] = [
    { key: 'no', header: 'No.', width: '34px', align: 'center' },
    { key: 'year', header: '년도', width: '100px', align: 'center' },
    { key: 'name', header: '학생이름', align: 'center' },
    { key: 'gender', header: '성별', width: '28px', align: 'center' },
    { key: 'phone', header: '연락처', align: 'center' },
    { key: 'registeredDate', header: '등록일', align: 'center' },
    {
      key: 'actions',
      header: '관리',
      width: '80px',
      align: 'center',
      render: () => (
        <div className="staff-list-page__action-buttons">
          <button className="staff-list-page__action-btn staff-list-page__action-btn--edit">수정</button>
          <button className="staff-list-page__action-btn staff-list-page__action-btn--delete">삭제</button>
        </div>
      ),
    },
  ];

  const totalPages = Math.ceil(mockStaff.length / itemsPerPage);
  const paginatedStaff = mockStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="staff-list-page">
        <AdminHeader
          title="스태프 관리"
          buttonLabel="스태프 추가"
          onButtonClick={() => console.log('스태프 추가 클릭')}
        />

        <div className="staff-list-page__content">
          <Table
            columns={columns}
            data={paginatedStaff}
            onRowClick={(staff) => console.log('Staff clicked:', staff)}
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
