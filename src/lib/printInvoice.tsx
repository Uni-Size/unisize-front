import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import html2canvas from 'html2canvas';
import { InvoiceReceipt } from '@components/organisms/InvoiceReceipt';
import type { InvoiceData } from '@components/organisms/InvoiceReceipt';

// 스태프 개인 PC에서 상시 구동되는 로컬 프린트 에이전트(Marklife D100 라벨 프린터
// 브릿지). unisize 백엔드가 아니라 각자의 워크스테이션에서 도는 로컬 서버이므로
// apiClient(axios, baseURL 화이트리스트 검증 포함)를 거치지 않고 별도 fetch로 호출한다.
const PRINT_AGENT_BASE_URL = 'http://127.0.0.1:9192';
const HEALTH_CHECK_TIMEOUT_MS = 2000;
const PRINT_TIMEOUT_MS = 10000;

/**
 * 프린트 에이전트에 연결할 수 없거나(네트워크 에러) 200이 아닌 응답을 준 경우
 * 던져지는 에러. 호출부는 이 에러를 확정 실패로 취급하지 않고 별도의
 * "프린터 연결 안됨" 안내 토스트만 띄워야 한다 — 확정 자체는 이미 완료된 상태다.
 */
export class PrintAgentError extends Error {}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function checkPrintAgentHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(
      `${PRINT_AGENT_BASE_URL}/health`,
      { method: 'GET' },
      HEALTH_CHECK_TIMEOUT_MS,
    );
    return res.ok;
  } catch {
    return false;
  }
}

function waitForImagesToLoad(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        }),
    ),
  ).then(() => undefined);
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

/**
 * A6 인보이스를 화면에 보이지 않게(position: fixed, 화면 밖) 렌더링한 뒤
 * html2canvas로 PNG 캡처하여 로컬 프린트 에이전트에 인쇄를 요청한다.
 *
 * 완전히 fire-and-forget으로 호출할 것: 이 함수가 던지는 에러는 인쇄 실패만을
 * 의미하며, 이미 저장이 끝난 확정(measurement finalize) 자체와는 무관하다.
 * 호출부는 반드시 try/catch로 감싸고, 확정 성공 토스트/롤백에 영향을 주지 않아야 한다.
 */
export async function printA6Invoice(data: InvoiceData): Promise<void> {
  const isHealthy = await checkPrintAgentHealth();
  if (!isHealthy) {
    throw new PrintAgentError('프린트 에이전트에 연결할 수 없습니다.');
  }

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(<InvoiceReceipt data={data} />);
    });

    const target = container.querySelector<HTMLElement>('.a6');
    if (!target) {
      throw new Error('인보이스 렌더링에 실패했습니다.');
    }

    await waitForImagesToLoad(target);
    await waitForNextPaint();

    const canvas = await html2canvas(target, {
      backgroundColor: '#f5f7f5',
      scale: 3,
      useCORS: true,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1] ?? '';
    if (!base64) {
      throw new Error('인보이스 이미지 생성에 실패했습니다.');
    }

    const printRes = await fetchWithTimeout(
      `${PRINT_AGENT_BASE_URL}/print`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: base64 }),
      },
      PRINT_TIMEOUT_MS,
    );

    if (!printRes.ok) {
      throw new PrintAgentError(`프린트 요청이 실패했습니다. (${printRes.status})`);
    }
  } catch (err) {
    if (err instanceof PrintAgentError) throw err;
    throw new PrintAgentError(err instanceof Error ? err.message : '인쇄 중 알 수 없는 오류가 발생했습니다.');
  } finally {
    root.unmount();
    container.remove();
  }
}
