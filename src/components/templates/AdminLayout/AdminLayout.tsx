import type { ReactNode } from 'react';
import { AdminSidebar } from '@components/organisms/AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  return (
    <div className="flex h-[99vh]">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
