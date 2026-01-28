# Next.js → React (Vite) 마이그레이션 계획

## 📋 프로젝트 개요

**소스**: iCloud Drive의 Next.js 15 App Router 프로젝트
**타겟**: 현재 폴더에 React + Vite 프로젝트

---

## 🔧 기술 스택

### 유지할 라이브러리
- React 19.1.0
- TypeScript 5
- Tailwind CSS v4
- Zustand 5.0.8 (상태 관리)
- TanStack Query 5.90.7 (서버 상태)
- TanStack React Table 8.21.3
- Axios 1.13.2
- GSAP 3.13.0 (애니메이션)
- html2canvas + jspdf (PDF 생성)

### 변경/추가할 라이브러리
| 기존 (Next.js) | 신규 (React) |
|---------------|-------------|
| Next.js App Router | **React Router v6** |
| next/navigation | react-router-dom |
| Next.js Middleware | Route Guards (ProtectedRoute 컴포넌트) |
| Next.js API Routes | **외부 백엔드 API만 사용** (api.unisize.org) |
| next/image | 일반 img 태그 |

### 결정 사항
- ✅ **라우터**: React Router v6 사용
- ✅ **API**: 외부 API(api.unisize.org)만 사용, Next.js API Routes 제거

---

## 📁 폴더 구조

```
src/
├── main.tsx                 # 앱 진입점
├── App.tsx                  # 라우터 설정
├── index.css                # 글로벌 스타일 (globals.css 대체)
│
├── routes/                  # 라우트 정의
│   └── index.tsx            # 모든 라우트 설정
│
├── pages/                   # 페이지 컴포넌트 (app/ 폴더 대체)
│   ├── Home.tsx
│   ├── add/
│   │   └── AddStudent.tsx
│   ├── waiting/
│   │   └── Waiting.tsx
│   ├── staff/
│   │   ├── Login.tsx
│   │   └── StaffDashboard.tsx
│   ├── admin/
│   │   ├── Dashboard.tsx
│   │   ├── InventoryManagement.tsx
│   │   ├── ProductManagement.tsx
│   │   ├── SchoolManagement.tsx
│   │   ├── StaffManagement.tsx
│   │   ├── Order.tsx
│   │   └── Reservation.tsx
│   └── staff-sign-up/
│       └── StaffSignUp.tsx
│
├── components/              # 재사용 컴포넌트 (그대로 유지)
│   ├── ui/
│   ├── pdf/
│   ├── admin/               # app/admin/components → 이동
│   ├── layouts/             # 레이아웃 컴포넌트
│   │   ├── RootLayout.tsx
│   │   ├── AdminLayout.tsx
│   │   └── StaffLayout.tsx
│   └── guards/              # 라우트 가드
│       └── ProtectedRoute.tsx
│
├── hooks/                   # 커스텀 훅 (그대로 유지)
├── stores/                  # Zustand 스토어 (그대로 유지)
├── api/                     # API 클라이언트 (그대로 유지)
├── services/                # 비즈니스 로직 (그대로 유지)
├── lib/                     # 유틸리티 (apiClient.ts 유지, db.ts 제거)
├── providers/               # Context Providers (그대로 유지)
├── styles/                  # 스타일 (그대로 유지)
├── utils/                   # 헬퍼 함수 (그대로 유지)
└── types/                   # 타입 정의
```

---

## 🔐 인증 및 라우트 보호

### ProtectedRoute 컴포넌트
```tsx
// src/components/guards/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
  allowedRoles?: ('admin' | 'staff')[];
  redirectTo?: string;
}

export function ProtectedRoute({
  allowedRoles,
  redirectTo = '/staff/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, staff } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && staff && !allowedRoles.includes(staff.role)) {
    return <Navigate to="/staff/login" replace />;
  }

  return <Outlet />;
}
```

