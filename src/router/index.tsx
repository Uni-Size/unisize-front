import { createBrowserRouter } from 'react-router-dom';
import {
  LoginPage,
  MainPage,
  OrderListPage,
  StudentOrderPage,
  ProductListPage,
  SchoolListPage,
  StudentListPage,
  StaffListPage,
  StaffApprovalPage,
} from '@pages/admin';

// Staff pages (매장 직원용)
import StaffLayout from '@/pages/staff/StaffLayout';
import StaffLoginPage from '@/pages/staff/login/LoginPage';
import StaffMainPage from '@/pages/staff/StaffMainPage';

// User pages (학생/보호자용)
import AddStudentPage from '@/pages/user/add/AddStudentPage';
import WaitingPage from '@/pages/user/waiting/WaitingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'orders',
        element: <MainPage />,
      },
      {
        path: 'orders/middle/:schoolId',
        element: <OrderListPage schoolType="middle" />,
      },
      {
        path: 'orders/high/:schoolId',
        element: <OrderListPage schoolType="high" />,
      },
      {
        path: 'orders/students',
        element: <StudentOrderPage />,
      },
      {
        path: 'products',
        element: <ProductListPage />,
      },
      {
        path: 'schools',
        element: <SchoolListPage />,
      },
      {
        path: 'students',
        element: <StudentListPage />,
      },
      {
        path: 'staff',
        element: <StaffListPage />,
      },
      {
        path: 'staff/approval',
        element: <StaffApprovalPage />,
      },
    ],
  },
  // Staff routes (매장 직원용)
  {
    path: '/staff',
    children: [
      {
        path: 'login',
        element: <StaffLoginPage />,
      },
      {
        element: <StaffLayout />,
        children: [
          {
            index: true,
            element: <StaffMainPage />,
          },
          {
            path: ':userName',
            element: <StaffMainPage />,
          },
        ],
      },
    ],
  },
  // User routes (학생/보호자용)
  {
    path: '/add',
    element: <AddStudentPage />,
  },
  {
    path: '/waiting',
    element: <WaitingPage />,
  },
]);
