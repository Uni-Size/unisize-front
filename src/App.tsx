import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';

// 모듈 스코프에서 한 번만 생성한다 (렌더마다 새 인스턴스가 만들어지면 캐시가 통째로 날아간다).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본 retry(3회 + 지수 백오프)는 에러 화면이 뜨기까지 수 초가 걸린다.
      // 기존 화면들은 실패 즉시 에러를 보여줬으므로 동작을 맞춘다.
      retry: false,
      // 관리자 화면은 로딩 중 테이블을 비우는 관례라, 포커스 복귀마다 재조회하면
      // 화면이 깜빡인다. 재조회는 페이지 이동/변경 작업 후 invalidate로만 일으킨다.
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