### 라우트 설정
```tsx
// src/routes/index.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'add', element: <AddStudent /> },
      { path: 'waiting/:id', element: <Waiting /> },
      { path: 'staff/login', element: <Login /> },
      { path: 'staff-sign-up', element: <StaffSignUp /> },

      // Protected Staff Routes
      {
        element: <ProtectedRoute allowedRoles={['staff', 'admin']} />,
        children: [
          {
            path: 'staff/:userName',
            element: <StaffLayout />,
            children: [
              { index: true, element: <StaffDashboard /> },
            ]
          }
        ]
      },

      // Protected Admin Routes
      {
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'inventory-management', element: <InventoryManagement /> },
              { path: 'product-management', element: <ProductManagement /> },
              { path: 'school-management', element: <SchoolManagement /> },
              { path: 'staff-management', element: <StaffManagement /> },
              { path: 'order', element: <Order /> },
              { path: 'reservation', element: <Reservation /> },
            ]
          }
        ]
      }
    ]
  }
]);
```

---

## 🔄 마이그레이션 단계

### Phase 1: 프로젝트 초기화
1. Vite + React + TypeScript 프로젝트 생성
2. 필요한 의존성 설치
3. Tailwind CSS v4 설정
4. 경로 별칭 (@/) 설정

### Phase 2: 핵심 인프라 이전
1. `lib/apiClient.ts` 복사 (수정 없음)
2. `stores/` 폴더 전체 복사
3. `hooks/` 폴더 복사 (next/navigation 임포트 수정)
4. `providers/QueryProvider.tsx` 복사
5. `api/` 폴더 복사
6. `services/` 폴더 복사 (Prisma 관련 제거)
7. `styles/` 폴더 복사
8. `utils/` 폴더 복사

### Phase 3: 컴포넌트 이전
1. `components/` 폴더 복사
2. `app/admin/components/` → `components/admin/` 이동
3. `app/add/components/` → `components/add/` 이동
4. 레이아웃 컴포넌트 생성

### Phase 4: 페이지 이전
각 페이지별 변환 작업:
1. `"use client"` 지시문 제거
2. `next/navigation` → `react-router-dom` 변경
3. `useRouter()` → `useNavigate()` 변경
4. `useParams()` 임포트 경로 변경
5. `next/image` → 일반 `<img>` 변경

### Phase 5: 라우팅 설정
1. React Router 설정
2. ProtectedRoute 컴포넌트 구현
3. 레이아웃 연결

### Phase 6: 환경 변수 및 설정
1. `.env` 파일 생성 (`VITE_` 접두사 사용)
2. `vite.config.ts` 최적화

### Phase 7: 테스트 및 정리
1. 모든 라우트 동작 확인
2. 인증 플로우 테스트
3. API 연동 테스트
4. 불필요한 파일 정리

---

## ⚠️ 주의사항

### 제거할 항목
- `middleware.ts` (ProtectedRoute로 대체)
- `app/api/` 폴더 전체 (백엔드 API 사용)
- `lib/db.ts` (Prisma 클라이언트)
- `prisma/` 폴더
- `generated/prisma/` 폴더

### 수정이 필요한 파일들
| 파일 | 변경 내용 |
|-----|---------|
| 모든 페이지 | `"use client"` 제거 |
| `useAuth.ts` | `next/navigation` → `react-router-dom` |
| 페이지 컴포넌트 | `useRouter` → `useNavigate` |
| 페이지 컴포넌트 | `router.push()` → `navigate()` |
| API 호출 | `NEXT_PUBLIC_*` → `import.meta.env.VITE_*` |

### 환경 변수 변환
```
# Next.js
NEXT_PUBLIC_API_BASE_URL=https://api.unisize.org/

# Vite
VITE_API_BASE_URL=https://api.unisize.org/
```

---

## 📦 설치할 의존성

```bash
# 핵심
npm install react react-dom react-router-dom

# 상태 관리 & 데이터 페칭
npm install zustand @tanstack/react-query @tanstack/react-table axios

# UI & 스타일
npm install tailwindcss @tailwindcss/vite gsap

# PDF 생성
npm install html2canvas jspdf

# 개발 도구
npm install -D typescript @types/react @types/react-dom vite @vitejs/plugin-react eslint
```

---

## ✅ 예상 결과

마이그레이션 완료 후:
- ✅ 동일한 UI/UX 유지
- ✅ 동일한 기능 동작
- ✅ 더 빠른 개발 서버 (Vite HMR)
- ✅ 더 간단한 빌드 설정
- ✅ Next.js 의존성 제거
- ❌ SSR/SSG 기능 (필요 없음 - 이미 CSR 위주)
- ❌ Next.js API Routes (외부 백엔드 사용)
