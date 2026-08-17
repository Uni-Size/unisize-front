import { forwardRef } from 'react';
import { formatGender } from '@/utils/genderUtils';
import { formatDate } from '@/utils/dateUtils';

// ============================================================================
// 타입
// ============================================================================

/**
 * A6 인쇄용 인보이스에 필요한, 이미 화면 표시용으로 정규화된 데이터 형태.
 * 실제 finalize-measurement 응답(백엔드와 조율 중)을 이 형태로 변환하는 책임은
 * 호출부(예: src/lib/invoiceMapper.ts)에 있다 — 이 컴포넌트는 필드 이름이
 * 바뀌어도 영향받지 않도록 순수하게 표시 전용으로 유지한다.
 */
export interface InvoiceUniformRow {
  id: string;
  name: string;
  size: string;
  supportedQty: number;
  additionalQty: number;
  customization: string;
  isReserved: boolean;
  tagAssigned: number;
  tagAttached: number;
}

export interface InvoiceSupplyRow {
  id: string;
  name: string;
  size: string;
  qty: number;
}

export interface InvoiceData {
  sellerName: string;
  /** YY.MM.DD 형식으로 이미 포맷된 문자열이거나, 원본 날짜 문자열(자동 포맷됨) */
  date: string;
  toSchool: string;
  fromSchool: string;
  studentName: string;
  gender: string;
  studentPhone: string;
  guardianPhone: string;
  signatureDataUrl: string;
  winterItems: InvoiceUniformRow[];
  summerItems: InvoiceUniformRow[];
  supplyItems: InvoiceSupplyRow[];
  totalTagAssigned: number;
  totalTagAttached: number;
  totalAmount: number;
  winterSubtotal: number;
  summerSubtotal: number;
  tagSubtotal: number;
}

export interface InvoiceReceiptProps {
  data: InvoiceData;
}

// ============================================================================
// 헬퍼
// ============================================================================

const formatCurrency = (amount: number): string => `${amount.toLocaleString()} 원`;

// ============================================================================
// 컴포넌트
// ============================================================================

/**
 * 확정(측정 완료) 직후 자동으로 A6 용지에 인쇄되는 백업용 영수증.
 * 화면에는 보이지 않고(position: fixed; left: -9999px) html2canvas로
 * 래스터화한 뒤 로컬 프린트 에이전트로 전송하기 위해서만 렌더링된다.
 * 클로드 아티팩트에서 여러 차례 합의된 최종 레이아웃을 그대로 재현한다 —
 * 임의로 레이아웃을 바꾸지 말 것.
 */
