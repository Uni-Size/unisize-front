import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../stores/authStore';
import { getStaffProfile, getMyPaymentPending } from '../../../api/staff';
import {
  getMeasuringStudents,
  getMeasurementPage,
  submitMeasurementOrder,
  completeMeasurement,
} from '../../../api/student';
import type {
  RegisterStudent,
  StartMeasurementResponse,
} from '../../../api/student';
import { formatGender } from '../../../utils/genderUtils';
import type { StaffProfile, PaymentPendingOrder } from '../../../api/staff';
import Toast from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { formatDateTime } from '@/utils/dateUtils';
import { MeasurementBottomSheet } from '../MainPage/components';
import { useMeasurementForm } from '../MainPage/hooks';

type Tab = 'in_progress' | 'payment_pending';

export const MyPage = () => {
  const navigate = useNavigate();
  const { staff } = useAuthStore();
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

  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RegisterStudent | null>(null);
  const [measurementData, setMeasurementData] = useState<StartMeasurementResponse | null>(null);

  const form = useMeasurementForm();

  useEffect(() => {
    getStaffProfile().then(setProfile).catch(console.error);
  }, []);

  const fetchInProgress = useCallback(async () => {
    setInProgressLoading(true);
    try {
      const response = await getMeasuringStudents({ page: 1, limit: 100 });
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

  const handleStudentClick = async (student: RegisterStudent) => {
    try {
      const data = await getMeasurementPage(student.id);
      setSelectedStudent(student);
      setMeasurementData(data);
      form.initFromResponse(data);
      setIsMeasurementOpen(true);
    } catch (err) {
      console.error('측정 데이터 조회 실패:', err);
      showToast('측정 데이터를 불러오는데 실패했습니다.');
    }
  };

  const handlePendingOrderClick = async (order: PaymentPendingOrder) => {
    try {
      const data = await getMeasurementPage(order.student_id);
      const fakeStudent: RegisterStudent = {
        id: order.student_id,
        name: order.student_name,
        gender: order.gender,
        birth_date: '',
        student_phone: '',
        guardian_phone: '',
        previous_school: '',
        admission_year: 0,
        admission_grade: 0,
        admission_school: order.school_name,
        school_name: order.school_name,
        class_name: '',
        student_number: '',
        address: '',
        privacy_consent: false,
        delivery: false,
        student_type: '',
        checked_in_at: order.measurement_end_time,
        created_at: '',
        updated_at: '',
      };
      setSelectedStudent(fakeStudent);
      setMeasurementData(data);
      form.initFromResponse(data);
      setIsMeasurementOpen(true);
    } catch (err) {
      console.error('측정 데이터 조회 실패:', err);
      showToast('측정 데이터를 불러오는데 실패했습니다.');
    }
  };

  const buildOrderPayload = () => ({
    uniform_items: [...form.winterUniforms, ...form.summerUniforms].map((u) => ({
      item_id: Number(u.productId),
      name: u.name,
      season: u.season === 'winter' ? '동복' : '하복' as '동복' | '하복',
      selected_size: u.selectedSize || 0,
      purchase_count: u.supportedQuantity + u.additionalQuantity,
      is_reserved: u.reservation,
      customization: u.repair || undefined,
      name_tag_count: u.nameTagCount || undefined,
      name_tag_attach: u.nameTagAttach || undefined,
    })),
    supply_items: form.supplies
      .filter((s) => s.quantity > 0)
      .map((s) => ({
        item_id: s.productId,
        name: s.name,
        selected_size: s.selectedSize || '',
        purchase_count: s.quantity,
      })),
    notes: '',
  });

  const handleTempSave = async () => {
    if (!selectedStudent) return;
    await submitMeasurementOrder(selectedStudent.id, buildOrderPayload());
  };

  const handleNext = async () => {
    if (!selectedStudent) return;
    await submitMeasurementOrder(selectedStudent.id, buildOrderPayload());
  };

  const handleMeasurementClose = () => {
    setIsMeasurementOpen(false);
    setMeasurementData(null);
    setSelectedStudent(null);
    form.reset();
  };

  const handleConfirm = async (signature: string) => {
    if (!selectedStudent) return;
    await completeMeasurement(selectedStudent.id, { signature });
    setIsMeasurementOpen(false);
    setMeasurementData(null);
    setSelectedStudent(null);
    form.reset();
    showToast('확정 완료되었습니다.');
    fetchInProgress();
  };

  const filteredOrders = pendingOrders.filter((o) =>
    o.student_name.includes(searchQuery),
  );

  const stats = profile?.staff_stats;

  const renderInProgressTable = () => {
    if (inProgressLoading) {
      return <div className="flex justify-center items-center py-12 text-gray-500">로딩 중...</div>;
    }
    if (inProgressStudents.length === 0) {
      return (
        <div className="flex justify-center items-center py-12 text-gray-400">
          모든 학교 사이즈 측정이 완료 되었습니다. 수고 하셨습니다.
        </div>
      );
    }
    return (
      <>
        <div className="text-sm text-gray-600 pt-4 pb-2">총 {inProgressTotal}명</div>
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              {['No.', '접수시간', '학생이름', '성별', '출신학교 → 입학학교', '상세'].map((h, i) => (
                <th
                  key={i}
                  className={`px-2 py-3 text-center text-sm font-semibold text-gray-700 ${
                    i === 0 ? 'w-8' : i === 1 ? 'w-32' : i === 2 ? 'w-20' : i === 3 ? 'w-10' : i === 5 ? 'w-12' : ''
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="border-t border-gray-200">
            {inProgressStudents.map((student, index) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{index + 1}</td>
                <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                  <span className="break-keep">{student.checked_in_at}</span>
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{student.name}</td>
                <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{formatGender(student.gender)}</td>
                <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                  {student.previous_school} → <span className="font-bold">{student.admission_school}</span>
                </td>
                <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                  <button
                    className="text-blue-600 bg-none border-none cursor-pointer text-base px-2 py-1 hover:text-blue-700 hover:underline"
                    onClick={() => handleStudentClick(student)}
                  >
                    ↗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };

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
        {activeTab === 'in_progress' && renderInProgressTable()}

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
                        <span className="break-keep">{formatDateTime(order.measurement_end_time)}</span>
                      </td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{order.student_name}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{formatGender(order.gender)}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center font-bold">{order.school_name}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">{order.category_summary}</td>
                      <td className="px-2 py-3 text-sm text-gray-900 border-b border-gray-200 text-center">
                        <button
                          className="text-blue-600 bg-none border-none cursor-pointer text-base px-2 py-1 hover:text-blue-700 hover:underline"
                          onClick={() => handlePendingOrderClick(order)}
                        >
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

      <MeasurementBottomSheet
        isOpen={isMeasurementOpen}
        onClose={handleMeasurementClose}
        onTempSave={handleTempSave}
        onError={showToast}
        onNext={handleNext}
        student={selectedStudent}
        measurementData={measurementData}
        winterUniforms={form.winterUniforms}
        summerUniforms={form.summerUniforms}
        supplies={form.supplies}
        nameTag={form.nameTag}
        onUpdateUniform={form.updateUniform}
        onAddUniformFromProduct={form.addUniformFromProduct}
        onAddUniformRow={form.addUniformRow}
        onRemoveUniformRow={form.removeUniformRow}
        onUpdateSupply={form.updateSupply}
        onAddSupplyRow={form.addSupplyRow}
        onRemoveSupplyRow={form.removeSupplyRow}
        nameTagMinUnit={form.nameTagMinUnit}
        nameTagName={form.nameTagName}
        onUpdateNameTagName={form.setNameTagName}
        onUpdateNameTagOrderQuantity={form.updateNameTagOrderQuantity}
        onConfirm={handleConfirm}
      />

      {toast && <Toast message={toast} onClose={hideToast} />}
    </div>
  );
};
