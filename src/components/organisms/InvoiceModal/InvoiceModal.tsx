import React, { useState, useEffect } from "react";
import { Modal, Select } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import { formatGender } from "@/utils/genderUtils";
import { formatDate } from "@/utils/dateUtils";
import { updateAdminOrder } from "@/api/order";
import { getApiErrorString } from "@/utils/errorUtils";
import type {
  StudentDetailData,
  UniformItem,
  SupplyItem,
  HistoryItem,
  OrderSnapshot,
} from "@components/organisms/StudentModal";

export interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: StudentDetailData | null;
  onPaymentComplete?: (orderId: number) => void;
}

const sizeOptions = [
  { value: "77", label: "77" },
  { value: "80", label: "80" },
  { value: "85", label: "85" },
  { value: "90", label: "90" },
  { value: "95", label: "95" },
  { value: "100", label: "100" },
  { value: "105", label: "105" },
  { value: "110", label: "110" },
];

const supplySizeOptions = [
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
];

// 한국어 날짜 형식("2026년 06월 18일 ...") 포함 처리하여 YYYY-MM-DD 키 추출
const toDateKey = (date: string): string => {
  const korean = date.match(/(\d{4})년\s*(\d{2})월\s*(\d{2})일/);
  if (korean) return `${korean[1]}-${korean[2]}-${korean[3]}`;
  return date.slice(0, 10);
};

interface SnapshotState {
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  allUniforms: UniformItem[];
  supplies: SupplyItem[];
}

