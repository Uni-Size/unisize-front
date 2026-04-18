import { createBrowserRouter } from 'react-router-dom';
import {
  LoginPage,
  MainPage,
  StudentOrderPage,
  ProductListPage,
  SchoolListPage,
  StudentListPage,
  StaffListPage,
  StaffApprovalPage,
  SchoolDetailPage,
} from '@pages/admin';
import {
  OnboardingPage,
  SchoolInputPage,
  StudentInfoPage,
  MeasurementGuidePage,
  MeasurementInputPage,
  CompletePage,
  ExistingStudentPage,
} from '@pages/register';
import {
  LoginPage as StaffLoginPage,
  MainPage as StaffMainPage,
  MyPage as StaffMyPage,
  RegisterPage as StaffRegisterPage,
} from '@pages/staff';
import ProtectedRoute from '@/components/ProtectedRoute';

const adminGuard = (element: React.ReactNode) => (
  <ProtectedRoute requiredRole="admin" loginPath="/admin/login">
    {element}
  </ProtectedRoute>
);

const staffGuard = (element: React.ReactNode) => (
  <ProtectedRoute requiredRole="staff" loginPath="/staff/login">
    {element}
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <OnboardingPage />,
  },
  {
    path: '/register',
    children: [
      {
        index: true,
        element: <OnboardingPage />,
      },
      {
        path: 'school',
        element: <SchoolInputPage />,
      },
      {
        path: 'student-info',
        element: <StudentInfoPage />,
      },
      {
        path: 'measurement-guide',
        element: <MeasurementGuidePage />,
      },
      {
        path: 'measurement',
        element: <MeasurementInputPage />,
      },
      {
        path: 'complete',
        element: <CompletePage />,
      },
      {
        path: 'existing',
        element: <ExistingStudentPage />,
      },
    ],
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: adminGuard(<MainPage />),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'orders',
        element: adminGuard(<MainPage />),
      },
      {
        path: 'orders/middle/:schoolId/students',
        element: adminGuard(<SchoolDetailPage />),
      },
      {
        path: 'orders/middle/:schoolId/orders',
        element: adminGuard(<SchoolDetailPage />),
      },
      {
        path: 'orders/high/:schoolId/students',
        element: adminGuard(<SchoolDetailPage />),
      },
      {
        path: 'orders/high/:schoolId/orders',
        element: adminGuard(<SchoolDetailPage />),
      },
      {
        path: 'orders/students',
        element: adminGuard(<StudentOrderPage />),
      },
      {
        path: 'products',
        element: adminGuard(<ProductListPage />),
      },
      {
        path: 'schools',
        element: adminGuard(<SchoolListPage />),
      },
      {
        path: 'students',
        element: adminGuard(<StudentListPage />),
      },
      {
        path: 'staff',
        element: adminGuard(<StaffListPage />),
      },
      {
        path: 'staff/approval',
        element: adminGuard(<StaffApprovalPage />),
      },
    ],
  },
  {
    path: '/staff',
    children: [
      {
        index: true,
        element: staffGuard(<StaffMainPage />),
      },
      {
        path: 'login',
        element: <StaffLoginPage />,
      },
      {
        path: 'register',
        element: <StaffRegisterPage />,
      },
      {
        path: 'my',
        element: staffGuard(<StaffMyPage />),
      },
    ],
  },
]);
