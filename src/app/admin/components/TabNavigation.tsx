'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/api/authApi';

export interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export default function TabNavigation({
  tabs,
  activeTab: controlledActiveTab,
  onTabChange,
}: TabNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { staff, clearAuth } = useAuthStore();

  // Determine active tab from pathname
  const getActiveTabFromPath = () => {
    if (pathname === '/admin') return 'smart-uniform';
    const pathParts = pathname.split('/');
    return pathParts[pathParts.length - 1] || 'smart-uniform';
  };

  const activeTab = controlledActiveTab ?? getActiveTabFromPath();

  const handleTabClick = (tabId: string) => {
    onTabChange?.(tabId);

    // Navigate to the corresponding page
    if (tabId === 'smart-uniform') {
      router.push('/admin');
    } else {
      router.push(`/admin/${tabId}`);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
      clearAuth();
      router.push('/staff/login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      // 에러가 발생해도 로컬 상태는 초기화하고 로그인 페이지로 이동
      clearAuth();
      router.push('/staff/login');
    }
  };

  return (
    <div className="bg-white shadow mb-6">
      <nav className="flex border-b border-gray-200 justify-between items-center">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 우측 영역: 관리자 정보 및 로그아웃 */}
        <div className="flex items-center gap-4 px-6">
          {staff && (
            <>
              <span className="text-sm text-gray-600">
                관리자: <span className="font-medium text-gray-900">{staff.employee_name}</span>
              </span>
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                type="button"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
