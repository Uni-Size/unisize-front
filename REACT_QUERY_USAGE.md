# React Query 사용 가이드

이 프로젝트에서는 모든 API 요청을 React Query(TanStack Query)를 사용하여 관리합니다.

## 📦 설치

```bash
npm install @tanstack/react-query
```

## 🔧 설정

React Query는 이미 [src/app/layout.tsx](src/app/layout.tsx)에서 `QueryProvider`로 설정되어 있습니다.

## 📚 사용 가능한 Hooks

### 1. Health Check API (`useHealthApi.ts`)

서버 상태를 확인하는 Hook입니다.

```tsx
import { useHealthCheck } from "@/hooks/useHealthApi";

function HealthCheckComponent() {
  const { data, isLoading, error, refetch } = useHealthCheck();

  if (isLoading) return <div>서버 상태 확인 중...</div>;
  if (error) return <div>에러: {error.message}</div>;

  return (
    <div>
      <h2>서버 상태</h2>
      <p>서비스: {data?.service}</p>
      <p>상태: {data?.status}</p>
      <p>버전: {data?.version}</p>
      <button onClick={() => refetch()}>다시 확인</button>
    </div>
  );
}
```

**옵션 예시:**

```tsx
// 5초마다 자동으로 헬스 체크
const { data } = useHealthCheck({
  refetchInterval: 5000,
});

// 컴포넌트 마운트 시에만 체크 (기본값)
const { data } = useHealthCheck({
  staleTime: Infinity,
});
```

---

### 2. Signup API (`useSignupApi.ts`)

학생 등록과 관련된 Hooks입니다.

#### 2-1. 지원 학교 목록 조회

```tsx
import { useSupportedSchools } from "@/hooks/useSignupApi";

function SchoolListComponent() {
  const { data: schools, isLoading } = useSupportedSchools();

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <select>
      {schools?.map((school) => (
        <option key={school} value={school}>
          {school}
        </option>
      ))}
    </select>
  );
}
```

#### 2-2. 학교 지원 여부 확인

```tsx
import { useSchoolSupport } from "@/hooks/useSignupApi";
import { useState } from "react";

function SchoolSupportCheckComponent() {
  const [schoolName, setSchoolName] = useState("");
  const { data, isLoading } = useSchoolSupport(schoolName);

  return (
    <div>
      <input
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
        placeholder="학교 이름 입력"
      />
      {isLoading && <p>확인 중...</p>}
      {data && (
        <p style={{ color: data.supported ? "green" : "red" }}>
          {data.message}
        </p>
      )}
    </div>
  );
}
```

#### 2-3. 학생 정보 등록 (Mutation)

```tsx
import { useRegisterStudent } from "@/hooks/useSignupApi";

function StudentRegistrationForm() {
  const { mutate, isPending, isSuccess, error } = useRegisterStudent({
    onSuccess: (data) => {
      console.log("등록 성공:", data);
      alert(data.message);
    },
    onError: (error) => {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutate({
      previousSchool: "이전 학교",
      admissionYear: 2025,
      admissionGrade: 1,
      admissionSchool: "입학 학교",
      name: "홍길동",
      studentPhone: "010-1234-5678",
      guardianPhone: "010-9876-5432",
      birthDate: "2010-01-01",
      gender: "male",
      privacyConsent: true,
      body: {
        height: 170,
        weight: 60,
        shoulder: 40,
        waist: 70,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드들 */}
      <button type="submit" disabled={isPending}>
        {isPending ? "등록 중..." : "등록하기"}
      </button>
      {isSuccess && <p>등록이 완료되었습니다!</p>}
    </form>
  );
}
```

---

### 3. Measurement API (`useMeasurementApi.ts`)

측정 관련 Hooks입니다.

#### 3-1. 학생 정보 조회

```tsx
import { useStudentInfo } from "@/hooks/useMeasurementApi";

function StudentInfoComponent({ studentId }: { studentId: string }) {
  const { data, isLoading, error } = useStudentInfo(studentId);

  if (isLoading) return <div>학생 정보 로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>학년: {data?.grade}</p>
      <p>반: {data?.class}</p>
    </div>
  );
}
```

#### 3-2. 채촌 정보 조회

```tsx
import { useMeasurementInfo } from "@/hooks/useMeasurementApi";

function MeasurementInfoComponent({ studentId }: { studentId: string }) {
  const { data } = useMeasurementInfo(studentId);

  return (
    <div>
      <p>키: {data?.height || 0}cm</p>
      <p>몸무게: {data?.weight || 0}kg</p>
      <p>어깨: {data?.shoulder || 0}cm</p>
      <p>허리: {data?.waist || 0}cm</p>
    </div>
  );
}
```

#### 3-3. 교복 아이템 목록 조회

```tsx
import { useUniformItems } from "@/hooks/useMeasurementApi";

function UniformItemsComponent() {
  const { data: items } = useUniformItems();

  return (
    <ul>
      {items?.map((item) => (
        <li key={item.id}>
          {item.name} - {item.season}
        </li>
      ))}
    </ul>
  );
}
```

#### 3-4. 용품 아이템 설정 조회

```tsx
import { useSupplyItemsConfig } from "@/hooks/useMeasurementApi";

function SupplyItemsComponent() {
  const { data: config } = useSupplyItemsConfig();

  return (
    <div>
      {config?.categories.map((category) => (
        <div key={category.id}>
          <h3>{category.name}</h3>
          {/* 아이템 표시 */}
        </div>
      ))}
    </div>
  );
}
```

#### 3-5. 측정 완료 제출 (Mutation)

