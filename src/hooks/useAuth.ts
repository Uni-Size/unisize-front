import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { logout as apiLogout } from '@/api/auth';

/**
 * 인증 상태를 확인하고 관리하는 훅
 * @param requireAuth - true일 경우 인증되지 않았을 때 로그인 페이지로 리다이렉트
 */
export function useAuth(requireAuth = false) {
  const navigate = useNavigate();
  const { isAuthenticated, staff, clearAuth } = useAuthStore();

  useEffect(() => {
    // 인증이 필요한데 인증되지 않은 경우 로그인 페이지로 리다이렉트
    if (requireAuth && !isAuthenticated) {
      navigate('/staff/login');
    }
  }, [requireAuth, isAuthenticated, navigate]);

  // 로그아웃 핸들러
  const logout = async () => {
    try {
      // API 로그아웃 호출
      await apiLogout();
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    } finally {
      // store 상태 초기화
      clearAuth();
      // 로그인 페이지로 리다이렉트
      navigate('/staff/login');
    }
  };

  return {
    isAuthenticated,
    staff,
    logout,
  };
}
