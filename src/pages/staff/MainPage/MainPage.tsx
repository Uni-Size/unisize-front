import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { startMeasurement } from '../../../api/student';
import type { RegisterStudent, StartMeasurementResponse } from '../../../api/student';
import { useAuthStore } from '../../../stores/authStore';
import { logout } from '../../../api/auth';
import { StudentTable, ConfirmModal } from './components';
import { useStudents, useInfiniteScroll } from './hooks';
import Toast from '../../../components/ui/Toast';
import { useToast } from '../../../hooks/useToast';
import { AxiosError } from 'axios';

export const MainPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, staff, clearAuth } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<RegisterStudent | null>(null);
  const [, setMeasurementData] =
    useState<StartMeasurementResponse | null>(null);
  const { toast, showToast, hideToast } = useToast();

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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/staff/login');
    }
  }, [isAuthenticated, navigate]);

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
    setIsModalOpen(true);
  };

  const handleStartMeasurement = async () => {
    if (!selectedStudent) return;

    try {
      const data = await startMeasurement(selectedStudent.id);
      setMeasurementData(data);
      setIsModalOpen(false);
      // TODO: 측정 시트 열기
      console.log('측정 데이터:', data);
      showToast('측정이 시작되었습니다.');
      refresh();
    } catch (error) {
      console.error('Failed to start measurement:', error);

      if (error instanceof AxiosError && error.response?.status === 409) {
        setIsModalOpen(false);
        showToast('다른 직원이 이미 측정을 시작했습니다.');
        refresh();
      }
    }
  };

  const handleCancelModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-5 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 m-0">교복 측정</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {staff?.employee_name || '스태프'}
          </span>
          <button
            className="px-4 py-2 text-sm text-gray-500 bg-transparent border border-gray-300 rounded-md transition-all duration-150 hover:bg-gray-100 hover:text-gray-700"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </div>
      </header>

      {isModalOpen && selectedStudent && (
        <ConfirmModal
          student={selectedStudent}
          onCancel={handleCancelModal}
          onConfirm={handleStartMeasurement}
        />
      )}

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