```tsx
import { useCompleteMeasurement } from "@/hooks/useMeasurementApi";

function CompleteMeasurementComponent() {
  const { mutate, isPending } = useCompleteMeasurement({
    onSuccess: () => {
      alert("측정이 완료되었습니다!");
    },
  });

  const handleComplete = () => {
    mutate({
      studentId: "student-123",
      uniformItems: [
        {
          id: "1",
          itemId: "uniform-1",
          name: "동복 상의",
          season: "동복",
          selectedSize: 95,
          customization: "없음",
          purchaseCount: 1,
        },
      ],
      supplyItems: [
        {
          id: "1",
          name: "체육복",
          category: "체육용품",
          size: "L",
          count: 1,
        },
      ],
      signature: "signature-data",
    });
  };

  return (
    <button onClick={handleComplete} disabled={isPending}>
      {isPending ? "제출 중..." : "측정 완료"}
    </button>
  );
}
```

---

## 🎯 고급 사용법

### 여러 쿼리를 동시에 사용하기

```tsx
function ComplexComponent({ studentId }: { studentId: string }) {
  const { data: studentInfo } = useStudentInfo(studentId);
  const { data: measurementInfo } = useMeasurementInfo(studentId);
  const { data: uniformItems } = useUniformItems();

  // 모든 데이터를 동시에 로드하고 사용
  return (
    <div>
      <h2>{studentInfo?.name}</h2>
      <p>키: {measurementInfo?.height}cm</p>
      <p>교복 종류: {uniformItems?.length}개</p>
    </div>
  );
}
```

### 조건부 쿼리 실행

```tsx
function ConditionalQueryComponent() {
  const [shouldFetch, setShouldFetch] = useState(false);

  // shouldFetch가 true일 때만 쿼리 실행
  const { data } = useHealthCheck({
    enabled: shouldFetch,
  });

  return (
    <div>
      <button onClick={() => setShouldFetch(true)}>헬스 체크 시작</button>
      {data && <p>서버 상태: {data.status}</p>}
    </div>
  );
}
```

### Mutation 후 쿼리 무효화 (캐시 갱신)

```tsx
import { useQueryClient } from "@tanstack/react-query";
import { useRegisterStudent, signupKeys } from "@/hooks/useSignupApi";

function RegistrationWithRefetch() {
  const queryClient = useQueryClient();

  const { mutate } = useRegisterStudent({
    onSuccess: () => {
      // 등록 성공 후 지원 학교 목록 다시 가져오기
      queryClient.invalidateQueries({
        queryKey: signupKeys.supportedSchools(),
      });
    },
  });

  // ... 나머지 코드
}
```

### 낙관적 업데이트 (Optimistic Update)

```tsx
import { useQueryClient } from "@tanstack/react-query";
import {
  useCompleteMeasurement,
  measurementKeys,
} from "@/hooks/useMeasurementApi";

function OptimisticUpdateExample({ studentId }: { studentId: string }) {
  const queryClient = useQueryClient();

  const { mutate } = useCompleteMeasurement({
    // 요청 전에 UI 미리 업데이트
    onMutate: async (newData) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({
        queryKey: measurementKeys.studentInfo(studentId),
      });

      // 이전 데이터 백업
      const previousData = queryClient.getQueryData(
        measurementKeys.studentInfo(studentId)
      );

      // 낙관적으로 UI 업데이트
      queryClient.setQueryData(
        measurementKeys.studentInfo(studentId),
        (old: any) => ({ ...old, completed: true })
      );

      return { previousData };
    },
    // 에러 발생 시 롤백
    onError: (err, newData, context) => {
      queryClient.setQueryData(
        measurementKeys.studentInfo(studentId),
        context?.previousData
      );
    },
  });

  // ... 나머지 코드
}
```

---

## 📋 Query Keys 구조

각 API hook은 일관된 Query Key 구조를 사용합니다:

```typescript
// Health API
healthKeys.all; // ["health"]
healthKeys.check(); // ["health", "check"]

// Signup API
signupKeys.all; // ["signup"]
signupKeys.supportedSchools(); // ["signup", "supportedSchools"]
signupKeys.schoolSupport(name); // ["signup", "schoolSupport", name]

// Measurement API
measurementKeys.all; // ["measurement"]
measurementKeys.studentInfo(id); // ["measurement", "studentInfo", id]
measurementKeys.measurementInfo(id); // ["measurement", "measurementInfo", id]
measurementKeys.uniformItems(); // ["measurement", "uniformItems"]
measurementKeys.supplyItemsConfig(); // ["measurement", "supplyItemsConfig"]
```

이러한 구조를 사용하면 캐시를 효율적으로 관리하고 무효화할 수 있습니다.

---

## ⚙️ QueryClient 설정

[src/providers/QueryProvider.tsx](src/providers/QueryProvider.tsx)에서 전역 설정이 되어 있습니다:

```typescript
{
  queries: {
    staleTime: 60 * 1000,           // 1분
    gcTime: 5 * 60 * 1000,          // 5분
    retry: 1,                        // 실패 시 1번 재시도
    refetchOnWindowFocus: false,     // 윈도우 포커스 시 자동 refetch 비활성화
  },
  mutations: {
    retry: 0,                        // mutation은 재시도 안 함
  },
}
```

---

## 🔍 디버깅

React Query는 자동으로 모든 API 호출을 콘솔에 로깅합니다. 개발 중에는 브라우저 콘솔을 확인하세요.

추가로 React Query DevTools를 설치하면 더 자세한 디버깅이 가능합니다:

```bash
npm install @tanstack/react-query-devtools
```

```tsx
// src/providers/QueryProvider.tsx에 추가
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 📚 더 알아보기

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [React Query 베스트 프랙티스](https://tkdodo.eu/blog/practical-react-query)
