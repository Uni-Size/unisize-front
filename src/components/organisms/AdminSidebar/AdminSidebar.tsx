import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

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
    <aside className="admin-sidebar">
      <div className="admin-sidebar__header">
        <Link to="/admin" className="admin-sidebar__title">
          스마트학생복 청주점
        </Link>
      </div>
      <nav className="admin-sidebar__nav">
        {menuItems.map((menu) => (
          <div key={menu.id} className="admin-sidebar__menu-group">
            {menu.subMenus ? (
              <>
                <button
                  type="button"
                  className={`admin-sidebar__menu-item admin-sidebar__menu-item--expandable ${
                    isSubMenuActive(menu) ? 'admin-sidebar__menu-item--active' : ''
                  }`}
                  onClick={() => toggleMenu(menu.id)}
                >
                  {menu.label}
                </button>
                {isMenuExpanded(menu.id) && (
                  <div className="admin-sidebar__submenu">
                    {menu.subMenus.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        className={`admin-sidebar__submenu-item ${
                          isActive(sub.path) ? 'admin-sidebar__submenu-item--active' : ''
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
                className={`admin-sidebar__menu-item ${
                  isActive(menu.path) ? 'admin-sidebar__menu-item--active' : ''
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
