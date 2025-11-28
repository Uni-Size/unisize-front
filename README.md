# UniSize Front-End

> 교복 매장을 위한 스마트 측정 대기 및 관리 시스템

[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)

## 📌 프로젝트 소개

UniSize는 교복 매장의 측정 대기 프로세스를 디지털화하여 고객 경험을 개선하고 매장 운영을 효율화하는 웹 애플리케이션입니다.

### 주요 기능

#### 🎯 학생/학부모용
- **Self Check-in**: 태블릿을 통한 무인 대기 등록
- **다단계 폼**: 학교 검색, 개인정보 입력, 확인 단계로 구성된 직관적인 UX
- **실시간 대기 현황**: 현재 대기번호 및 예상 대기시간 확인

#### 💼 관리자용
- **통합 대시보드**: 측정 중/완료 건수, 당일 예약 현황 한눈에 파악
- **학교별 일정 관리**: 캘린더 기반 측정 기간 및 판매 일정 시각화
- **학생 상세 관리**: 신체 치수, 교복 사이즈, 구매 이력 통합 관리
- **실시간 테이블**: 측정 대기 목록 실시간 업데이트

#### 👥 직원용
- **측정 기록**: 학생별 신체 치수 입력 및 관리
- **교복 사이즈 추천**: 측정 데이터 기반 최적 사이즈 제안

## 🛠 기술 스택

### Core
- **Next.js 15** - App Router, Server Components
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안정성 확보

### State Management & Data Fetching
- **Zustand** - 경량 상태 관리
- **TanStack Query (React Query)** - 서버 상태 관리 및 캐싱

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Design Tokens** - Style Dictionary 기반 디자인 시스템
- **GSAP** - 고품질 애니메이션

### Development Tools
- **ESLint** - 코드 품질 관리
- **Axios** - HTTP 클라이언트
- **Docker** - 컨테이너화 배포

## 🎨 주요 기술적 특징

### 1. Design Token 시스템
```bash
npm run tokens:build  # TypeScript 타입 & Tailwind 설정 자동 생성
```
- Style Dictionary를 활용한 디자인 토큰 관리
- 디자인 시스템의 일관성 확보
- 빌드 시 자동으로 TypeScript 타입과 Tailwind 설정 생성

### 2. 최적화된 상태 관리
- **Zustand**: 폼 데이터 등 클라이언트 상태
- **TanStack Query**: 서버 데이터 캐싱 및 동기화
- 역할 분리를 통한 명확한 데이터 흐름

### 3. 모듈화된 컴포넌트 구조
```
src/
├── app/              # Next.js App Router 페이지
│   ├── admin/        # 관리자 페이지
│   ├── staff/        # 직원 페이지
│   ├── signup/       # 학생 등록
│   └── waiting/      # 대기 화면
├── components/       # 공용 컴포넌트
├── api/             # API 클라이언트
├── stores/          # Zustand 스토어
└── hooks/           # 커스텀 훅
```

## 🚀 시작하기

### 환경 설정

```bash
# .env.local 파일 생성
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_BASE_URL=http://your-api-server:8080
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (디자인 토큰 자동 빌드 포함)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### Docker로 실행

```bash
# 이미지 빌드
docker build -t unisize-front .

# 컨테이너 실행
docker-compose up -d
```

## 📱 주요 화면

### 학생 등록 플로우
1. **메인 화면**: Self Check-in 시작
2. **학교 검색**: 소속 학교 선택
3. **정보 입력**: 학생 정보 및 연락처
4. **대기 화면**: 대기번호 안내 및 실시간 현황

### 관리자 대시보드
- 실시간 통계 카드
- 학교별 측정 일정 캘린더
- 측정 완료 학생 목록
- 학생 상세 정보 모달

## 🔧 개발 워크플로우

### Design Token 수정 시
```bash
npm run tokens:build    # 토큰 변경사항 반영
```

### 빌드 파이프라인
```bash
predev → tokens:build → dev
prebuild → tokens:build → build
```

## 📝 주요 구현 내용

### 성능 최적화
- Next.js App Router의 Server Components 활용
- 이미지 최적화 (Next.js Image)
- 코드 스플리팅 및 동적 임포트

### UX 개선
- GSAP을 활용한 부드러운 페이지 전환
- 로딩 상태 및 에러 핸들링
- 반응형 디자인 (모바일/태블릿/데스크톱)

### 개발 경험
- TypeScript 엄격 모드
- ESLint를 통한 코드 품질 관리
- 컴포넌트 기반 모듈화

## 🔗 관련 프로젝트

- Backend API: [unisize-back](https://github.com/yourusername/unisize-back)

## 📄 라이선스

Private - All rights reserved

---

**개발 기간**: 2024.09 - 2024.11
**개발 인원**: 1인 (Frontend)
