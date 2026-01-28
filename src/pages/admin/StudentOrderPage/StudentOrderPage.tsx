import { useState } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import { Badge } from '@components/atoms/Badge';
import { Input } from '@components/atoms/Input';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import './StudentOrderPage.css';

interface StudentOrder {
  id: string;
  studentName: string;
  phone: string;
  school: string;
  grade: string;
  className: string;
  gender: 'male' | 'female';
  items: string[];
  totalAmount: number;
  status: 'pending' | 'measured' | 'ordered' | 'received';
  registeredDate: string;
}

const mockStudentOrders: StudentOrder[] = [
  {
    id: '1',
    studentName: '김민수',
    phone: '010-1234-5678',
    school: '가경중학교',
    grade: '1',
    className: '3',
    gender: 'male',
    items: ['하복 상의', '하복 하의', '체육복'],
    totalAmount: 350000,
    status: 'pending',
    registeredDate: '2024-01-15',
  },
  {
    id: '2',
    studentName: '이영희',
    phone: '010-2345-6789',
    school: '가경중학교',
    grade: '2',
    className: '1',
    gender: 'female',
    items: ['동복 상의', '동복 하의'],
    totalAmount: 280000,
    status: 'measured',
    registeredDate: '2024-01-14',
  },
];

const getStatusBadge = (status: StudentOrder['status']) => {
  const variants = {
    pending: { variant: 'warning' as const, label: '대기' },
    measured: { variant: 'info' as const, label: '치수측정' },
    ordered: { variant: 'default' as const, label: '주문완료' },
    received: { variant: 'success' as const, label: '수령완료' },
  };
  const { variant, label } = variants[status];
  return <Badge variant={variant}>{label}</Badge>;
};

export const StudentOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columns: Column<StudentOrder>[] = [
    { key: 'studentName', header: '학생명', width: '100px' },
    { key: 'phone', header: '연락처', width: '130px' },
    { key: 'school', header: '학교', width: '120px' },
    {
      key: 'gradeClass',
      header: '학년/반',
      width: '80px',
      render: (item) => `${item.grade}-${item.className}`,
    },
    {
      key: 'gender',
      header: '성별',
      width: '60px',
      render: (item) => (item.gender === 'male' ? '남' : '여'),
    },
    {
      key: 'items',
      header: '품목',
      width: '150px',
      render: (item) => item.items.join(', '),
    },
    {
      key: 'totalAmount',
      header: '금액',
      width: '100px',
      render: (item) => `${item.totalAmount.toLocaleString()}원`,
    },
    {
      key: 'status',
      header: '상태',
      width: '80px',
      render: (item) => getStatusBadge(item.status),
    },
    { key: 'registeredDate', header: '등록일', width: '100px' },
  ];

  const filteredOrders = mockStudentOrders.filter(
    (order) =>
      order.studentName.includes(searchTerm) ||
      order.phone.includes(searchTerm) ||
      order.school.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="student-order-page">
        <AdminHeader
          title="학생 주문"
          buttonLabel="학생 추가"
          onButtonClick={() => console.log('학생 추가 클릭')}
        />
        <div className="student-order-page__search">
          <Input
            placeholder="학생명, 연락처, 학교로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="student-order-page__content">
          <Table
            columns={columns}
            data={paginatedOrders}
            onRowClick={(order) => console.log('Student order clicked:', order)}
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