export const InvoiceModal = ({
  isOpen,
  onClose,
  student,
  onPaymentComplete,
}: InvoiceModalProps) => {
  const [activeDateKey, setActiveDateKey] = useState<string>("");
  const [snapshotStates, setSnapshotStates] = useState<Map<number, SnapshotState>>(new Map());
  const [activeHistory, setActiveHistory] = useState<HistoryItem[]>([]);
  const [nameTagName, setNameTagName] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  // 날짜 기준으로 스냅샷 그룹핑
  const dateGroups = React.useMemo(() => {
    const snapshots = student?.orderSnapshots ?? [];
    const map = new Map<string, OrderSnapshot[]>();
    for (const s of snapshots) {
      const key = toDateKey(s.date);
      const arr = map.get(key) ?? [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [student?.orderSnapshots]);

  const dateKeys = Array.from(dateGroups.keys());
  const activeSnapshots = dateGroups.get(activeDateKey) ?? [];
  const isReadOnly = activeSnapshots.every((s) => s.status === "complete");

  useEffect(() => {
    if (!isOpen || !student) return;

    const snapshots = student.orderSnapshots ?? [];
    const firstKey = snapshots.length > 0 ? toDateKey(snapshots[0].date) : "";
    setActiveDateKey(firstKey);

    const map = new Map<number, SnapshotState>();
    for (const s of snapshots) {
      map.set(s.orderId, {
        winterUniforms: s.winterUniforms,
        summerUniforms: s.summerUniforms,
        allUniforms: s.allUniforms ?? [],
        supplies: s.supplies,
      });
    }
    setSnapshotStates(map);
    setActiveHistory(student.history ?? []);
    setNameTagName(snapshots[0]?.nameTagName ?? student.nameTagName ?? '');
  }, [isOpen, student]);

  const handleDateTabClick = (key: string) => {
    if (key === activeDateKey) return;
    setActiveDateKey(key);
    const firstSnapshot = dateGroups.get(key)?.[0];
    if (firstSnapshot) {
      setActiveHistory(firstSnapshot.history);
      setNameTagName(firstSnapshot.nameTagName ?? student?.nameTagName ?? '');
    }
  };

  const handleUniformChange = (
    orderId: number,
    season: "winter" | "summer" | "all",
    itemId: string,
    field: keyof UniformItem,
    value: string | number | boolean,
  ) => {
    setSnapshotStates((prev) => {
      const cur = prev.get(orderId);
      if (!cur) return prev;
      const next = new Map(prev);
      next.set(orderId, {
        ...cur,
        winterUniforms: season === "winter"
          ? cur.winterUniforms.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
          : cur.winterUniforms,
        summerUniforms: season === "summer"
          ? cur.summerUniforms.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
          : cur.summerUniforms,
        allUniforms: season === "all"
          ? cur.allUniforms.map((i) => (i.id === itemId ? { ...i, [field]: value } : i))
          : cur.allUniforms,
      });
      return next;
    });
  };

  const handleSupplyChange = (
    orderId: number,
    itemId: string,
    field: keyof SupplyItem,
    value: string | number,
  ) => {
    setSnapshotStates((prev) => {
      const cur = prev.get(orderId);
      if (!cur) return prev;
      const next = new Map(prev);
      next.set(orderId, {
        ...cur,
        supplies: cur.supplies.map((i) => (i.id === itemId ? { ...i, [field]: value } : i)),
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!student) return;

    setSaving(true);
    try {
      const saveTargets = activeSnapshots.filter((s) => s.status !== "complete");
      await Promise.all(
        saveTargets.map((snapshot) => {
          const state = snapshotStates.get(snapshot.orderId);
          if (!state) return Promise.resolve();
          const { winterUniforms, summerUniforms, allUniforms, supplies } = state;
          return updateAdminOrder(snapshot.orderId, {
            uniform_items: [...winterUniforms, ...summerUniforms, ...allUniforms]
              .filter((i) => !i.isDeleted)
              .map((i) => ({
                item_id: i.id,
                name: i.name,
                season: winterUniforms.includes(i) ? "winter" : summerUniforms.includes(i) ? "summer" : "all",
                selected_size: i.size,
                purchase_count: i.supportedQuantity + i.additionalQuantity,
                is_reserved: i.reservation,
                customization: i.repair,
                name_tag_count: i.nameTag ?? 0,
                name_tag_attach: i.attachCount > 0,
              })),
            supply_items: supplies
              .filter((i) => i.quantity > 0)
              .map((i) => ({
                item_id: i.id,
                name: i.name,
                selected_size: i.size,
                purchase_count: i.quantity,
              })),
            name_tag_name: nameTagName || undefined,
            notes: "",
          });
        }),
      );
      setToast({ message: "저장되었습니다.", variant: "success" });
    } catch (err) {
      setToast({ message: getApiErrorString(err, "저장 중 오류가 발생했습니다."), variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // 가격 계산 (활성 탭 전체 합산)
  // ============================================================================

  const calcSection = (items: UniformItem[]) => {
    let total = 0;
    let supported = 0;
    for (const item of items) {
      if (item.isDeleted || item.unitPrice == null) continue;
      const qty = item.supportedQuantity + item.additionalQuantity;
      total += item.unitPrice * qty;
      supported += item.unitPrice * item.supportedQuantity;
    }
    return { total, supported, payable: total - supported };
  };

  const allWinter = activeSnapshots.flatMap((s) => snapshotStates.get(s.orderId)?.winterUniforms ?? []);
  const allSummer = activeSnapshots.flatMap((s) => snapshotStates.get(s.orderId)?.summerUniforms ?? []);
  const allAll = activeSnapshots.flatMap((s) => snapshotStates.get(s.orderId)?.allUniforms ?? []);
  const allSupplies = activeSnapshots.flatMap((s) => snapshotStates.get(s.orderId)?.supplies ?? []);

  const winterCalc = calcSection(allWinter);
  const summerCalc = calcSection(allSummer);
  const allCalc = calcSection(allAll);
  const hasPrice =
    allWinter.some((i) => i.unitPrice != null) ||
    allSummer.some((i) => i.unitPrice != null) ||
    allAll.some((i) => i.unitPrice != null);
  const supplyTotal = allSupplies.reduce(
    (sum, i) => (i.unitPrice != null ? sum + i.unitPrice * i.quantity : sum),
    0,
  );
  const hasSupplyPrice = allSupplies.some((i) => i.unitPrice != null);
  const grandTotal = winterCalc.total + summerCalc.total + allCalc.total + supplyTotal;
  const grandSupported = winterCalc.supported + summerCalc.supported + allCalc.supported;
  const grandPayable = grandTotal - grandSupported;

  // ============================================================================
  // 교복 테이블
  // ============================================================================

  const renderUniformTable = (title: string, items: UniformItem[], season: "winter" | "summer" | "all", orderId: number, readOnly = false) => {
    const showPrice = hasPrice;
    const sectionTotal = items.reduce((sum, i) => {
      if (i.isDeleted || i.unitPrice == null) return sum;
      return sum + i.unitPrice * (i.supportedQuantity + i.additionalQuantity);
    }, 0);
    const colSpan = showPrice ? 10 : 8;

    return (
      <div>
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-32.5">{title}</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-18">사이즈</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">지원수량</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">추가수량</th>
              {showPrice && (
                <>
                  <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-22">단가</th>
                  <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">총금액</th>
                </>
              )}
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-20">수선</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-15">예약</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-15">명찰</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-15">부착</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center p-5 text-sm text-bg-400">데이터가 없습니다</td>
              </tr>
            ) : (
              <>
                {items.map((item) => {
                  const totalQty = item.supportedQuantity + item.additionalQuantity;
                  const rowTotal = item.unitPrice != null ? item.unitPrice * totalQty : null;
                  return (
                    <tr key={item.id} className={item.isDeleted ? "bg-red-050 [&_td]:text-red-700" : ""}>
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {item.name}
                        {item.nameTagName && (
                          <span className="ml-1 text-xs text-gray-400">({item.nameTagName})</span>
                        )}
                      </td>
                      <td className="p-1 border border-gray-200 text-center text-gray-700 align-middle">
                        {readOnly ? (
                          <span>{item.size || "-"}</span>
                        ) : (
                          <Select
                            options={sizeOptions}
                            value={item.size}
                            onChange={(value) => handleUniformChange(orderId, season, item.id, "size", value)}
                            fullWidth
                          />
                        )}
                      </td>
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">{item.supportedQuantity}</td>
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {readOnly ? (
                          <span>{item.additionalQuantity}</span>
                        ) : (
                          <input
                            type="number"
                            className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={item.additionalQuantity}
                            onChange={(e) => handleUniformChange(orderId, season, item.id, "additionalQuantity", Number(e.target.value))}
                            min={0}
                          />
                        )}
                      </td>
                      {showPrice && (
                        <>
                          <td className="p-2 border border-gray-200 text-right text-gray-500 align-middle tabular-nums pr-3">
                            {item.unitPrice != null ? `${item.unitPrice.toLocaleString()}원` : "-"}
                          </td>
                          <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                            {item.unitPrice != null ? `${rowTotal!.toLocaleString()}원` : "-"}
                          </td>
                        </>
                      )}
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">{item.repair}</td>
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {readOnly ? (
                          <span>{item.reservation ? "예약" : "수령"}</span>
                        ) : (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.reservation}
                            onClick={() => {
                              handleUniformChange(orderId, season, item.id, "reservation", !item.reservation);
                              handleUniformChange(orderId, season, item.id, "received", item.reservation);
                            }}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer border-none ${item.reservation ? "bg-blue-500" : "bg-gray-300"}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${item.reservation ? "translate-x-4" : "translate-x-1"}`} />
                          </button>
                        )}
                      </td>
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {readOnly ? (
                          <span>{item.nameTag !== null ? item.nameTag : "-"}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-base leading-none"
                              onClick={() => handleUniformChange(orderId, season, item.id, "nameTag", Math.max(0, (item.nameTag ?? 0) - 1))}
                              disabled={(item.nameTag ?? 0) <= 0}
                            >−</button>
                            <span className="w-5 text-center text-sm text-gray-800 tabular-nums">{item.nameTag ?? 0}</span>
                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-base leading-none"
                              onClick={() => handleUniformChange(orderId, season, item.id, "nameTag", (item.nameTag ?? 0) + 1)}
                              disabled={(item.nameTag ?? 0) >= totalQty}
                            >+</button>
                          </div>
                        )}
                      </td>
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {readOnly ? (
                          <span>{item.attachCount > 0 ? item.attachCount : "-"}</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-base leading-none"
                              onClick={() => handleUniformChange(orderId, season, item.id, "attachCount", Math.max(0, (item.attachCount ?? 0) - 1))}
                              disabled={(item.attachCount ?? 0) <= 0}
                            >−</button>
                            <span className="w-5 text-center text-sm text-gray-800 tabular-nums">{item.attachCount ?? 0}</span>
                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-base leading-none"
                              onClick={() => handleUniformChange(orderId, season, item.id, "attachCount", (item.attachCount ?? 0) + 1)}
                              disabled={(item.attachCount ?? 0) >= totalQty}
                            >+</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {showPrice && (
                  <tr className="bg-bg-050 font-medium">
                    <td colSpan={5} className="px-3 py-2 border border-gray-200 text-right text-bg-700">소계</td>
                    <td className="px-3 py-2 border border-gray-200 text-right text-gray-900 tabular-nums">{sectionTotal.toLocaleString()}원</td>
                    <td colSpan={4} className="border border-gray-200" />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // 용품 테이블
  // ============================================================================

  const renderSupplyTable = (supplies: SupplyItem[], orderId: number, readOnly = false) => {
    const grouped: { category: string; items: SupplyItem[] }[] = [];
    supplies.forEach((item) => {
      const existing = grouped.find((g) => g.category === item.category);
      if (existing) existing.items.push(item);
      else grouped.push({ category: item.category, items: [item] });
    });

    const showPrice = hasSupplyPrice;

    return (
      <div className="flex-1">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap" colSpan={2}>용품</th>
              {showPrice && (
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-22">단가</th>
              )}
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-18">사이즈</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">수량</th>
              {showPrice && (
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">총금액</th>
              )}
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) =>
              group.items.map((item, idx) => (
                <tr key={item.id}>
                  {idx === 0 && group.category && (
                    <td
                      className="p-2 border border-gray-200 text-center align-middle bg-bg-050 font-medium text-gray-700"
                      rowSpan={group.items.length}
                    >
                      {group.category}
                    </td>
                  )}
                  <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">{item.name}</td>
                  {showPrice && (
                    <td className="p-2 border border-gray-200 text-right text-gray-500 align-middle tabular-nums pr-3">
                      {item.unitPrice != null ? `${item.unitPrice.toLocaleString()}원` : "-"}
                    </td>
                  )}
                  <td className="p-1 border border-gray-200 text-center text-gray-700 align-middle">
                    {readOnly || item.category === "스타킹" ? (
                      <span>{item.size || "-"}</span>
                    ) : (
                      <Select
                        options={supplySizeOptions}
                        value={item.size}
                        onChange={(value) => handleSupplyChange(orderId, item.id, "size", value)}
                        placeholder="-"
                        fullWidth
                      />
                    )}
                  </td>
                  <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                    {readOnly ? (
                      <span>{item.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.quantity}
                        onChange={(e) => handleSupplyChange(orderId, item.id, "quantity", Number(e.target.value))}
                        min={0}
                      />
                    )}
                  </td>
                  {showPrice && (
                    <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                      {item.unitPrice != null ? `${(item.unitPrice * item.quantity).toLocaleString()}원` : "-"}
                    </td>
                  )}
                </tr>
              ))
            )}
            {showPrice && supplyTotal > 0 && (
              <tr className="bg-bg-050 font-medium">
                <td colSpan={showPrice ? 4 : 3} className="px-3 py-2 border border-gray-200 text-right text-bg-700">소계</td>
                <td className="px-3 py-2 border border-gray-200 text-center text-gray-700" />
                <td className="px-3 py-2 border border-gray-200 text-right text-gray-900 tabular-nums">{supplyTotal.toLocaleString()}원</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // 명찰 테이블
  // ============================================================================

  const renderNameTagTable = () => {
    const nameTag = student?.nameTag;
    if (!nameTag || nameTag.orderQuantity === 0) return null;

    const unitPrice = student?.nameTagPrice ?? nameTag.unitPrice;
    const attachPrice = student?.nameTagAttachPrice ?? nameTag.attachPrice;
    const nameTagTotal = unitPrice != null ? unitPrice * nameTag.orderQuantity : null;
    const attachTotal = attachPrice != null ? attachPrice * nameTag.attachQuantity : null;
    const grandCash = (nameTagTotal ?? 0) + (attachTotal ?? 0);
    const showPrice = unitPrice != null || attachPrice != null;

    return (
      <div className="flex-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">명찰 표시 이름</span>
          {isReadOnly ? (
            <span className="text-sm text-gray-800 font-medium">{nameTagName || student?.name || '-'}</span>
          ) : (
            <input
              type="text"
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm text-gray-800 bg-white outline-none focus:border-primary-900"
              value={nameTagName}
              onChange={(e) => setNameTagName(e.target.value)}
              placeholder={student?.name ?? '이름 입력'}
            />
          )}
        </div>
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap">구분</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-20">주문수량</th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-20">부착수량</th>
              {showPrice && (
                <>
                  <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-22">단가</th>
                  <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">금액</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">명찰</td>
              <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle tabular-nums">{nameTag.orderQuantity}</td>
              <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle tabular-nums">{nameTag.attachQuantity}</td>
              {showPrice && (
                <>
                  <td className="p-2 border border-gray-200 text-right text-gray-500 align-middle tabular-nums pr-3">
                    {unitPrice != null ? `${unitPrice.toLocaleString()}원` : "-"}
                  </td>
                  <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                    {nameTagTotal != null ? `${nameTagTotal.toLocaleString()}원` : "-"}
                  </td>
                </>
              )}
            </tr>
            {nameTag.attachQuantity > 0 && (
              <tr>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">부착</td>
                <td className="p-2 border border-gray-200 text-center text-gray-400 align-middle">-</td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle tabular-nums">{nameTag.attachQuantity}</td>
                {showPrice && (
                  <>
                    <td className="p-2 border border-gray-200 text-right text-gray-500 align-middle tabular-nums pr-3">
                      {attachPrice != null ? `${attachPrice.toLocaleString()}원` : "-"}
                    </td>
                    <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                      {attachTotal != null ? `${attachTotal.toLocaleString()}원` : "-"}
                    </td>
                  </>
                )}
              </tr>
            )}
            {showPrice && grandCash > 0 && (
              <tr className="bg-amber-50">
                <td colSpan={showPrice ? 4 : 2} className="px-3 py-2 border border-gray-200 text-right text-sm font-semibold text-amber-800">
                  명찰 합계 <span className="ml-1 text-xs font-normal text-amber-600">(현금)</span>
                </td>
                <td className="px-3 py-2 border border-gray-200 text-right text-sm font-bold text-amber-800 tabular-nums">
                  {grandCash.toLocaleString()}원
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  if (!student) return null;


  const genderLabel = formatGender(student.gender);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="송장"
        width={1000}
        actions={
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={onClose}
            >
              닫기
            </button>
            {!isReadOnly && (
              <button
                className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={saving}
              >
                저장
              </button>
            )}
            {onPaymentComplete && (
              <button
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={() => {
                  const orderId = activeSnapshots[0]?.orderId ?? student.orderId;
                  if (orderId) onPaymentComplete(orderId);
                }}
              >
                결제 완료
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-4 w-full">
          {/* 학생 정보 */}
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-stretch">
              <div className="flex-1 min-w-0 flex items-center">
                <ViewField label="입학학교" value={student.admissionSchool} />
              </div>
              <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
                <div className="flex-1 flex items-center">
                  <ViewField label="출신학교" value={student.previousSchool} />
                </div>
              </div>
            </div>
            <div className="flex items-stretch">
              <div className="flex-1 min-w-0 flex items-center">
                <ViewField label="이름" value={student.name} />
              </div>
              <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
                <ViewField label="성별" value={genderLabel} />
              </div>
            </div>
            <div className="flex items-stretch">
              <div className="flex-1 min-w-0 flex items-center">
                <ViewField label="학생 연락처" value={student.studentPhone ?? ""} />
              </div>
              <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
                <ViewField label="보호자 연락처" value={student.guardianPhone ?? ""} />
              </div>
            </div>
          </div>

          {/* 날짜 탭 */}
          {dateKeys.length > 0 && (
            <div className="flex gap-3">
              {dateKeys.map((key) => (
                <button
                  key={key}
                  className={`text-sm px-1 py-0.5 border-none bg-transparent cursor-pointer ${
                    key === activeDateKey ? "font-bold text-bg-800" : "text-bg-400"
                  }`}
                  onClick={() => handleDateTabClick(key)}
                >
                  {formatDate(key)}
                </button>
              ))}
            </div>
          )}

          {/* 활성 탭의 스냅샷별 테이블 */}
          {activeSnapshots.map((snapshot, idx) => {
            const state = snapshotStates.get(snapshot.orderId);
            if (!state) return null;
            const snapReadOnly = snapshot.status === "complete";
            const showDivider = activeSnapshots.length > 1;
            const hasSupported = [...state.winterUniforms, ...state.summerUniforms].some((i) => i.supportedQuantity > 0);
            return (
              <div key={snapshot.orderId} className="flex flex-col gap-3">
                {showDivider && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-bg-400 uppercase tracking-wide">
                      주문 {idx + 1}
                    </span>
                    {hasSupported && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5">
                        지원 품목 포함
                      </span>
                    )}
                    <div className="flex-1 border-t border-gray-200" />
                  </div>
                )}
                {renderUniformTable("동복", state.winterUniforms, "winter", snapshot.orderId, snapReadOnly)}
                {renderUniformTable("하복", state.summerUniforms, "summer", snapshot.orderId, snapReadOnly)}
                {state.allUniforms.length > 0 && renderUniformTable("사계절", state.allUniforms, "all", snapshot.orderId, snapReadOnly)}
                <div className="flex gap-4 items-start">
                  {renderSupplyTable(state.supplies, snapshot.orderId, snapReadOnly)}
                  {renderNameTagTable()}
                </div>
              </div>
            );
          })}

          {/* 가격 요약 */}
          {hasPrice && (
            <div className="border border-gray-200 rounded-lg overflow-hidden text-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-bg-050">
                    <th className="px-3 py-2 font-medium text-bg-800 text-left border-b border-gray-200 w-24">구분</th>
                    <th className="px-3 py-2 font-medium text-bg-800 text-right border-b border-gray-200">정가</th>
                    <th className="px-3 py-2 font-medium text-bg-800 text-right border-b border-gray-200">지원금액</th>
                    <th className="px-3 py-2 font-medium text-bg-800 text-right border-b border-gray-200">실납부액</th>
                  </tr>
                </thead>
                <tbody>
                  {winterCalc.total > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-700">동복</td>
                      <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{winterCalc.total.toLocaleString()}원</td>
                      <td className="px-3 py-2 text-right text-blue-600 tabular-nums">
                        {winterCalc.supported > 0 ? `-${winterCalc.supported.toLocaleString()}원` : "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">{winterCalc.payable.toLocaleString()}원</td>
                    </tr>
                  )}
                  {summerCalc.total > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-700">하복</td>
                      <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{summerCalc.total.toLocaleString()}원</td>
                      <td className="px-3 py-2 text-right text-blue-600 tabular-nums">
                        {summerCalc.supported > 0 ? `-${summerCalc.supported.toLocaleString()}원` : "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">{summerCalc.payable.toLocaleString()}원</td>
                    </tr>
                  )}
                  {allCalc.total > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-700">사계절</td>
                      <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{allCalc.total.toLocaleString()}원</td>
                      <td className="px-3 py-2 text-right text-blue-600 tabular-nums">
                        {allCalc.supported > 0 ? `-${allCalc.supported.toLocaleString()}원` : "-"}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">{allCalc.payable.toLocaleString()}원</td>
                    </tr>
                  )}
                  {hasSupplyPrice && supplyTotal > 0 && (
                    <tr className="border-b border-gray-100">
                      <td className="px-3 py-2 text-gray-700">용품</td>
                      <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{supplyTotal.toLocaleString()}원</td>
                      <td className="px-3 py-2 text-right text-gray-400 tabular-nums">-</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">{supplyTotal.toLocaleString()}원</td>
                    </tr>
                  )}
                  {(() => {
                    const nameTag = student?.nameTag;
                    const unitPrice = student?.nameTagPrice ?? nameTag?.unitPrice;
                    const attachPrice = student?.nameTagAttachPrice ?? nameTag?.attachPrice;
                    const nameTagTotal = unitPrice != null && nameTag ? unitPrice * nameTag.orderQuantity : 0;
                    const attachTotal = attachPrice != null && nameTag ? attachPrice * nameTag.attachQuantity : 0;
                    const cashTotal = nameTagTotal + attachTotal;
                    if (cashTotal === 0) return null;
                    return (
                      <tr className="border-b border-gray-100 bg-amber-50/60">
                        <td className="px-3 py-2 text-amber-800 font-medium">
                          명찰
                          <span className="ml-1 text-xs font-normal text-amber-600">(현금)</span>
                        </td>
                        <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{cashTotal.toLocaleString()}원</td>
                        <td className="px-3 py-2 text-right text-gray-400 tabular-nums">-</td>
                        <td className="px-3 py-2 text-right font-medium text-amber-800 tabular-nums">{cashTotal.toLocaleString()}원</td>
                      </tr>
                    );
                  })()}
                  <tr className="bg-bg-050 font-semibold">
                    <td className="px-3 py-2.5 text-bg-800">합계</td>
                    <td className="px-3 py-2.5 text-right text-gray-900 tabular-nums">{grandTotal.toLocaleString()}원</td>
                    <td className="px-3 py-2.5 text-right text-blue-600 tabular-nums">
                      {grandSupported > 0 ? `-${grandSupported.toLocaleString()}원` : "-"}
                    </td>
                    <td className="px-3 py-2.5 text-right text-primary-900 tabular-nums">{grandPayable.toLocaleString()}원</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* 이력 + 등록일/최종수정일 */}
          <div className="flex justify-between items-end gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex border-b border-gray-200 pb-1">
                <span className="text-sm font-medium text-bg-800 w-40">날짜</span>
                <span className="text-sm font-medium text-bg-800">내용</span>
              </div>
              {activeHistory.length > 0 ? (
                activeHistory.map((h, i) => (
                  <div key={i} className="flex">
                    <span className="text-sm text-gray-700 w-40">{h.date}</span>
                    <span className="text-sm text-gray-700">{h.content}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-bg-400">히스토리 없음</span>
              )}
            </div>
            {(student.registeredDate || student.modifiedDate) && (
              <div className="flex flex-col items-end gap-2 flex-none">
                {student.registeredDate && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-bg-400">등록일</span>
                    <span className="text-xs text-gray-700">{student.registeredDate}</span>
                  </div>
                )}
                {student.modifiedDate && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-bg-400">최종 수정일</span>
                    <span className="text-xs text-gray-700">{student.modifiedDate}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

// ============================================================================
// read-only 필드
// ============================================================================

const ViewField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-row items-center w-full">
    <span
      className="flex-none px-4 py-3 text-15 font-medium text-bg-800 bg-bg-050 border-r border-gray-200 h-12 flex items-center"
      style={{ width: "120px" }}
    >
      {label}
    </span>
    <span className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 flex items-center">
      {value || "-"}
    </span>
  </div>
);
