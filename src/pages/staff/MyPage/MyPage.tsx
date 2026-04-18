import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { getStaffProfile, getMyPaymentPending } from '../../../api/staff';
import { getRegisterStudents, startMeasurement } from '../../../api/student';
import type { StaffProfile, PaymentPendingOrder } from '../../../api/staff';
import type { RegisterStudent, StartMeasurementResponse } from '../../../api/student';
import { StudentTable, MeasurementConfirmModal } from '../../../components/staff';
import Toast from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { AxiosError } from 'axios';

type Tab = 'in_progress' | 'payment_pending';

export const MyPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, staff } = useAuthStore();
  const { toast, showToast, hideToast } = useToast();

  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('in_progress');

  const [inProgressStudents, setInProgressStudents] = useState<RegisterStudent[]>([]);
  const [inProgressTotal, setInProgressTotal] = useState(0);
  const [inProgressLoading, setInProgressLoading] = useState(true);

  const [pendingOrders, setPendingOrders] = useState<PaymentPendingOrder[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RegisterStudent | null>(null);
  const [, setMeasurementData] = useState<StartMeasurementResponse | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/staff/login');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    getStaffProfile().then(setProfile).catch(console.error);
  }, []);

  const fetchInProgress = useCallback(async () => {
    setInProgressLoading(true);
    try {
      const response = await getRegisterStudents({ page: 1, limit: 100 });
      if (response.success && response.data) {
        setInProgressStudents(response.data.students);
        setInProgressTotal(response.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setInProgressLoading(false);
    }
  }, []);

  const fetchPending = useCallback(async () => {
    setPendingLoading(true);
    try {
      const data = await getMyPaymentPending();
      setPendingOrders(data.orders);
      setPendingTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInProgress();
  }, [fetchInProgress]);

  useEffect(() => {
    if (activeTab === 'payment_pending') fetchPending();
  }, [activeTab, fetchPending]);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  const handleDetailClick = (student: RegisterStudent) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleStartMeasurement = async () => {
    if (!selectedStudent) return;
    try {
      const data = await startMeasurement(selectedStudent.id);
      setMeasurementData(data);
      setIsModalOpen(false);
      showToast('측정이 시작되었습니다.');
      fetchInProgress();
    } catch (error) {
      console.error(error);
      if (error instanceof AxiosError && error.response?.status === 409) {
        setIsModalOpen(false);
        showToast('다른 직원이 이미 측정을 시작했습니다.');
        fetchInProgress();
      }
    }
  };

  const handleCancelModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const filteredOrders = pendingOrders.filter((o) =>
    o.student_name.includes(searchQuery)
  );

  const stats = profile?.staff_stats;

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <button
          className="text-sm text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer"
          onClick={() => navigate('/staff')}
        >
          ← 뒤로
        </button>
        <h1 className="text-xl font-bold text-gray-800">마이페이지</h1>
        <span className="text-sm text-gray-600">담당자 : {staff?.employee_name || ''}</span>
      </header>

      {/* 통계 */}
      <div className="flex justify-end gap-3 px-5 pt-4">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-500">누적 측정</span>
          <span className="font-bold text-gray-800">{stats?.total_students_handled ?? '-'}</span>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-500">오늘 측정</span>
          <span className="font-bold text-gray-800">{stats?.today_students_handled ?? '-'}</span>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <span className="text-gray-500">측정 중</span>
          <span className="font-bold text-gray-800">{stats?.currently_measuring ?? '-'}</span>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-gray-200 mt-4 px-5 bg-white">
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'in_progress'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('in_progress')}
        >
          확정 진행 중
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'payment_pending'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('payment_pending')}
        >
          결제 전
        </button>
      </div>

      <main className="px-5 pb-5">
        {activeTab === 'in_progress' && (
          <StudentTable
            students={inProgressStudents}
            total={inProgressTotal}
            isLoading={inProgressLoading}
            onDetailClick={handleDetailClick}
            emptyMessage="모든 학교 사이즈 측정이 완료 되었습니다. 수고 하셨습니다."
          />
        )}

        {activeTab === 'payment_pending' && (
          <>
            <div className="pt-4 pb-2">
              <input
                type="text"
                placeholder="학생 이름을 검색하세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div className="text-sm text-gray-600 pb-2">총 {pendingTotal}명</div>
            {pendingLoading ? (
              <div className="flex justify-center items-center py-12 text-gray-500">로딩 중...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex justify-center items-center py-12 text-gray-400">결제 전 학생이 없습니다.</div>
            ) : (
              <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    {['No.', '측정완료시간', '학생이름', '성별', '학교', '카테고리', '상세'].map((h, i) => (
                      <th
                        key={i}
                        className={`px-2 py-3 text-center text-sm font-semibold text-gray-700 ${
                          i === 0 ? 'w-6' : i === 1 ? 'w-28' : i === 2 ? 'w-16' : i === 3 ? 'w-10' : i === 4 ? 'w-28' : i === 5 ? 'w-auto' : 'w-10'
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="border-t border-gray-200">
                  {filteredOrders.map((order, index) => (
                    <tr key={order.order_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{index + 1}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                        <span className="break-keep">{order.measurement_end_time}</span>
                      </td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{order.student_name}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{order.gender === 'M' ? '남' : '여'}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center font-bold">{order.school_name}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{order.category_summary}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                        <button className="text-blue-600 bg-none border-none cursor-pointer text-base px-2 py-1 hover:text-blue-700 hover:underline">
                          ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </main>

      {isModalOpen && selectedStudent && (
        <MeasurementConfirmModal
          student={selectedStudent}
          onCancel={handleCancelModal}
          onConfirm={handleStartMeasurement}
        />
      )}

      {toast && <Toast message={toast} onClose={hideToast} />}
    </div>
  );
};
