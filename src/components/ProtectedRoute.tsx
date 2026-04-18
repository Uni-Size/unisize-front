import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff';
  loginPath: string;
}

export default function ProtectedRoute({ children, requiredRole, loginPath }: ProtectedRouteProps) {
  const { isAuthenticated, staff } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredRole && staff?.role !== requiredRole) {
    const redirectPath = staff?.role === 'admin' ? '/admin' : '/staff';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
