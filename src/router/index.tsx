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
  RegisterPage as StaffRegisterPage,
} from '@pages/staff';

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
  {
    path: '/staff',
    children: [
      {
        index: true,
        element: <StaffMainPage />,
      },
      {
        path: 'login',
        element: <StaffLoginPage />,
      },
      {
        path: 'register',
        element: <StaffRegisterPage />,
      },
    ],
  },
]);
