import { describe, expect, it } from 'vitest';
import { matchRoutes, createMemoryRouter } from 'react-router';
import { routes } from './routes';

/**
 * 라우팅 회귀 테스트.
 *
 * vitest의 `unit` 프로젝트는 environment: "node" 라서 DOM이 없다.
 * 따라서 컴포넌트를 렌더링하지 않고, 라우트 설정 배열만으로 동작을 검증한다:
 *  - matchRoutes(routes, pathname) : 순수 매칭 결과
 *  - createMemoryRouter(routes) + router.navigate() : 실제 네비게이션 동작 (DOM 불필요)
 */

/** 매칭된 라우트 체인을 문자열 배열로. index 라우트는 path가 없으므로 '(index)'로 표기. */
function matchChain(pathname: string): string[] | null {
  const matches = matchRoutes(routes, pathname);
  return matches?.map((m) => m.route.path ?? '(index)') ?? null;
}

describe('라우트 테이블 회귀', () => {
  it.each([
    ['/', ['/']],
    ['/register', ['/register', '(index)']],
    ['/register/school', ['/register', 'school']],
    ['/register/school-info', ['/register', 'school-info']],
    ['/register/student-info', ['/register', 'student-info']],
    ['/register/measurement-guide', ['/register', 'measurement-guide']],
    ['/register/measurement', ['/register', 'measurement']],
    ['/register/complete', ['/register', 'complete']],
    ['/register/existing', ['/register', 'existing']],
    ['/register/existing-lookup', ['/register', 'existing-lookup']],
    ['/admin', ['/admin', '(index)']],
    ['/admin/login', ['/admin', 'login']],
    ['/admin/orders', ['/admin', 'orders']],
    ['/admin/orders/students', ['/admin', 'orders/students']],
    ['/admin/products', ['/admin', 'products']],
    ['/admin/schools', ['/admin', 'schools']],
    ['/admin/students', ['/admin', 'students']],
    ['/admin/staff', ['/admin', 'staff']],
    ['/admin/staff/approval', ['/admin', 'staff/approval']],
    ['/staff', ['/staff', '(index)']],
    ['/staff/login', ['/staff', 'login']],
    ['/staff/register', ['/staff', 'register']],
    ['/staff/my', ['/staff', 'my']],
  ])('%s 는 의도한 라우트에 매칭된다', (pathname, expected) => {
    expect(matchChain(pathname)).toEqual(expected);
  });

  it.each([
    ['/admin/orders/elementary/42/students', 'orders/elementary/:schoolId/students'],
    ['/admin/orders/elementary/42/orders', 'orders/elementary/:schoolId/orders'],
    ['/admin/orders/middle/7/students', 'orders/middle/:schoolId/students'],
    ['/admin/orders/middle/7/orders', 'orders/middle/:schoolId/orders'],
    ['/admin/orders/high/3/students', 'orders/high/:schoolId/students'],
    ['/admin/orders/high/3/orders', 'orders/high/:schoolId/orders'],
  ])('%s 는 %s 에 매칭되고 schoolId를 뽑아낸다', (pathname, expectedLeaf) => {
    const matches = matchRoutes(routes, pathname);
    expect(matches).not.toBeNull();
    const leaf = matches![matches!.length - 1];
    expect(leaf.route.path).toBe(expectedLeaf);
    expect(leaf.params.schoolId).toBe(pathname.split('/')[4]);
  });
});

describe('존재하지 않는 경로', () => {
  // 이 앱에는 splat('*') 라우트가 없으므로 매칭 실패가 정상 동작이다.
  it.each([
    '/nope',
    '/admin/nope',
    '/staff/nope',
    '/register/nope',
    '/admin/orders/university/1/students',
  ])('%s 는 매칭되지 않는다', (pathname) => {
    expect(matchRoutes(routes, pathname)).toBeNull();
  });

  it('매칭 실패 시 라우터는 404 에러 상태가 된다 (앱 밖으로 나가지 않는다)', async () => {
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });
    await router.navigate('/nope');

    expect(router.state.location.pathname).toBe('/nope');
    expect(router.state.errors?.[0]).toMatchObject({ status: 404 });
  });
});

describe('오픈 리다이렉트 방어 (react-router 7.18.0 보안 수정)', () => {
  /**
   * 아래 입력들은 7.18.0 이전(>=6.0.0 <7.18.0)에서 <Link>/useNavigate를 통해
   * 외부 호스트로 빠져나갈 수 있었던 형태들이다.
   * 7.18.3에서 확인한 실제 동작: router.navigate()가
   * "External navigation is not allowed" 로 reject 한다.
   */
  const externalAttempts = [
    '//evil.com', // 프로토콜 상대 URL
    '//evil.com/admin',
    '/\\evil.com', // 백슬래시
    '\\\\evil.com',
    '\\/evil.com',
    'https://evil.com',
  ];

  it.each(externalAttempts)('navigate(%j) 는 외부 이동으로 거부된다', async (target) => {
    const router = createMemoryRouter(routes, { initialEntries: ['/register/school'] });

    await expect(router.navigate(target)).rejects.toThrow(/External navigation is not allowed/);

    // 거부됐으므로 현재 위치가 그대로여야 하고, 외부 호스트가 섞여서도 안 된다.
    expect(router.state.location.pathname).toBe('/register/school');
    expect(router.state.location.pathname).not.toContain('evil.com');
  });

  it.each([
    { pathname: '//evil.com' },
    { pathname: '/\\evil.com' },
    { pathname: '\\\\evil.com' },
  ])('객체 형태 to=%j 도 동일하게 거부된다', async (target) => {
    const router = createMemoryRouter(routes, { initialEntries: ['/register/school'] });

    await expect(router.navigate(target)).rejects.toThrow(/External navigation is not allowed/);
    expect(router.state.location.pathname).toBe('/register/school');
  });

  it.each(externalAttempts)('matchRoutes(%j) 는 어떤 라우트에도 매칭되지 않는다', (target) => {
    expect(matchRoutes(routes, target)).toBeNull();
  });

  it.each([
    '/admin\\..\\evil.com',
    '/register/school\\@evil.com',
    '/admin/orders\\\\evil.com',
  ])(
    '경로 중간의 백슬래시(%j)는 외부로 해석되지 않고 앱 내부 경로로 갇힌다',
    async (target) => {
      // 이 형태들은 reject되지 않지만, 앱 내부의 (매칭 안 되는) 상대 경로로만 취급된다.
      expect(matchRoutes(routes, target)).toBeNull();

      const router = createMemoryRouter(routes, { initialEntries: ['/'] });
      await router.navigate(target);

      expect(router.state.location.pathname.startsWith('/')).toBe(true);
      expect(router.state.location.pathname.startsWith('//')).toBe(false);
      expect(router.state.errors?.[0]).toMatchObject({ status: 404 });
    }
  );
});
