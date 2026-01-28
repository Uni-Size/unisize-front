import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import type { Column } from '@components/atoms/Table';
import './MainPage.css';

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

const mockPendingStudents: PendingStudent[] = Array.from({ length: 13 }, (_, i) => ({
  id: String(i + 1),
  no: i + 1,
  measuredAt: '25/01/12 15:00',
  studentName: '김인철',
  gender: '남',
  school: '청주고등학교',
  category: '신입',
  expectedAmount: '112,335원',
}));

export const MainPage = () => {
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
        <button className="detail-button" aria-label="상세 보기">
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
      <div className="main-page">
<AdminHeader title="결제 대기자" />

        <div className="main-page__content">
          <Table
            columns={columns}
            data={mockPendingStudents}
            onRowClick={(student) => console.log('Student clicked:', student)}
          />
        </div>
      </div>
    </AdminLayout>
  );
};
