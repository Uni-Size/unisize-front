"use client";

import { useState, useMemo, useCallback } from "react";
import {
  STUDENT_INFO,
  MEASUREMENT_INFO,
  UNIFORM_ITEMS,
  SUPPLY_ITEMS_CONFIG,
} from "@/mocks/measurementData";
import {
  measurementApi,
  type CompleteMeasurementRequest,
} from "@/api/measurementApi";

type SupplyItem = {
  id: string;
  name: string;
  category: string;
  size: string;
};

type UniformSizeItem = {
  id: string;
  itemId: string;
  name: string;
  season: "동복" | "하복";
  selectedSize: number;
  customization: string;
  pantsLength?: string;
  purchaseCount: number; // 구입 개수 추가
};

export default function MeasurementSheet({
  setIsMeasurementSheetOpen,
}: {
  setIsMeasurementSheetOpen: (open: boolean) => void;
}) {
  const [season, setSeason] = useState<"동복" | "하복">("동복");
  const [supplyItems, setSupplyItems] = useState<SupplyItem[]>([]);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  // 교복 사이즈 선택 항목들 (용품처럼 여러 개 추가 가능)
  const [uniformSizeItems, setUniformSizeItems] = useState<UniformSizeItem[]>(
    []
  );

  // 측정 완료 여부
  const [isMeasurementComplete, setIsMeasurementComplete] = useState(false);

  // 서명 입력
  const [signature, setSignature] = useState("");

  // 초기화: 각 교복 아이템에 대해 첫 번째 사이즈 항목을 추가
  useMemo(() => {
    if (uniformSizeItems.length === 0) {
      const initialItems: UniformSizeItem[] = [];
      ["동복", "하복"].forEach((s) => {
        const seasonItems = UNIFORM_ITEMS[s as "동복" | "하복"];
        seasonItems.forEach((item) => {
          initialItems.push({
            id: `${item.id}-${Date.now()}-${Math.random()}`,
            itemId: item.id,
            name: item.name,
            season: s as "동복" | "하복",
            selectedSize: item.size,
            customization: item.customization,
            pantsLength: item.name.includes("바지") ? "" : undefined,
            purchaseCount: 0, // 초기 구입 개수는 0
          });
        });
      });
      setUniformSizeItems(initialItems);
    }
  }, [uniformSizeItems.length]);

  // 교복 아이템 추가
  const addUniformItem = useCallback(
    (itemId: string, season: "동복" | "하복") => {
      const uniformItem = UNIFORM_ITEMS[season].find((i) => i.id === itemId);
      if (!uniformItem) return;

      const newItem: UniformSizeItem = {
        id: `${itemId}-${Date.now()}-${Math.random()}`,
        itemId,
        name: uniformItem.name,
        season,
        selectedSize: uniformItem.size,
        customization: uniformItem.customization,
        pantsLength: uniformItem.name.includes("바지") ? "" : undefined,
        purchaseCount: 1, // 추가 구입 시 기본 1개
      };
      setUniformSizeItems((prev) => [...prev, newItem]);
    },
    []
  );

  // 교복 아이템 제거
  const removeUniformItem = useCallback((id: string) => {
    setUniformSizeItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // 사이즈 변경
  const updateUniformSize = useCallback((id: string, size: number) => {
    setUniformSizeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selectedSize: size } : item
      )
    );
  }, []);

  // 맞춤 정보 변경
  const updateCustomization = useCallback(
    (id: string, customization: string) => {
      setUniformSizeItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, customization } : item))
      );
    },
    []
  );

  // 바지 기장 변경
  const updatePantsLength = useCallback((id: string, length: string) => {
    setUniformSizeItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, pantsLength: length } : item
      )
    );
  }, []);

  // 교복 구입 개수 변경
  const updateUniformPurchaseCount = useCallback(
    (id: string, delta: number) => {
      setUniformSizeItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                purchaseCount: Math.max(0, item.purchaseCount + delta),
              }
            : item
        )
      );
    },
    []
  );

  const addSupplyItem = useCallback(
    (itemName: keyof typeof SUPPLY_ITEMS_CONFIG) => {
      const config = SUPPLY_ITEMS_CONFIG[itemName];
      const firstOption = config.options[0];
      const newItem: SupplyItem = {
        id: `${itemName}-${Date.now()}`,
        name: config.name,
        category: firstOption.category,
        size: firstOption.size,
      };
      setSupplyItems((prev) => [...prev, newItem]);
    },
    []
  );

  const removeSupplyItem = useCallback((itemId: string) => {
    setSupplyItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const updateSupplyItem = useCallback(
    (itemId: string, field: "category" | "size", value: string) => {
      setSupplyItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      );
    },
    []
  );

  // 현재 시즌의 교복 아이템들
  const currentSeasonItems = useMemo(
    () => uniformSizeItems.filter((item) => item.season === season),
    [uniformSizeItems, season]
  );

  // 측정 완료 가능 여부 검증
  const canCompleteMeasurement = useMemo(() => {
    // 모든 바지의 기장이 입력되었는지 확인
    const allPantsLengthsFilled = uniformSizeItems
      .filter((item) => item.name.includes("바지"))
      .every((item) => item.pantsLength && item.pantsLength.trim().length > 0);

    return allPantsLengthsFilled;
  }, [uniformSizeItems]);

  const handleCompleteMeasurement = useCallback(() => {
    if (!canCompleteMeasurement) {
      alert("모든 바지 기장을 입력해주세요.");
      return;
    }

    // 측정 완료 상태로 전환
    setIsMeasurementComplete(true);
  }, [canCompleteMeasurement]);

  const handleFinalConfirmation = useCallback(async () => {
    if (!signature || signature.trim().length === 0) {
      alert("서명을 입력해주세요.");
      return;
    }

    // 용품 데이터 변환 (구입개수가 0인 항목 제외)
    const supplyItemsData = supplyItems
      .filter((item) => (itemCounts[item.id] || 0) > 0)
      .map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        size: item.size,
        count: itemCounts[item.id] || 0,
      }));

    // 교복 데이터 변환 - 모든 시즌의 아이템을 배열로 전송
    const uniformItemsData = uniformSizeItems.map((item) => ({
      id: item.id,
      itemId: item.itemId,
      name: item.name,
      season: item.season,
      selectedSize: item.selectedSize,
      customization: item.customization,
      pantsLength: item.pantsLength,
      purchaseCount: item.purchaseCount,
    }));

    const requestData: CompleteMeasurementRequest = {
      studentId: "student-001", // 실제로는 props나 context에서 받아올 값
      uniformItems: uniformItemsData,
      supplyItems: supplyItemsData,
      signature,
    };

    try {
      const result = await measurementApi.completeMeasurement(requestData);
      alert(result.message);
      setIsMeasurementSheetOpen(false);

      // 성공 시 추가 작업 (예: 페이지 이동, 모달 닫기 등)
    } catch (error) {
      console.error("측정 완료 실패:", error);
      alert("측정 완료에 실패했습니다.");
    }
  }, [uniformSizeItems, supplyItems, itemCounts, signature]);

  return (
    <div className="fixed bottom-0 left-0 bg-white w-full rounded-t-md h-5/6 overflow-y-auto">
      {/* 학생 정보 */}
      <StudentInfo />

      {/* 채촌 정보 */}
      <MeasurementInfo />

      {!isMeasurementComplete ? (
        <>
          {/* 사이즈 섹션 */}
          <SizeSection
            season={season}
            setSeason={setSeason}
            uniformSizeItems={uniformSizeItems}
            onAddItem={addUniformItem}
            onRemoveItem={removeUniformItem}
            onUpdateSize={updateUniformSize}
            onUpdateCustomization={updateCustomization}
            onUpdatePantsLength={updatePantsLength}
            onUpdatePurchaseCount={updateUniformPurchaseCount}
          />

          {/* 용품 섹션 */}
          <SupplySection
            items={supplyItems}
            onAddItem={addSupplyItem}
            onRemoveItem={removeSupplyItem}
            onUpdateItem={updateSupplyItem}
            itemCounts={itemCounts}
            setItemCounts={setItemCounts}
          />

          {/* 측정 완료 버튼 */}
          <div className="p-6">
            <button
              onClick={handleCompleteMeasurement}
              disabled={!canCompleteMeasurement}
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                canCompleteMeasurement
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              측정 완료
            </button>
            {!canCompleteMeasurement && (
              <p className="text-xs text-red-500 mt-2 text-center">
                모든 교복 사이즈를 확정하고 바지 기장을 입력해주세요.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 측정 완료 후 확정 내용 표시 */}
          <ConfirmedDataView
            uniformSizeItems={uniformSizeItems}
            supplyItems={supplyItems}
            itemCounts={itemCounts}
          />

          {/* 서명 및 최종 확정 */}
          <div className="border-b-8 border-black/5 p-6">
            <p className="text-xs text-gray-600 pb-3.5">서명</p>
            <input
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="서명을 입력해주세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsMeasurementComplete(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                수정하기
              </button>
              <button
                onClick={handleFinalConfirmation}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                최종 확정
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------ 분리된 UI 섹션 ------------------ */

const StudentInfo = () => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-3.5">
      {STUDENT_INFO.school.to} 측정 마감일 : {STUDENT_INFO.deadline}
    </p>
    <div className="flex justify-between gap-8">
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-600">출신학교</span>{" "}
          {STUDENT_INFO.school.from} →
          <span className="text-gray-600 ml-2">입학학교</span>{" "}
          {STUDENT_INFO.school.to}({STUDENT_INFO.school.year})
        </p>
        <p>
          <span className="text-gray-600">학생이름</span>{" "}
          {STUDENT_INFO.student.name} ({STUDENT_INFO.student.gender})
          <span className="text-gray-600 ml-4">연락처</span>{" "}
          {STUDENT_INFO.contact.join(" | ")}
        </p>
      </div>
      <ul className="text-xs text-gray-600 space-y-0.5">
        <li>예약 시간 : {STUDENT_INFO.timestamps.reservation}</li>
        <li>접수 시간 : {STUDENT_INFO.timestamps.reception}</li>
        <li>측정 시작 : {STUDENT_INFO.timestamps.measurementStart}</li>
        <li>
          측정 완료 : {STUDENT_INFO.timestamps.measurementComplete || "-"}
        </li>
      </ul>
    </div>
  </div>
);

const MeasurementInfo = () => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-2">채촌정보</p>
    <div className="grid grid-cols-4 gap-2">
      {[
        MEASUREMENT_INFO.height,
        MEASUREMENT_INFO.weight,
        MEASUREMENT_INFO.shoulder,
        MEASUREMENT_INFO.waist,
      ].map((info, i) => (
        <div
          key={i}
          className="bg-gray-50 py-2 px-3 rounded-full border border-gray-300 text-center text-sm"
        >
          {info}
        </div>
      ))}
    </div>
  </div>
);

interface SizeSectionProps {
  season: "동복" | "하복";
  setSeason: (s: "동복" | "하복") => void;
  uniformSizeItems: UniformSizeItem[];
  onAddItem: (itemId: string, season: "동복" | "하복") => void;
  onRemoveItem: (id: string) => void;
  onUpdateSize: (id: string, size: number) => void;
  onUpdateCustomization: (id: string, customization: string) => void;
  onUpdatePantsLength: (id: string, length: string) => void;
  onUpdatePurchaseCount: (id: string, delta: number) => void;
}

const SizeSection = ({
  season,
  setSeason,
  uniformSizeItems,
  onAddItem,
  onRemoveItem,
  onUpdateSize,
  onUpdateCustomization,
  onUpdatePantsLength,
  onUpdatePurchaseCount,
}: SizeSectionProps) => {
  // 현재 시즌의 아이템들을 품목별로 그룹화
  const groupedItems = uniformSizeItems
    .filter((item) => item.season === season)
    .reduce((acc, item) => {
      if (!acc[item.itemId]) {
        acc[item.itemId] = [];
      }
      acc[item.itemId].push(item);
      return acc;
    }, {} as Record<string, UniformSizeItem[]>);

  // 모든 품목 목록 (순서 유지를 위해)
  const allItemIds = UNIFORM_ITEMS[season].map((item) => item.id);

  return (
    <div className="border-b-8 border-black/5 p-6">
      <p className="text-xs text-gray-600 pb-3.5">사이즈</p>

      {/* 탭 */}
      <div className="flex border-b mb-4">
        {(["동복", "하복"] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 pb-2 text-center font-medium transition-colors ${
              season === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
            onClick={() => setSeason(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 헤더 (7열로 변경: 품목, 가격, 사이즈, 맞춤, 지원개수, 구입개수, 총개수) */}
      <div className="grid grid-cols-7 gap-2 text-xs text-center font-semibold bg-gray-50 py-2 rounded">
        {[
          "품목",
          "가격",
          "사이즈",
          "맞춤",
          "지원개수",
          "구입개수",
          "총 개수",
        ].map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      {/* 품목 리스트 - 품목별로 그룹화하여 표시 */}
      {allItemIds.map((itemId) => {
        const baseItem = UNIFORM_ITEMS[season].find((i) => i.id === itemId);
        if (!baseItem) return null;

        const itemsOfType = groupedItems[itemId] || [];
        const hasItems = itemsOfType.length > 0;

        return (
          <div key={itemId}>
            {/* 첫 번째 아이템이 없으면 + 버튼만 표시 */}
            {!hasItems && (
              <div className="grid grid-cols-7 gap-2 py-3 text-sm border-b items-center hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onAddItem(itemId, season)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-xs"
                  >
                    +
                  </button>
                  <span className="font-medium">{baseItem.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {baseItem.price.toLocaleString()}원
                </div>
                <div className="text-center text-gray-400">-</div>
                <div className="text-center text-gray-400">-</div>
                <div className="text-center font-medium">
                  {baseItem.provided}
                </div>
                <div className="text-center text-gray-400">0</div>
                <div className="text-center text-gray-400">
                  {baseItem.provided}
                </div>
              </div>
            )}

            {/* 추가된 아이템들 표시 */}
            {itemsOfType.map((item, index) => {
              const isPants = item.name.includes("바지");
              // 해당 품목의 모든 구입개수 합계
              const totalPurchaseCount = itemsOfType.reduce(
                (sum, i) => sum + i.purchaseCount,
                0
              );
              // 총 개수 = 지원개수 + 구입개수 합계
              const totalCount = baseItem.provided + totalPurchaseCount;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-7 gap-2 py-3 text-sm border-b items-center hover:bg-gray-50"
                >
                  {/* 품목 */}
                  <div className="flex items-center gap-2">
                    {index === 0 ? (
                      <button
                        onClick={() => onAddItem(itemId, season)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-xs"
                      >
                        +
                      </button>
                    ) : (
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="w-5 h-5 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-white font-bold text-xs"
                      >
                        -
                      </button>
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>

                  {/* 가격 */}
                  <div className="text-xs text-gray-500">
                    {baseItem.price.toLocaleString()}원
                  </div>

                  {/* 사이즈 드롭다운 */}
                  <div className="text-center">
                    <select
                      value={item.selectedSize}
                      onChange={(e) =>
                        onUpdateSize(item.id, Number(e.target.value))
                      }
                      className="text-xs text-gray-700 border rounded px-1 py-0.5 bg-white"
                    >
                      {baseItem.availableSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 맞춤 (바지인 경우 기장 입력) */}
                  <div className="text-center">
                    {isPants ? (
                      <input
                        type="text"
                        value={item.pantsLength || ""}
                        onChange={(e) =>
                          onUpdatePantsLength(item.id, e.target.value)
                        }
                        placeholder="예: 34 3/4"
                        className={`w-full text-xs text-center border rounded px-2 py-1 ${
                          !item.pantsLength ||
                          item.pantsLength.trim().length === 0
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                    ) : (
                      <input
                        type="text"
                        value={item.customization}
                        onChange={(e) =>
                          onUpdateCustomization(item.id, e.target.value)
                        }
                        placeholder="맞춤 정보"
                        className="w-full text-xs text-center border rounded px-2 py-1 border-gray-300"
                      />
                    )}
                  </div>

                  {/* 지원개수 */}
                  <div className="text-center font-medium">
                    {index === 0 ? baseItem.provided : 0}
                  </div>

                  {/* 구입개수 - 스테퍼 */}
                  <div className="flex items-center justify-center gap-1">
                    <CountButton
                      onClick={() => onUpdatePurchaseCount(item.id, -1)}
                    >
                      -
                    </CountButton>
                    <span className="w-6 text-center font-medium">
                      {item.purchaseCount}
                    </span>
                    <CountButton
                      onClick={() => onUpdatePurchaseCount(item.id, 1)}
                    >
                      +
                    </CountButton>
                  </div>

                  {/* 총 개수 */}
                  <div className="text-center font-semibold">{totalCount}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

interface SupplySectionProps {
  items: SupplyItem[];
  onAddItem: (itemName: keyof typeof SUPPLY_ITEMS_CONFIG) => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateItem: (
    itemId: string,
    field: "category" | "size",
    value: string
  ) => void;
  itemCounts: Record<string, number>;
  setItemCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const SupplySection = ({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  itemCounts,
  setItemCounts,
}: SupplySectionProps) => {
  const updateCount = (itemId: string, delta: number) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  // 품목별로 그룹화
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {} as Record<string, SupplyItem[]>);

  return (
    <div className="border-b-8 border-black/5 p-6">
      <p className="text-xs text-gray-600 pb-3.5">용품</p>

      {/* 헤더 (5열) */}
      <div className="grid grid-cols-5 gap-2 text-xs text-center font-semibold bg-gray-50 py-2 rounded">
        {["품목", "종류", "사이즈", "구입개수", "비고"].map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      {/* 용품 리스트 - 품목별 그룹으로 표시 */}
      {Object.entries(SUPPLY_ITEMS_CONFIG)
        .filter(([itemName]) => itemName !== "명찰") // 명찰 제외
        .map(([itemName, config]) => {
          const itemsOfType = groupedItems[config.name] || [];
          const hasItems = itemsOfType.length > 0;

          return (
            <div key={itemName}>
              {/* 첫 번째 아이템이 없으면 + 버튼만 표시 */}
              {!hasItems && (
                <div className="grid grid-cols-5 gap-2 py-3 text-sm border-b items-center hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        onAddItem(itemName as keyof typeof SUPPLY_ITEMS_CONFIG)
                      }
                      className="w-5 h-5 flex items-center justify-center rounded bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-xs"
                    >
                      +
                    </button>
                    <span className="font-medium">{config.name}</span>
                  </div>
                  <div className="text-center text-xs text-gray-400">-</div>
                  <div className="text-center text-gray-400">-</div>
                  <div className="text-center text-gray-400">0</div>
                  <div className="text-center text-gray-400">-</div>
                </div>
              )}

              {/* 추가된 아이템들 표시 */}
              {itemsOfType.map((item, index) => {
                const purchaseCount = itemCounts[item.id] || 0;
                const availableOptions = config.options;

                // 종류 옵션 (중복 제거)
                const categoryOptions = [
                  ...new Set(availableOptions.map((opt) => opt.category)),
                ];

                // 사이즈 옵션 (중복 제거)
                const sizeOptions = [
                  ...new Set(availableOptions.map((opt) => opt.size)),
                ];

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-5 gap-2 py-3 text-sm border-b items-center hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <button
                          onClick={() =>
                            onAddItem(
                              itemName as keyof typeof SUPPLY_ITEMS_CONFIG
                            )
                          }
                          className="w-5 h-5 flex items-center justify-center rounded bg-yellow-400 hover:bg-yellow-500 text-white font-bold text-xs"
                        >
                          +
                        </button>
                      )}
                      {index > 0 && (
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-gray-300 hover:bg-gray-400 text-white font-bold text-xs"
                        >
                          -
                        </button>
                      )}
                      <span className="font-medium">{item.name}</span>
                    </div>

                    {/* 종류 선택 - 항상 드롭다운 */}
                    <div className="text-center">
                      <select
                        value={item.category}
                        onChange={(e) =>
                          onUpdateItem(item.id, "category", e.target.value)
                        }
                        className="text-xs text-gray-700 border rounded px-1 py-0.5 bg-white"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 사이즈 선택 - 항상 드롭다운 */}
                    <div className="text-center">
                      <select
                        value={item.size}
                        onChange={(e) =>
                          onUpdateItem(item.id, "size", e.target.value)
                        }
                        className="text-xs text-gray-700 border rounded px-1 py-0.5 bg-white"
                      >
                        {sizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 구입개수 */}
                    <div className="flex items-center justify-center gap-1">
                      <CountButton onClick={() => updateCount(item.id, -1)}>
                        -
                      </CountButton>
                      <span className="w-6 text-center font-medium">
                        {purchaseCount}
                      </span>
                      <CountButton onClick={() => updateCount(item.id, 1)}>
                        +
                      </CountButton>
                    </div>

                    {/* 비고 */}
                    <div className="text-center text-gray-400">-</div>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
};

const CountButton = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 active:bg-gray-300"
    onClick={onClick}
  >
    {children}
  </button>
);

interface ConfirmedDataViewProps {
  uniformSizeItems: UniformSizeItem[];
  supplyItems: SupplyItem[];
  itemCounts: Record<string, number>;
}

const ConfirmedDataView = ({
  uniformSizeItems,
  supplyItems,
  itemCounts,
}: ConfirmedDataViewProps) => {
  // 시즌별로 그룹화
  const groupedBySeason = uniformSizeItems.reduce((acc, item) => {
    if (!acc[item.season]) {
      acc[item.season] = [];
    }
    acc[item.season].push(item);
    return acc;
  }, {} as Record<"동복" | "하복", UniformSizeItem[]>);

  return (
    <div className="border-b-8 border-black/5 p-6">
      <p className="text-xs text-gray-600 pb-3.5">확정 내용</p>

      {/* 교복 확정 내용 */}
      {(["동복", "하복"] as const).map((season) => {
        const items = groupedBySeason[season] || [];
        if (items.length === 0) return null;

        return (
          <div key={season} className="mb-6">
            <h3 className="text-sm font-semibold mb-2">교복 ({season})</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">품목</th>
                    <th className="py-2 px-3 text-center">선택 사이즈</th>
                    <th className="py-2 px-3 text-center">맞춤 정보</th>
                    <th className="py-2 px-3 text-center">구입개수</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isPants = item.name.includes("바지");

                    return (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="py-2 px-3 font-medium">{item.name}</td>
                        <td className="py-2 px-3 text-center">
                          {item.selectedSize}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {isPants
                            ? `기장: ${item.pantsLength || "-"}`
                            : item.customization || "-"}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold">
                          {item.purchaseCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {/* 용품 확정 내용 */}
      {supplyItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">용품</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-2 px-3 text-left">품목</th>
                  <th className="py-2 px-3 text-center">종류</th>
                  <th className="py-2 px-3 text-center">사이즈</th>
                  <th className="py-2 px-3 text-center">구입개수</th>
                </tr>
              </thead>
              <tbody>
                {supplyItems.map((item) => {
                  const count = itemCounts[item.id] || 0;
                  if (count === 0) return null; // 구입개수가 0인 항목은 표시하지 않음

                  return (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-2 px-3 font-medium">{item.name}</td>
                      <td className="py-2 px-3 text-center">{item.category}</td>
                      <td className="py-2 px-3 text-center">{item.size}</td>
                      <td className="py-2 px-3 text-center font-semibold">
                        {count}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
