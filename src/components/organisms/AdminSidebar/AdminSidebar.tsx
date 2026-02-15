import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

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
}

// 중학교 목록 (가나다순)
const middleSchools: SubMenuItem[] = [
  { id: 'gakyung', name: '가경중학교', path: '/admin/orders/middle/gakyung' },
  { id: 'kyungduk', name: '경덕중학교', path: '/admin/orders/middle/kyungduk' },
  { id: 'bokdae', name: '복대중학교', path: '/admin/orders/middle/bokdae' },
  { id: 'sannam', name: '산남중학교', path: '/admin/orders/middle/sannam' },
  { id: 'saengmyung', name: '생명중학교', path: '/admin/orders/middle/saengmyung' },
  { id: 'sekwang', name: '세광중학교', path: '/admin/orders/middle/sekwang' },
  { id: 'yongsung', name: '용성중학교', path: '/admin/orders/middle/yongsung' },
  { id: 'yullyang', name: '율량중학교', path: '/admin/orders/middle/yullyang' },
  { id: 'jungang', name: '중앙여자중학교', path: '/admin/orders/middle/jungang' },
];

// 고등학교 목록 (가나다순)
const highSchools: SubMenuItem[] = [
  { id: 'sekwang-high', name: '세광고등학교', path: '/admin/orders/high/sekwang' },
  { id: 'ochang', name: '오창고등학교', path: '/admin/orders/high/ochang' },
  { id: 'cheongju', name: '청주고등학교', path: '/admin/orders/high/cheongju' },
];

// 스태프 서브메뉴
const staffSubMenus: SubMenuItem[] = [
  { id: 'staff-manage', name: '관리', path: '/admin/staff' },
  { id: 'staff-approval', name: '승인', path: '/admin/staff/approval' },
];

const menuItems: MenuItem[] = [
  { id: 'middle-2026', label: '[2026]주관구매 -중', path: '/admin/orders/middle', subMenus: middleSchools },
  { id: 'high-2026', label: '[2026]주관구매 -고', path: '/admin/orders/high', subMenus: highSchools },
  { id: 'product', label: '교복/용품', path: '/admin/products' },
  { id: 'school', label: '학교', path: '/admin/schools' },
  { id: 'student', label: '학생', path: '/admin/students' },
  { id: 'staff', label: '스태프', path: '/admin/staff', subMenus: staffSubMenus },
];

export const AdminSidebar = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const isActive = (path: string) => location.pathname === path;
  const isMenuExpanded = (menuId: string) => expandedMenus.includes(menuId);
  const isSubMenuActive = (menu: MenuItem) => {
    if (!menu.subMenus) return false;
    return menu.subMenus.some((sub) => location.pathname === sub.path);
  };

  // 현재 경로에 해당하는 메뉴를 자동으로 펼침
  useEffect(() => {
    menuItems.forEach((menu) => {
      if (menu.subMenus && isSubMenuActive(menu) && !expandedMenus.includes(menu.id)) {
        setExpandedMenus((prev) => [...prev, menu.id]);
      }
    });
  }, [location.pathname]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

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
            {menu.subMenus ? (
              <>
                <button
                  type="button"
                  className={`flex items-center w-[180px] h-[34px] pt-3.5 pr-2.5 pb-1.5 pl-2.5 text-[17px] font-medium no-underline leading-none transition-colors duration-200 bg-none border-none cursor-pointer text-left hover:text-[#111827] ${
                    isSubMenuActive(menu) ? 'text-[#111827]' : 'text-gray-300'
                  }`}
                  onClick={() => toggleMenu(menu.id)}
                >
                  {menu.label}
                </button>
                {isMenuExpanded(menu.id) && (
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