export const InvoiceReceipt = forwardRef<HTMLDivElement, InvoiceReceiptProps>(
  ({ data }, ref) => {
    const genderLabel = formatGender(data.gender);
    const formattedDate = /^\d{2}\.\d{2}\.\d{2}$/.test(data.date) ? data.date : formatDate(data.date);
    const hasSupplySection =
      data.supplyItems.length > 0 || data.totalTagAssigned > 0 || data.totalTagAttached > 0;

    return (
      <div className="ivc-a6-scope" ref={ref}>
        <style>{styleSheet}</style>
        <div className="a6">
          <div className="brand-row">
            <img src="/smart-logo.png" alt="smart 로고" />
            <span className="meta">
              <span>판매자: {data.sellerName}</span>
              <span>날짜: {formattedDate}</span>
            </span>
          </div>

          <table className="studenttable">
            <tbody>
              <tr>
                <th>입학학교</th>
                <td>{data.toSchool}</td>
                <th>출신학교</th>
                <td>{data.fromSchool}</td>
              </tr>
              <tr>
                <th>이름</th>
                <td>{data.studentName}</td>
                <th>성별</th>
                <td>{genderLabel}</td>
              </tr>
              <tr>
                <th>학생 연락처</th>
                <td>{data.studentPhone}</td>
                <th className="sig-title" rowSpan={2}>
                  확정 사인
                </th>
                <td className="sig-cell" rowSpan={2}>
                  {data.signatureDataUrl && <img src={data.signatureDataUrl} alt="서명" />}
                </td>
              </tr>
              <tr>
                <th>보호자 연락처</th>
                <td>{data.guardianPhone}</td>
              </tr>
            </tbody>
          </table>

          {data.winterItems.length > 0 && (
            <UniformTable title="동복" items={data.winterItems} />
          )}
          {data.summerItems.length > 0 && (
            <UniformTable title="하복" items={data.summerItems} />
          )}

          {hasSupplySection && (
            <div className="row-flex">
              <table className="itemtable section-accessory">
                <thead>
                  <tr>
                    <th>용품</th>
                    <th>사이즈</th>
                    <th>수량</th>
                  </tr>
                </thead>
                <tbody>
                  {data.supplyItems.length === 0 ? (
                    <tr>
                      <td className="item-name" colSpan={3}>
                        -
                      </td>
                    </tr>
                  ) : (
                    data.supplyItems.map((item) => (
                      <tr key={item.id}>
                        <td className="item-name">{item.name}</td>
                        <td>{item.size || '-'}</td>
                        <td>{item.qty}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <table className="itemtable tagtable">
                <thead>
                  <tr>
                    <th>
                      명찰<span className="hint">(명찰/부착)</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="tag-formula">
                      {data.totalTagAssigned}/{data.totalTagAttached}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <table className="paytable">
            <thead>
              <tr>
                <th>총결제대금</th>
                <th>동복</th>
                <th>하복</th>
                <th>명찰</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="amount total">{formatCurrency(data.totalAmount)}</td>
                <td className="amount">{formatCurrency(data.winterSubtotal)}</td>
                <td className="amount">{formatCurrency(data.summerSubtotal)}</td>
                <td className="amount">{formatCurrency(data.tagSubtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  },
);

InvoiceReceipt.displayName = 'InvoiceReceipt';

// ============================================================================
// 동복/하복 공통 테이블
// ============================================================================

const UniformTable = ({ title, items }: { title: string; items: InvoiceUniformRow[] }) => (
  <table className="itemtable">
    <thead>
      <tr>
        <th>{title}</th>
        <th>사이즈</th>
        <th>
          수량<span className="hint">(지원+추가=총개수)</span>
        </th>
        <th>수선</th>
        <th>예약</th>
        <th>
          명찰<span className="hint">(명찰/부착)</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => {
        const totalQty = item.supportedQty + item.additionalQty;
        return (
          <tr key={item.id}>
            <td className="item-name">{item.name}</td>
            <td>{item.size || '-'}</td>
            <td className="qty-formula">
              <span className="qty-base">{item.supportedQty}</span> +
              <span className="qty-extra">{item.additionalQty}</span> = {totalQty}
            </td>
            <td>{item.customization || '-'}</td>
            <td>{item.isReserved ? '예약' : '수령'}</td>
            <td className="tag-formula">
              {item.tagAssigned}/{item.tagAttached}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
);

// ============================================================================
// 스타일 (클로드 아티팩트 목업 CSS를 .ivc-a6-scope 아래로 스코프만 좁혀 그대로 이식)
// ============================================================================

const styleSheet = `
.ivc-a6-scope, .ivc-a6-scope *{ box-sizing:border-box; }
.ivc-a6-scope .a6{
  --paper:#f5f7f5; --ink:#1c1f1e; --ink-soft:#4b524f;
  --rule:#c7cdc8; --rule-strong:#8d938e;
  --qty-base:#2f5f8a; --qty-extra:#c1622c;
}
.ivc-a6-scope .a6{
  width:105mm; height:148mm; background:var(--paper); color:var(--ink);
  padding:3.6% 4.2%; display:flex; flex-direction:column; gap:.5em;
  font-size:11.5px; line-height:1.3; overflow:hidden;
  font-family: ui-sans-serif, -apple-system, "Segoe UI", "Pretendard", "Apple SD Gothic Neo", sans-serif;
}
.ivc-a6-scope .a6 .brand-row{ display:flex; justify-content:space-between; align-items:center; padding-bottom:.45em; border-bottom:2px solid var(--ink); }
.ivc-a6-scope .a6 .brand-row img{ height:2.1em; width:auto; display:block; }
.ivc-a6-scope .a6 .meta{ font-size:.82em; color:var(--ink-soft); display:flex; flex-direction:row; align-items:baseline; gap:.9em; white-space:nowrap; }

.ivc-a6-scope table.studenttable{ width:100%; border-collapse:collapse; font-size:.84em; }
.ivc-a6-scope .studenttable th, .ivc-a6-scope .studenttable td{ border:1px solid var(--rule-strong); padding:.24em .38em; }
.ivc-a6-scope .studenttable th{ background:rgba(0,0,0,.04); font-weight:700; text-align:left; white-space:nowrap; width:5.4em; }
.ivc-a6-scope .studenttable td{ text-align:left; font-variant-numeric: tabular-nums; }
.ivc-a6-scope .studenttable th.sig-title{ text-align:center; }
.ivc-a6-scope .studenttable td.sig-cell{ text-align:center; vertical-align:middle; }
.ivc-a6-scope .studenttable td.sig-cell img, .ivc-a6-scope .studenttable td.sig-cell svg{ width:3.6em; height:1.5em; object-fit:contain; }

.ivc-a6-scope .row-flex{ display:flex; gap:.4em; align-items:stretch; }
.ivc-a6-scope .row-flex .section-accessory{ flex:6 1 0; }
.ivc-a6-scope .row-flex .tagtable{ flex:4 1 0; }
.ivc-a6-scope .tagtable td.tag-formula{ font-size:1em; text-align:center; }

.ivc-a6-scope table.itemtable{ width:100%; border-collapse:collapse; font-size:.82em; }
.ivc-a6-scope .itemtable th, .ivc-a6-scope .itemtable td{ border:1px solid var(--rule-strong); padding:.2em .28em; text-align:center; font-variant-numeric: tabular-nums; }
.ivc-a6-scope .itemtable th{ background:rgba(0,0,0,.04); font-weight:700; }
.ivc-a6-scope .itemtable td.item-name{ text-align:left; font-weight:600; }
.ivc-a6-scope .itemtable td.qty-formula, .ivc-a6-scope .itemtable td.tag-formula{ font-size:.94em; white-space:nowrap; }
.ivc-a6-scope .qty-base{ color:var(--qty-base); font-weight:800; }
.ivc-a6-scope .qty-extra{ color:var(--qty-extra); font-weight:800; }
.ivc-a6-scope .hint{ font-size:.72em; font-weight:500; color:var(--ink-soft); white-space:nowrap; }
.ivc-a6-scope .itemtable td.tag-formula{ font-weight:700; }
.ivc-a6-scope .itemtable th:has(.hint){ white-space:nowrap; }

.ivc-a6-scope table.paytable{ width:100%; table-layout:fixed; border-collapse:collapse; font-size:.86em; margin-top:auto; }
.ivc-a6-scope .paytable th, .ivc-a6-scope .paytable td{ border:1px solid var(--rule-strong); padding:.3em .35em; }
.ivc-a6-scope .paytable th{ background:rgba(0,0,0,.04); font-weight:700; text-align:center; }
.ivc-a6-scope .paytable td.amount{ text-align:center; font-variant-numeric: tabular-nums; }
.ivc-a6-scope .paytable td.amount.total{ font-weight:800; }
.ivc-a6-scope .paytable th:first-child, .ivc-a6-scope .paytable td:first-child{ width:50%; }
`;
