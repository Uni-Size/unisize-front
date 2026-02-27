import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getSupportedSchoolsByYear } from '@/api/school';
import type { School } from '@/api/school';
import { getTargetYear } from '@/utils/schoolUtils';

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

const toSchoolItem = (school: School, type: 'middle' | 'high'): SchoolItem => {
  const basePath = `/admin/orders/${type}/${school.id}`;
  return {
    id: `school-${school.id}`,
    name: school.name,
    basePath,
    subPages: [
      { id: `school-${school.id}-students`, name: '학생', path: `${basePath}/students` },
      { id: `school-${school.id}-orders`, name: '주문/예약', path: `${basePath}/orders` },
    ],
  };
};

// ============================================================================
// AdminSidebar
// ============================================================================

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [expandedSchools, setExpandedSchools] = useState<string[]>([]);
  const [middleSchools, setMiddleSchools] = useState<SchoolItem[]>([]);
  const [highSchools, setHighSchools] = useState<SchoolItem[]>([]);
  const targetYear = getTargetYear();

  // API에서 학교 목록 조회
  useEffect(() => {
    getSupportedSchoolsByYear(targetYear)
      .then((schools) => {
        const middle = schools
          .filter((s) => s.name.includes('중학교'))
          .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
          .map((s) => toSchoolItem(s, 'middle'));
        const high = schools
          .filter((s) => !s.name.includes('중학교'))
          .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
          .map((s) => toSchoolItem(s, 'high'));
        setMiddleSchools(middle);
        setHighSchools(high);
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
      setMiddleSchools((prev) => prev.filter((s) => s.id !== targetId));
      setHighSchools((prev) => prev.filter((s) => s.id !== targetId));
      setExpandedSchools((prev) => prev.filter((id) => id !== targetId));
    };
    window.addEventListener('school-deleted', handleSchoolDeleted);
    return () => window.removeEventListener('school-deleted', handleSchoolDeleted);
  }, []);

  const menuItems: MenuItem[] = [
    { id: 'middle', label: `[${targetYear}]주관구매 -중`, path: '/admin/orders/middle', schoolItems: middleSchools },
    { id: 'high', label: `[${targetYear}]주관구매 -고`, path: '/admin/orders/high', schoolItems: highSchools },
    { id: 'product', label: '교복/용품', path: '/admin/products' },
    { id: 'school', label: '학교', path: '/admin/schools' },
    { id: 'student', label: '학생', path: '/admin/students' },
    { id: 'staff', label: '스태프', path: '/admin/staff', subMenus: staffSubMenus },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId);
  const isSchoolExpanded = (schoolId: string) => expandedSchools.includes(schoolId);

  const isSchoolActive = (school: SchoolItem) =>
    school.subPages.some((sp) => location.pathname === sp.path);

  const isMenuActive = (menu: MenuItem) => {
    if (menu.subMenus) return menu.subMenus.some((sub) => location.pathname === sub.path);
    if (menu.schoolItems) return menu.schoolItems.some((s) => isSchoolActive(s));
    return false;
  };

  // 현재 경로에 해당하는 메뉴 & 학교를 자동으로 펼침
  useEffect(() => {
    menuItems.forEach((menu) => {
      if ((menu.subMenus || menu.schoolItems) && isMenuActive(menu) && !expandedMenus.includes(menu.id)) {
        setExpandedMenus((prev) => [...prev, menu.id]);
      }
      if (menu.schoolItems) {
        menu.schoolItems.forEach((school) => {
          if (isSchoolActive(school) && !expandedSchools.includes(school.id)) {
            setExpandedSchools((prev) => [...prev, school.id]);
          }
        });
      }
    });
  }, [location.pathname, middleSchools, highSchools]);

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
            className={`flex items-center w-full h-[30px] px-5 font-medium no-underline leading-none transition-colors duration-200 bg-transparent border-none cursor-pointer text-left hover:text-[#111827] ${
              isSchoolActive(school) ? 'text-[#111827]' : 'text-gray-300'
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
                  className={`flex items-center w-full h-[26px] pl-10 pr-2 text-[13px] font-medium no-underline leading-none transition-colors duration-200 hover:text-[#111827] ${
                    isActive(sp.path) ? 'text-[#111827]' : 'text-gray-300'
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
    <aside className="w-[200px] min-h-[calc(100vh-16px)] my-2 ml-0 pl-5 pt-5 pb-5 bg-primary-050 border border-primary-100 rounded-r-lg shadow-[4px_0px_7px_0px_rgba(0,0,0,0.06)] flex flex-col gap-6">
      <div className="p-0">
        <Link to="/admin" className="text-[17px] font-medium text-[#111827] no-underline leading-none hover:text-[#111827]">
          스마트학생복 청주점
        </Link>
      </div>
      <nav className="flex flex-col">
        {menuItems.map((menu) => (
          <div key={menu.id} className="flex flex-col">
            {menu.subMenus || menu.schoolItems ? (
              <>
                <button
                  type="button"
                  className={`flex items-center w-[180px] h-[34px] pt-3.5 pr-2.5 pb-1.5 pl-2.5 text-[17px] font-medium no-underline leading-none transition-colors duration-200 bg-none border-none cursor-pointer text-left hover:text-[#111827] ${
                    isMenuActive(menu) ? 'text-[#111827]' : 'text-gray-300'
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
                            className={`flex items-center w-full h-[30px] px-5 font-medium no-underline leading-none transition-colors duration-200 hover:text-[#111827] ${
                              isActive(sub.path) ? 'text-[#111827]' : 'text-gray-300'
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
                className={`flex items-center w-[180px] h-[34px] pt-3.5 pr-2.5 pb-1.5 pl-2.5 text-[17px] font-medium no-underline leading-none transition-colors duration-200 hover:text-[#111827] ${
                  isActive(menu.path) ? 'text-[#111827]' : 'text-gray-300'
                }`}
              >
                {menu.label}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
