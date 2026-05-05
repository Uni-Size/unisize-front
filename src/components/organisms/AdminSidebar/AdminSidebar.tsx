import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSchoolList } from '@/api/school';
import type { SchoolListItem } from '@/api/school';
import { getTargetYear } from '@/utils/schoolUtils';
import { logout } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

interface SchoolSubPage {
  id: string;
  name: string;
  path: string;
}

interface SchoolItem {
  id: string;
  name: string;
  basePath: string;
  subPages: SchoolSubPage[];
}

interface SubMenuItem {
  id: string;
  name: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  subMenus?: SubMenuItem[];
  schoolItems?: SchoolItem[];
}

// 스태프 서브메뉴
const staffSubMenus: SubMenuItem[] = [
  { id: 'staff-manage', name: '관리', path: '/admin/staff' },
  { id: 'staff-approval', name: '승인', path: '/admin/staff/approval' },
];

const toSchoolItem = (school: SchoolListItem, type: 'elementary' | 'middle' | 'high'): SchoolItem => {
  const id = school.id ?? school.school_name;
  const basePath = `/admin/orders/${type}/${id}`;
  return {
    id: `school-${id}`,
    name: school.school_name,
    basePath,
    subPages: [
      { id: `school-${id}-students`, name: '학생', path: `${basePath}/students` },
      { id: `school-${id}-orders`, name: '주문/예약', path: `${basePath}/orders` },
    ],
  };
};

