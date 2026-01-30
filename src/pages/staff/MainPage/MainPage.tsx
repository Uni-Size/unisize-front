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
import './MainPage.css';

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
    <div className="staff-main-page">
      <header className="staff-main-page__header">
        <h1 className="staff-main-page__title">교복 측정</h1>
        <div className="staff-main-page__user-info">
          <span className="staff-main-page__user-name">
            {staff?.employee_name || '스태프'}
          </span>
          <button
            className="staff-main-page__logout-button"
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

      <main className="staff-main-page__content">
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
