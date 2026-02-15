import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms';
import { Table } from '@components/atoms/Table';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';

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

// 학교별 더미 데이터
const schoolStudentsData: Record<string, PendingStudent[]> = {
  // 중학교
  gakyung: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '김민수', gender: '남', school: '가경중학교', category: '신입', expectedAmount: '112,335원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '이서연', gender: '여', school: '가경중학교', category: '신입', expectedAmount: '98,500원' },
    { id: '3', no: 3, measuredAt: '25/01/12 16:00', studentName: '박지훈', gender: '남', school: '가경중학교', category: '신입', expectedAmount: '105,200원' },
  ],
  kyungduk: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '최유진', gender: '여', school: '경덕중학교', category: '신입', expectedAmount: '92,800원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '정현우', gender: '남', school: '경덕중학교', category: '신입', expectedAmount: '118,400원' },
  ],
  bokdae: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '강수빈', gender: '여', school: '복대중학교', category: '신입', expectedAmount: '89,600원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '윤도현', gender: '남', school: '복대중학교', category: '신입', expectedAmount: '110,000원' },
  ],
  sannam: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '임서아', gender: '여', school: '산남중학교', category: '신입', expectedAmount: '95,300원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '한지민', gender: '여', school: '산남중학교', category: '신입', expectedAmount: '101,700원' },
  ],
  saengmyung: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '김태윤', gender: '남', school: '생명중학교', category: '신입', expectedAmount: '108,200원' },
  ],
  sekwang: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '박소연', gender: '여', school: '세광중학교', category: '신입', expectedAmount: '94,100원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '이준서', gender: '남', school: '세광중학교', category: '신입', expectedAmount: '112,800원' },
  ],
  yongsung: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '최민지', gender: '여', school: '용성중학교', category: '신입', expectedAmount: '87,500원' },
  ],
  yullyang: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '정다은', gender: '여', school: '율량중학교', category: '신입', expectedAmount: '103,400원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '강현준', gender: '남', school: '율량중학교', category: '신입', expectedAmount: '115,600원' },
  ],
  jungang: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '윤서영', gender: '여', school: '중앙여자중학교', category: '신입', expectedAmount: '91,200원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '김하늘', gender: '여', school: '중앙여자중학교', category: '신입', expectedAmount: '98,700원' },
  ],
  // 고등학교
  'sekwang-high': [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '김인철', gender: '남', school: '세광고등학교', category: '신입', expectedAmount: '142,500원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '최동훈', gender: '남', school: '세광고등학교', category: '신입', expectedAmount: '148,300원' },
  ],
  ochang: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '이준혁', gender: '남', school: '오창고등학교', category: '신입', expectedAmount: '138,200원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '정하늘', gender: '여', school: '오창고등학교', category: '신입', expectedAmount: '132,100원' },
  ],
  cheongju: [
    { id: '1', no: 1, measuredAt: '25/01/12 15:00', studentName: '박서영', gender: '여', school: '청주고등학교', category: '신입', expectedAmount: '125,800원' },
    { id: '2', no: 2, measuredAt: '25/01/12 15:30', studentName: '강민재', gender: '남', school: '청주고등학교', category: '신입', expectedAmount: '155,600원' },
  ],
};

// 학교 ID와 이름 매핑
const schoolNameMap: Record<string, string> = {
  gakyung: '가경중학교',
  kyungduk: '경덕중학교',
  bokdae: '복대중학교',
  sannam: '산남중학교',
  saengmyung: '생명중학교',
  sekwang: '세광중학교',
  yongsung: '용성중학교',
  yullyang: '율량중학교',
  jungang: '중앙여자중학교',
  'sekwang-high': '세광고등학교',
  ochang: '오창고등학교',
  cheongju: '청주고등학교',
};

export const OrderListPage = ({ schoolType }: OrderListPageProps) => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getTitle = () => {
    if (schoolId && schoolNameMap[schoolId]) {
      return schoolNameMap[schoolId];
    }
    return schoolType === 'middle' ? '[2026]주관구매 -중' : '[2026]주관구매 -고';
  };

  const getData = () => {
    if (schoolId && schoolStudentsData[schoolId]) {
      return schoolStudentsData[schoolId];
    }
    return [];
  };

  const data = getData();
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