// ============================================================================
// AdminSidebar
// ============================================================================

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // 실패해도 로컬 인증 정보는 제거
    } finally {
      clearAuth();
      navigate('/admin/login');
    }
  };
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [expandedSchools, setExpandedSchools] = useState<string[]>([]);
  const [elementarySchools, setElementarySchools] = useState<SchoolItem[]>([]);
  const [middleSchools, setMiddleSchools] = useState<SchoolItem[]>([]);
  const [highSchools, setHighSchools] = useState<SchoolItem[]>([]);
  const targetYear = getTargetYear();

  // API에서 학교 목록 조회
  useEffect(() => {
    getSchoolList({ is_active: true, year: targetYear })
      .then(({ schools }) => {
        const sort = (a: SchoolListItem, b: SchoolListItem) =>
          a.school_name.localeCompare(b.school_name, 'ko');
        setElementarySchools(
          schools.filter((s) => s.school_type === '초').sort(sort).map((s) => toSchoolItem(s, 'elementary'))
        );
        setMiddleSchools(
          schools.filter((s) => s.school_type === '중').sort(sort).map((s) => toSchoolItem(s, 'middle'))
        );
        setHighSchools(
          schools.filter((s) => s.school_type === '고').sort(sort).map((s) => toSchoolItem(s, 'high'))
        );
      })
      .catch((err) => {
        console.error('학교 목록 조회 실패:', err);
      });
  }, [targetYear]);

  // 학교 삭제 이벤트 수신 → 낙관적 제거
  useEffect(() => {
    const handleSchoolDeleted = (e: Event) => {
      const { schoolId } = (e as CustomEvent<{ schoolId: number }>).detail;
      const targetId = `school-${schoolId}`;
      setElementarySchools((prev) => prev.filter((s) => s.id !== targetId));
      setMiddleSchools((prev) => prev.filter((s) => s.id !== targetId));
      setHighSchools((prev) => prev.filter((s) => s.id !== targetId));
      setExpandedSchools((prev) => prev.filter((id) => id !== targetId));
    };
    window.addEventListener('school-deleted', handleSchoolDeleted);
    return () => window.removeEventListener('school-deleted', handleSchoolDeleted);
  }, []);

  const TEST_SCHOOL: SchoolItem = {
    id: 'school-test',
    name: 'TEST',
    basePath: '/admin/test/inventory',
    subPages: [
      { id: 'school-test-inventory', name: '재고 테스트', path: '/admin/test/inventory' },
    ],
  };

  const elementaryWithTest = [...elementarySchools, TEST_SCHOOL];

  const menuItems: MenuItem[] = [
    { id: 'elementary', label: `[${targetYear}]주관구매 -초`, path: '/admin/orders/elementary', schoolItems: elementaryWithTest },
    ...(middleSchools.length > 0 ? [{ id: 'middle', label: `[${targetYear}]주관구매 -중`, path: '/admin/orders/middle', schoolItems: middleSchools }] : []),
    ...(highSchools.length > 0 ? [{ id: 'high', label: `[${targetYear}]주관구매 -고`, path: '/admin/orders/high', schoolItems: highSchools }] : []),
    { id: 'product', label: '교복/용품', path: '/admin/products' },
    { id: 'school', label: '학교', path: '/admin/schools' },
    { id: 'student', label: '학생', path: '/admin/students' },
    { id: 'staff', label: '스태프', path: '/admin/staff', subMenus: staffSubMenus },
  ];

  const pathname = location.pathname;

  const isActive = (path: string) => pathname === path;

  const isSchoolActive = (school: SchoolItem) =>
    school.subPages.some((sp) => pathname === sp.path);

  const isMenuActive = (menu: MenuItem) => {
    if (menu.subMenus) return menu.subMenus.some((sub) => pathname === sub.path);
    if (menu.schoolItems) return menu.schoolItems.some((s) => isSchoolActive(s));
    return false;
  };

  // 수동 토글 + 현재 경로에 해당하는 메뉴를 합산하여 펼침 여부 결정
  const isMenuExpanded = (menuId: string) => {
    if (expandedMenus.includes(menuId)) return true;
    const menu = menuItems.find((m) => m.id === menuId);
    return menu ? isMenuActive(menu) : false;
  };

  const isSchoolExpanded = (schoolId: string) => {
    if (expandedSchools.includes(schoolId)) return true;
    for (const menu of menuItems) {
      const school = menu.schoolItems?.find((s) => s.id === schoolId);
      if (school) return isSchoolActive(school);
    }
    return false;
  };

  const toggleMenu = (menu: MenuItem) => {
    const isExpanded = expandedMenus.includes(menu.id);
    setExpandedMenus((prev) =>
      isExpanded ? prev.filter((id) => id !== menu.id) : [...prev, menu.id]
    );
    // subMenus가 있는 메뉴를 펼칠 때 기본 경로로 이동
    if (!isExpanded && menu.subMenus && menu.subMenus.length > 0) {
      navigate(menu.subMenus[0].path);
    }
  };

  const toggleSchool = (schoolId: string) => {
    setExpandedSchools((prev) =>
      prev.includes(schoolId) ? [] : [schoolId]
    );
  };

  const renderSchoolItems = (schoolItems: SchoolItem[]) => (
    <div className="flex flex-col">
      {schoolItems.map((school) => (
        <div key={school.id} className="flex flex-col">
          <button
            type="button"
            className={`flex items-center w-full h-7.5 px-5 font-medium no-underline leading-none transition-colors duration-200 bg-transparent border-none cursor-pointer text-left hover:text-bg-900 ${
              isSchoolActive(school) ? 'text-bg-900' : 'text-gray-300'
            }`}
            onClick={() => toggleSchool(school.id)}
          >
            {school.name}
          </button>
          {isSchoolExpanded(school.id) && (
            <div className="flex flex-col">
              {school.subPages.map((sp) => (
                <Link
                  key={sp.id}
                  to={sp.path}
                  className={`flex items-center w-full h-6.5 pl-10 pr-2 text-13 font-medium no-underline leading-none transition-colors duration-200 hover:text-bg-900 ${
                    isActive(sp.path) ? 'text-bg-900' : 'text-gray-300'
                  }`}
                >
                  {sp.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <aside className="w-50 min-h-[calc(100vh-16px)] my-2 ml-0 pl-5 pt-5 pb-5 bg-primary-050 border border-primary-100 rounded-r-lg shadow-sm flex flex-col gap-6">
      <div className="p-0">
        <Link to="/admin" className="text-17 font-medium text-bg-900 no-underline leading-none hover:text-bg-900">
          스마트학생복 청주점
        </Link>
      </div>
      <nav className="flex flex-col flex-1">
        {menuItems.map((menu) => (
          <div key={menu.id} className="flex flex-col">
            {menu.subMenus || menu.schoolItems ? (
              <>
                <button
                  type="button"
                  className={`flex items-center w-45 h-8.5 pt-3.5 pr-2.5 pb-1.5 pl-2.5 text-17 font-medium no-underline leading-none transition-colors duration-200 bg-none border-none cursor-pointer text-left hover:text-bg-900 ${
                    isMenuActive(menu) ? 'text-bg-900' : 'text-gray-300'
                  }`}
                  onClick={() => toggleMenu(menu)}
                >
                  {menu.label}
                </button>
                {isMenuExpanded(menu.id) && (
                  <>
                    {menu.subMenus && (
                      <div className="flex flex-col">
                        {menu.subMenus.map((sub) => (
                          <Link
                            key={sub.id}
                            to={sub.path}
                            className={`flex items-center w-full h-7.5 px-5 font-medium no-underline leading-none transition-colors duration-200 hover:text-bg-900 ${
                              isActive(sub.path) ? 'text-bg-900' : 'text-gray-300'
                            }`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    {menu.schoolItems && renderSchoolItems(menu.schoolItems)}
                  </>
                )}
              </>
            ) : (
              <Link
                to={menu.path}
                className={`flex items-center w-45 h-8.5 pt-3.5 pr-2.5 pb-1.5 pl-2.5 text-17 font-medium no-underline leading-none transition-colors duration-200 hover:text-bg-900 ${
                  isActive(menu.path) ? 'text-bg-900' : 'text-gray-300'
                }`}
              >
                {menu.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center w-45 h-8.5 pt-3.5 pr-2.5 pb-1.5 pl-2.5 text-14 font-medium bg-transparent border-none cursor-pointer text-left text-gray-300 hover:text-red-400 transition-colors duration-200"
      >
        로그아웃
      </button>
    </aside>
  );
};
