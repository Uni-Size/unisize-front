import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { downloadCSV } from '@/utils/csvUtils';
import { formatGender } from '@/utils/genderUtils';
import { formatDate } from '@/utils/dateUtils';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { getOrders, ORDER_STATUS_LABELS } from '@/api/order';
import type { OrderStatus, PendingOrder } from '@/api/order';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Table } from '@components/atoms/Table';
import { Badge } from '@components/atoms/Badge';
import { Input } from '@components/atoms/Input';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import type { BadgeProps } from '@components/atoms/Badge';

const ITEMS_PER_PAGE = 10;

/** 화면 표시용 행. GET /api/v1/orders 응답 1건을 평평하게 편 형태다. */
interface StudentOrder {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  phone: string;
  school: string;
  grade: string;
  gender: string;
  items: string[];
  totalAmount: number;
  status: OrderStatus;
  statusDisplay: string;
  registeredDate: string;
}

const STATUS_VARIANTS: Record<OrderStatus, BadgeProps['variant']> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'info',
  receive: 'success',
  complete: 'success',
  cancelled: 'error',
};

const getStatusBadge = (row: StudentOrder) => (
  <Badge variant={STATUS_VARIANTS[row.status] ?? 'default'}>
    {row.statusDisplay}
  </Badge>
);

/**
 * 서버 응답(service.OrderResponse) → 테이블 행 변환.
 *
 * `student`는 서버가 Preload에 실패하면 통째로 빠질 수 있으므로(omitempty) 전부 옵셔널 접근한다.
 */
const toRow = (order: PendingOrder): StudentOrder => {
  const student = order.student;
  return {
    id: order.id,
    orderNumber: order.order_number,
    studentId: order.student_id,
    studentName: student?.name ?? '',
    // 학생 본인 번호가 없으면 보호자 번호로 폴백 (서버 Student.GetContactPhone과 같은 우선순위)
    phone: student?.student_phone || student?.guardian_phone || '',
    school: student?.admission_school ?? '',
    grade: student?.admission_grade ? `${student.admission_grade}학년` : '',
    gender: student?.gender ?? '',
    items: order.order_items
      .map((item) => item.product?.name)
      .filter((name): name is string => Boolean(name)),
    totalAmount: order.total_amount,
    status: order.order_status,
    statusDisplay:
      order.order_status_display ||
      ORDER_STATUS_LABELS[order.order_status] ||
      order.order_status,
    registeredDate: formatDate(order.order_date),
  };
};

export const StudentOrderPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<StudentOrder[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReactNode>(null);

  // 입력창은 searchTerm(즉시)을 그리고, 서버 요청은 debouncedSearch(300ms 지연)로만 나간다.
  // 타이핑 전에 trim해두면 뒤에 공백을 찍는 것만으로는 재요청이 생기지 않는다.
  const debouncedSearch = useDebouncedValue(searchTerm.trim(), 300);

  // 검색어가 바뀌면 페이지를 1로 되돌린다. 2페이지를 보던 중 검색해서 결과가 1페이지
  // 분량밖에 없으면 빈 화면이 나오기 때문이다.
  // useEffect가 아니라 렌더 중에 맞추는 이유: effect로 리셋하면 (이전 페이지 + 새 검색어)로
  // 한 번, (1페이지 + 새 검색어)로 또 한 번, 총 두 번 요청이 나간다.
  const [lastAppliedSearch, setLastAppliedSearch] = useState(debouncedSearch);
  if (lastAppliedSearch !== debouncedSearch) {
    setLastAppliedSearch(debouncedSearch);
    setCurrentPage(1);
  }

  useEffect(() => {
    // 응답이 요청 순서대로 도착한다는 보장이 없다. 검색어나 페이지가 바뀌어 이 effect가
    // 정리되면 ignore를 세워, 뒤늦게 도착한 이전 요청의 응답이 화면을 덮어쓰지 못하게 한다.
    let ignore = false;

    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const { orders: rawOrders, meta } = await getOrders({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          // 빈 문자열은 아예 보내지 않는다(서버는 무시하지만 URL만 지저분해진다).
          search: debouncedSearch || undefined,
        });
        if (ignore) return;
        setOrders(rawOrders.map(toRow));
        setTotalPages(Math.max(meta.total_pages, 1));
      } catch (err) {
        if (ignore) return;
        console.error('학생 주문 목록 조회 실패:', err);
        setError(
          getApiErrorMessage(
            err,
            '학생 주문 목록을 불러오는 중 오류가 발생했습니다.',
          ),
        );
        setOrders([]);
        setTotalPages(1);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadOrders();

    return () => {
      ignore = true;
    };
  }, [currentPage, debouncedSearch]);

  const columns: Column<StudentOrder>[] = [
    { key: 'studentName', header: '학생명', width: '100px' },
    { key: 'phone', header: '연락처', width: '130px' },
    { key: 'school', header: '학교', width: '120px' },
    { key: 'grade', header: '학년', width: '80px' },
    {
      key: 'gender',
      header: '성별',
      width: '60px',
      render: (item) => formatGender(item.gender),
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
      render: (item) => getStatusBadge(item),
    },
    { key: 'registeredDate', header: '등록일', width: '100px' },
  ];

  // 검색은 서버(GET /api/v1/orders?search=)가 전체 데이터를 대상으로 수행한다.
  // orders는 이미 필터가 적용된 현재 페이지의 결과다.

  const handleExportCSV = () => {
    downloadCSV(
      ['학생명', '연락처', '학교', '학년', '성별', '품목', '금액', '상태', '등록일'],
      orders.map((o) => [
        o.studentName,
        o.phone,
        o.school,
        o.grade,
        formatGender(o.gender),
        o.items.join(', '),
        `${o.totalAmount.toLocaleString()}원`,
        o.statusDisplay,
        o.registeredDate,
      ]),
      '학생주문목록',
    );
  };

  const emptyMessage: ReactNode = loading
    ? '불러오는 중...'
    : (error ??
      (debouncedSearch ? '검색 결과가 없습니다.' : '데이터가 없습니다.'));

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <AdminHeader
          title="학생 주문"
          buttonLabel="학생 추가"
          onButtonClick={() => console.log('학생 추가 클릭')}
          actions={
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-15 font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportCSV}
              disabled={orders.length === 0}
            >
              CSV 내보내기
            </button>
          }
        />
        <div className="border-y border-gray-200 overflow-hidden">
          <div className="flex items-stretch">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              검색어
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-white">
              <Input
                placeholder="학생명, 연락처, 학교로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Table
            columns={columns}
            data={orders}
            onRowClick={(order) => console.log('Student order clicked:', order)}
            getRowKey={(row) => row.id}
            emptyMessage={emptyMessage}
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
