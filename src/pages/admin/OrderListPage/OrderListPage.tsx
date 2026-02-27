import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms';
import { Table } from '@components/atoms/Table';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import { getSupportedSchoolsByYear } from '@/api/school';
import { getTargetYear } from '@/utils/schoolUtils';

type SchoolType = 'middle' | 'high';

interface OrderListPageProps {
  schoolType: SchoolType;
}

interface PendingStudent {
  id: string;
  no: number;
  measuredAt: string;
  studentName: string;
  gender: '남' | '여';
  school: string;
  category: '신입' | '재학';
  expectedAmount: string;
}

export const OrderListPage = ({ schoolType }: OrderListPageProps) => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolName, setSchoolName] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (!schoolId) return;
    const targetYear = getTargetYear();
    getSupportedSchoolsByYear(targetYear).then((schools) => {
      const found = schools.find((s) => s.id === Number(schoolId));
      if (found) setSchoolName(found.name);
    });
  }, [schoolId]);

  const getTitle = () => {
    if (schoolName) return schoolName;
    const targetYear = getTargetYear();
    return schoolType === 'middle' ? `[${targetYear}]주관구매 -중` : `[${targetYear}]주관구매 -고`;
  };

  // TODO: 실제 API 연동 시 학교별 학생 데이터를 가져오도록 교체
  const data: PendingStudent[] = [];
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<PendingStudent>[] = [
    { key: 'no', header: 'No.', width: '34px', align: 'center' },
    { key: 'measuredAt', header: '측정완료', width: '130px', align: 'center' },
    { key: 'studentName', header: '학생이름', width: '100px', align: 'center' },
    { key: 'gender', header: '성별', width: '28px', align: 'center' },
    { key: 'school', header: '입학학교', align: 'center' },
    { key: 'category', header: '분류', width: '28px', align: 'center' },
    { key: 'expectedAmount', header: '결제 예정 금액', align: 'center' },
    {
      key: 'detail',
      header: '상세',
      width: '42px',
      align: 'center',
      render: () => (
        <button className="flex items-center justify-center bg-none border-none cursor-pointer p-1 hover:opacity-70" aria-label="상세 보기">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col gap-5 p-5">
        <AdminHeader title={getTitle()} />
        <div className="flex flex-col">
          <Table
            columns={columns}
            data={paginatedData}
            onRowClick={(student) => console.log('Student clicked:', student)}
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
