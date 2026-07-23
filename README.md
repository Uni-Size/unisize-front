# UniSize Front-End

> 교복 매장의 "측정 대기" 문제를 디지털화하는 웹 애플리케이션

## 이게 왜 필요한가

교복 매장은 매년 2~3월, 그리고 여름방학 직전에 신입생/전학생이 한꺼번에 몰립니다. 이 성수기에 매장에서 실제로 벌어지는 일은 대략 이렇습니다.

1. 학생/학부모가 매장에 와서 순서를 기다린다 (종이 번호표 또는 구두 확인)
2. 직원이 줄자로 신체 치수를 재고, 종이나 엑셀에 옮겨 적는다
3. 치수를 보고 감으로 사이즈를 정한다
4. 나중에 재고/주문 상태를 다시 엑셀에서 찾아본다

이 흐름에서 병목은 "대기"와 "기록"입니다. UniSize는 이 두 가지를 웹 앱으로 대체합니다. 학생은 태블릿/모바일로 셀프 등록하고 대기하고, 직원은 측정값을 바로 시스템에 입력하고, 관리자는 학교별 일정과 주문 현황을 대시보드에서 확인합니다.

## 세 가지 역할, 세 개의 화면

앱은 하나의 SPA지만 사실상 역할별로 완전히 분리된 세 개의 서브앱처럼 동작합니다. 라우트도 `/register`, `/staff`, `/admin`으로 갈라집니다.

### `/register` — 학생/학부모 (키오스크·셀프서비스)

매장에 놓인 태블릿에서 진행되는 단계형 마법사 플로우입니다.

```
온보딩 → 신입/재학 구분 → 학교 입력 → 학생 정보 → 측정 안내 → 측정값 입력 → 완료
```

재등록/기존 학생 조회는 별도 경로(`/register/existing`)로 빠집니다. 이 폼의 상태는 Zustand에 `persist`로 저장되므로, 태블릿이 잠깐 꺼지거나 새로고침돼도 입력하던 내용이 날아가지 않습니다 (`useStudentFormStore`).

### `/staff` — 매장 직원

로그인 후 대기 중인 학생 목록을 무한 스크롤로 보고, 학생을 선택해 측정값을 입력하는 화면이 메인입니다. 개인 페이지에서 본인 처리 건수 등 간단한 통계도 확인할 수 있습니다. 직원 가입은 신청제로, 관리자가 승인해야 활성화됩니다.

### `/admin` — 매장 관리자

학교별 측정/판매 일정, 주문·재고 현황, 학생 명단, 직원 승인까지 매장 운영 전반을 다루는 대시보드입니다. 학교급(초/중/고)별로 학교를 관리하고, 학교 단위로 학생·주문을 들여다볼 수 있습니다.

`admin` 롤은 `staff` 권한을 포함합니다 — 관리자는 직원 화면도 그대로 볼 수 있는 상하위 구조입니다. 라우트 가드는 [`src/components/ProtectedRoute.tsx`](src/components/ProtectedRoute.tsx)에서 처리합니다.

## 기술 스택

README의 배지가 아니라 `package.json` 기준 실제 스택입니다.

| 영역 | 선택 |
|---|---|
| 빌드 도구 | Vite 7 |
| 프레임워크 | React 19 |
| 라우팅 | react-router-dom v7 (`createBrowserRouter`) |
| 언어 | TypeScript 5.9 (strict) |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | Zustand (일부 스토어는 `persist`로 localStorage 영속화) |
| 테이블 | TanStack Table |
| 스타일 | Tailwind CSS 4 (`@tailwindcss/vite`, CSS-first 설정) |
| HTTP | Axios |
| 컴포넌트 문서화 | Storybook 10 |
| 테스트 도구 | Vitest 4 + `@vitest/browser-playwright` (devDependency로만 존재, 아래 "알려진 이슈" 참고) |
| 배포 | Docker (멀티스테이지 빌드) → nginx로 정적 서빙 |

> Next.js가 아닙니다. 이전 버전 README에는 Next.js App Router / Style Dictionary 디자인 토큰 파이프라인이 적혀 있었는데, 둘 다 이 저장소에는 존재하지 않는 내용이었습니다 (오래된 템플릿이 그대로 남아있던 것으로 보입니다). 이번에 실제 코드 기준으로 다시 작성했습니다.

## 디렉터리 구조

```
src/
├── api/            # 도메인별 API 함수 (auth, student, staff, school, product, order)
├── lib/
│   └── apiClient.ts  # axios 인스턴스 — baseURL, 인증 헤더 주입, 401 리다이렉트가 여기 있음
├── stores/         # Zustand 스토어 (아래 참고)
├── router/         # createBrowserRouter 라우트 트리
├── pages/
│   ├── register/   # 학생 셀프 등록 마법사
│   ├── staff/      # 직원 메인/마이페이지/가입신청
│   └── admin/      # 로그인/주문/상품/학교/학생/직원 관리
├── components/
│   ├── atoms/      # Button, Input, Modal, Table, Badge 등 — Storybook 스토리 보유
│   ├── molecules/
│   ├── organisms/  # AdminHeader, AdminSidebar, 각종 도메인 모달(SchoolAddModal 등)
│   ├── templates/  # AdminLayout
│   ├── staff/      # 직원 화면 전용 컴포넌트 (StudentTable 등)
│   ├── ui/         # Button, Toast — atoms와 일부 중복 (아래 참고)
│   └── ProtectedRoute.tsx
├── hooks/
├── utils/
└── styles/
```

