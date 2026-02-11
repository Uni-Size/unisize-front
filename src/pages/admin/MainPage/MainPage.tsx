import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import type { Column } from '@components/atoms/Table';
import { getPaymentPendingOrders, type PaymentPendingOrder } from '@/api/order';
import './MainPage.css';

interface PendingRow {
  id: number;
  no: number;
  measuredAt: string;
  studentName: string;
  gender: string;
  school: string;
  categorySummary: string;
  remainingAmount: string;
}

const toRow = (item: PaymentPendingOrder, index: number): PendingRow => ({
  id: item.order_id,
  no: index + 1,
  measuredAt: item.measurement_end_time,
  studentName: item.student_name,
  gender: item.gender,
  school: item.school_name,
  categorySummary: item.category_summary,
  remainingAmount: `${item.remaining_amount.toLocaleString()}원`,
});

export const MainPage = () => {
  const [orders, setOrders] = useState<PendingRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPaymentPendingOrders();
      setOrders(data.map(toRow));
    } catch (error) {
      console.error('결제 대기자 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns: Column<PendingRow>[] = [
    { key: 'no', header: 'No.', width: '34px', align: 'center' },
    { key: 'measuredAt', header: '측정완료', width: '130px', align: 'center' },
    { key: 'studentName', header: '학생이름', width: '100px', align: 'center' },
    { key: 'gender', header: '성별', width: '28px', align: 'center' },
    { key: 'school', header: '입학학교', align: 'center' },
    { key: 'categorySummary', header: '분류', width: '80px', align: 'center' },
    { key: 'remainingAmount', header: '결제 예정 금액', align: 'center' },
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
          {loading ? (
            <div className="main-page__loading">불러오는 중...</div>
          ) : (
            <Table
              columns={columns}
              data={orders}
              onRowClick={(order) => console.log('Order clicked:', order)}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
