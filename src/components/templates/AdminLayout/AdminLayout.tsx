import type { ReactNode } from 'react';
import { AdminSidebar } from '@components/organisms/AdminSidebar';
import './AdminLayout.css';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-layout__main">
        {children}
      </main>
    </div>
  );
};