Atomic Design(atoms/molecules/organisms/templates)을 기본 골격으로 쓰되, 실제로는 도메인 폴더(`staff/`, `admin` 관련 organisms)가 더 많은 일을 합니다. atoms 단위는 진짜 범용 프리미티브만 남아있는 편이라고 보면 됩니다.

## 인증 구조

- 로그인하면 accessToken/refreshToken을 받아 **Zustand `authStore`**에 저장합니다 (`persist` 미들웨어 → localStorage key `auth-storage`). 토큰의 단일 소스는 이 스토어입니다.
- axios 요청 인터셉터(`src/lib/apiClient.ts`)가 매 요청마다 `authStore`에서 토큰을 읽어 `Authorization: Bearer` 헤더를 붙입니다. JWT 형식이 아니면 즉시 인증을 초기화합니다.
- 역할(`role`)만 별도로 쿠키(`userRole`, 7일 만료)에 저장합니다. 이건 라우트 가드가 클라이언트에서 빠르게 판단할 값이 필요해서이고, 토큰 자체는 쿠키에 두지 않습니다.
- 401 응답을 받으면 인터셉터가 인증 상태를 지우고, 현재 경로가 `/admin` 쪽이면 `/admin/login`, 아니면 `/staff/login`으로 보냅니다.
- baseURL은 화이트리스트 검증(`isAllowedBaseURL`)을 거칩니다 — SSRF 방지용입니다.

## 시작하기

```bash
npm install
npm run dev          # http://localhost:3000
```

환경변수는 `.env.local` 하나면 됩니다 (gitignore 대상, 직접 만들어야 함):

```bash
VITE_API_BASE_URL=https://api.example.com   # 없으면 https://api.unisize.org로 폴백
```

```bash
npm run build         # tsc -b && vite build
npm run preview       # 빌드 결과 로컬 확인
npm run lint
npm run storybook      # 컴포넌트 카탈로그, :6006
```

Path alias는 `@`, `@components`, `@pages`, `@hooks`, `@utils`, `@styles`를 씁니다. `vite.config.ts`와 `tsconfig.app.json` 두 곳에 각각 정의돼 있으니, alias를 추가/변경할 땐 **양쪽 다** 고쳐야 합니다 (한쪽만 고치면 타입체크 또는 번들링 중 하나가 깨집니다).

## 배포

nginx 위에서 정적 파일로 서빙되는 Docker 컨테이너로, 자체 호스팅(홈서버) 환경에 배포됩니다.

```bash
docker compose -f docker-compose.yml up -d       # prod, 3000 포트
docker compose -f docker-compose.dev.yml up -d   # dev,  3001 포트
```

GitHub Actions가 브랜치별로 자동 배포합니다.

- `main` push → `ci-cd.yml`(lint) 성공 후 `deploy.yml`이 SSH + rsync로 홈서버에 반영, `docker-compose.yml`로 재기동
- `develop` push → `deploy-dev.yml`이 동일한 방식으로 dev 환경(`docker-compose.dev.yml`, 3001 포트, `/opt/unisize/frontend-dev`)에 반영

빌드 시점에 `VITE_API_BASE_URL`을 Docker build arg로 주입하는 구조라, API 서버 주소가 바뀌면 재빌드가 필요합니다 (런타임 환경변수가 아님 — Vite가 빌드 타임에 값을 정적으로 박아 넣습니다).

## 알려진 이슈 / 온보딩 시 주의할 점

정직하게 적어둡니다. 헷갈리기 쉬운 부분들입니다.

- **컴포넌트 중복**: `components/ui/Button`,`Toast`와 `components/atoms/Button`,`Toast`가 둘 다 존재하고 실제로 서로 다른 화면에서 각각 import됩니다. `StudentTable`도 `components/staff/`와 `pages/staff/MainPage/components/`에 두 벌이 있습니다. 새 코드를 어디에 둘지 헷갈리면 일단 기존 사용처를 grep해서 확인하는 게 안전합니다. 언젠가 정리가 필요한 부채입니다.

## 디자인 토큰 파이프라인

색상/폰트 값은 이제 `tokens/*.json`(`color.json`, `typography.json`)이 유일한 소스입니다. Style Dictionary(`style-dictionary.config.mjs`)가 이 JSON을 읽어 `src/styles/tokens.generated.css`를 생성하고, 여기에 Tailwind 4의 CSS-first `@theme { ... }` 블록이 들어갑니다. `src/styles/global.css`는 이 생성 파일을 `@import`만 할 뿐, 값을 직접 갖고 있지 않습니다.

```bash
npm run tokens:build   # tokens/*.json → src/styles/tokens.generated.css
```

`tokens.generated.css`는 빌드 산출물이라 커밋되지 않습니다(`.gitignore`). 대신 `dev`/`build`/`storybook`/`build-storybook` 스크립트 각각에 `pre*` 훅으로 `tokens:build`가 연결돼 있어서 따로 신경 쓰지 않아도 항상 최신 상태로 생성됩니다. 색상/폰트 값을 바꾸려면 `tokens/*.json`만 고치면 됩니다 — `global.css`를 함께 손대야 할 일은 없습니다.

## 개발 인원

1인 (Frontend) / 1인 (Backend, Infra) — 2025.09 ~

## 라이선스

Private - All rights reserved
