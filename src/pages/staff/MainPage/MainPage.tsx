import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  startMeasurement,
  submitMeasurementOrder,
  completeMeasurement,
} from '../../../api/student';
import type { RegisterStudent, StartMeasurementResponse } from '../../../api/student';
import { useAuthStore } from '../../../stores/authStore';
import { logout } from '../../../api/auth';
import { StudentTable, ConfirmModal, MeasurementBottomSheet } from './components';
import { useStudents, useInfiniteScroll, useMeasurementForm } from './hooks';
import Toast from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { AxiosError } from 'axios';

export const MainPage = () => {
  const navigate = useNavigate();
  const { staff, clearAuth } = useAuthStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isMeasurementOpen, setIsMeasurementOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<RegisterStudent | null>(null);
  const [measurementData, setMeasurementData] = useState<StartMeasurementResponse | null>(null);
  const { toast, showToast, hideToast } = useToast();

  const form = useMeasurementForm();

  const {
    students,
    isLoading,
    error,
    total,
    hasMore,
    isFetchingMore,
    loadMore,
    refresh,
  } = useStudents();

  const { lastElementRef } = useInfiniteScroll({
    isLoading,
    isFetchingMore,
    hasMore,
    onLoadMore: loadMore,
  });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      clearAuth();
      navigate('/staff/login');
    }
  };

  const handleDetailClick = (student: RegisterStudent) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };

  const handleStartMeasurement = async () => {
    if (!selectedStudent) return;
    try {
      const data = await startMeasurement(selectedStudent.id);
      setMeasurementData(data);
      form.initFromResponse(data);
      setIsConfirmOpen(false);
      setIsMeasurementOpen(true);
      refresh();
    } catch (error) {
      console.error('Failed to start measurement:', error);
      if (error instanceof AxiosError && error.response?.status === 409) {
        setIsConfirmOpen(false);
        showToast('다른 직원이 이미 측정을 시작했습니다.');
        refresh();
      }
    }
  };

  const needsSizeSelection = (availableSizes: { size: string }[]) =>
    availableSizes.length > 1 || (availableSizes.length === 1 && availableSizes[0].size !== 'FREE');

  const getMissingSizeItemNames = () => {
    const missingUniforms = [...form.winterUniforms, ...form.summerUniforms]
      .filter((u) => u.supportedQuantity + u.additionalQuantity > 0 && !u.selectedSize)
      .map((u) => u.name);
    const missingSupplies = form.supplies
      .filter((s) => s.quantity > 0 && !s.selectedSize && needsSizeSelection(s.availableSizes))
      .map((s) => s.name);
    return [...missingUniforms, ...missingSupplies];
  };

  const buildOrderPayload = () => ({
    uniform_items: [...form.winterUniforms, ...form.summerUniforms].map((u) => ({
      item_id: Number(u.productId),
      name: u.name,
      season: u.season === 'winter' ? '동복' : '하복' as '동복' | '하복',
      selected_size: u.selectedSize || '',
      purchase_count: u.supportedQuantity + u.additionalQuantity,
      is_reserved: u.reservation,
      customization: u.repair || undefined,
      name_tag_count: u.nameTagCount || undefined,
      name_tag_attach: u.nameTagAttach ? u.nameTagCount : undefined,
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
    name_tag_name: form.nameTagName || undefined,
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
    const missingSizeItems = getMissingSizeItemNames();
    if (missingSizeItems.length > 0) {
      showToast(`사이즈를 선택해주세요: ${missingSizeItems.join(', ')}`);
      return;
    }
    const payload = buildOrderPayload();
    await completeMeasurement(selectedStudent.id, { ...payload, signature });
    setIsMeasurementOpen(false);
    setMeasurementData(null);
    setSelectedStudent(null);
    form.reset();
    showToast('확정 완료되었습니다.');
    refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 m-0">교복 측정</h1>
        <div className="flex items-center gap-3">
          <button
            className="text-sm text-gray-600 hover:text-blue-600 hover:underline bg-transparent border-none cursor-pointer"
            onClick={() => navigate('/staff/my')}
          >
            {staff?.employee_name || '스태프'}
          </button>
          <button
            className="px-4 py-2 text-sm text-gray-500 bg-transparent border border-gray-300 rounded-md transition-all duration-150 hover:bg-gray-100 hover:text-gray-700"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </header>

      {isConfirmOpen && selectedStudent && (
        <ConfirmModal
          student={selectedStudent}
          onCancel={() => { setSelectedStudent(null); setIsConfirmOpen(false); }}
          onConfirm={handleStartMeasurement}
        />
      )}

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
        nameTagMinUnit={form.nameTagMinUnit}
        nameTagName={form.nameTagName}
        onUpdateNameTagName={form.setNameTagName}
        onUpdateUniform={form.updateUniform}
        onAddUniformFromProduct={form.addUniformFromProduct}
        onAddUniformRow={form.addUniformRow}
        onRemoveUniformRow={form.removeUniformRow}
        onUpdateSupply={form.updateSupply}
        onAddSupplyRow={form.addSupplyRow}
        onRemoveSupplyRow={form.removeSupplyRow}
        onUpdateNameTagOrderQuantity={form.updateNameTagOrderQuantity}
        onConfirm={handleConfirm}
      />

      <main className="px-5 pb-5">
        <StudentTable
          students={students}
          total={total}
          isLoading={isLoading}
          error={error}
          isFetchingMore={isFetchingMore}
          lastElementRef={lastElementRef}
          onDetailClick={handleDetailClick}
        />
      </main>

      {toast && <Toast message={toast} onClose={hideToast} />}
    </div>
  );
};
