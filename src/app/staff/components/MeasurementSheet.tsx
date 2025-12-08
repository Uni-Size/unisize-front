"use client";

import { useState, useRef, useEffect } from "react";
import {
  type StudentMeasurementData,
  type StartMeasurementResponse,
  type RegisterStudent,
  submitMeasurementOrder,
} from "@/api/studentApi";
import { MeasurementMode, UniformSizeItem, SupplyItem } from "./types";
import { useUniformItems } from "../hooks/useUniformItems";
import { useSupplyItems } from "../hooks/useSupplyItems";
import { useMeasurementData } from "../hooks/useMeasurementData";

export default function MeasurementSheet({
  setIsMeasurementSheetOpen,
  studentId,
  measurementData,
  selectedStudent,
  mode = "new",
  onSuccess,
}: {
  setIsMeasurementSheetOpen: (open: boolean) => void;
  studentId: number;
  measurementData?: StartMeasurementResponse;
  selectedStudent?: RegisterStudent;
  mode?: MeasurementMode;
  onSuccess?: () => void;
}) {
  const [season, setSeason] = useState<"동복" | "하복">("동복");
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [missingCustomizationItems, setMissingCustomizationItems] = useState<string[]>([]);

  // recommended_uniforms 데이터를 표시 형식으로 변환
  const uniformProductsByCategory = {
    동복:
      measurementData?.recommended_uniforms?.winter?.map((item) => {
        return {
          id: item.product,
          name: item.product,
          recommendedSize: item.recommended_size,
          availableSizes: item.available_sizes.length > 0
            ? item.available_sizes.map((s) => {
                // 숫자형 사이즈는 그대로, 문자형은 숫자로 변환
                return Number(s.size) || 95;
              })
            : [95, 100, 105, 110],
          price: item.price,
          provided: item.supported_quantity,
          quantity: item.quantity,
          selectableWith: item.selectable_with,
          gender: item.gender,
          isCustomizationRequired: item.is_customization_required,
        };
      }) || [],
    하복:
      measurementData?.recommended_uniforms?.summer?.map((item) => {
        return {
          id: item.product,
          name: item.product,
          recommendedSize: item.recommended_size,
          availableSizes: item.available_sizes.length > 0
            ? item.available_sizes.map((s) => {
                // 숫자형 사이즈는 그대로, 문자형은 숫자로 변환
                return Number(s.size) || 95;
              })
            : [95, 100, 105, 110],
          price: item.price,
          provided: item.supported_quantity,
          quantity: item.quantity,
          selectableWith: item.selectable_with,
          gender: item.gender,
          isCustomizationRequired: item.is_customization_required,
        };
      }) || [],
  };

  // 커스텀 훅으로 상태 관리 분리
  const uniformItems = useUniformItems(uniformProductsByCategory);
  const supplyItems = useSupplyItems(measurementData?.supply_items);
  const measurementHook = useMeasurementData(
    studentId,
    mode,
    measurementData,
    selectedStudent
  );

  const {
    studentData,
    isLoading,
    isMeasurementComplete,
    setIsMeasurementComplete,
    signature,
    setSignature,
    handleCompleteMeasurement,
    handleFinalConfirmation,
  } = measurementHook;

  const submitMeasurementData = async () => {
    // uniformSizeItems를 MeasurementOrderItem[] 형식으로 변환
    const uniform_items = uniformItems.uniformSizeItems.map((item) => {
      return {
        item_id: item.itemId,
        name: item.name,
        season: item.season,
        selected_size: item.selectedSize,
        customization: item.customization || " ",
        purchase_count: item.purchaseCount,
      };
    });

    // supplyItems와 itemCounts를 SupplyOrderItem[] 형식으로 변환
    const supply_items = supplyItems.supplyItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      size: item.size,
      count: supplyItems.itemCounts[item.id] || 0,
    }));

    // submitMeasurementOrder 호출
    await submitMeasurementOrder(studentId, {
      uniform_items,
      supply_items,
    });

    // 성공 시 측정 완료 상태로 변경
    setIsMeasurementComplete(true);
  };

  const onCompleteMeasurement = async () => {
    try {
      // 맞춤 정보 검증
      const itemsMissingCustomization: string[] = [];

      uniformItems.uniformSizeItems.forEach((item) => {
        if (item.isCustomizationRequired) {
          const hasCustomization = item.customization && item.customization.trim().length > 0;

          if (!hasCustomization) {
            itemsMissingCustomization.push(`${item.name} (${item.season})`);
          }
        }
      });

      // 맞춤 정보가 없는 품목이 있으면 모달 표시
      if (itemsMissingCustomization.length > 0) {
        setMissingCustomizationItems(itemsMissingCustomization);
        setShowCustomizationModal(true);
        return;
      }

      // 맞춤 정보가 모두 있으면 바로 제출
      await submitMeasurementData();
    } catch (error) {
      console.error("측정 주문 제출 실패:", error);
      alert("측정 주문 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const onConfirmWithoutCustomization = async () => {
    try {
      setShowCustomizationModal(false);
      await submitMeasurementData();
    } catch (error) {
      console.error("측정 주문 제출 실패:", error);
      alert("측정 주문 제출에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const onFinalConfirmation = async () => {
    try {
      await handleFinalConfirmation();
      // 성공 시 시트 닫기 및 리스트 재조회
      setIsMeasurementSheetOpen(false);
      onSuccess?.();
    } catch (error) {
      // 에러는 handleFinalConfirmation 내부에서 처리됨
      console.error("최종 확정 처리 중 에러:", error);
    }
  };

  if (isLoading) {
    return (
      <>
        {/* 오버레이 */}
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMeasurementSheetOpen(false)}
        />
        {/* 시트 */}
        <div className="fixed bottom-0 left-0 bg-white w-full rounded-t-md h-5/6 overflow-y-auto flex items-center justify-center z-50">
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </>
    );
  }

  if (!studentData) {
    return (
      <>
        {/* 오버레이 */}
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMeasurementSheetOpen(false)}
        />
        {/* 시트 */}
        <div className="fixed bottom-0 left-0 bg-white w-full rounded-t-md h-5/6 overflow-y-auto flex items-center justify-center z-50">
          <p className="text-red-600">학생 데이터를 불러올 수 없습니다.</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* 오버레이 - 외부 클릭 시 시트 닫기 */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={() => setIsMeasurementSheetOpen(false)}
      />
      {/* 시트 */}
      <div className="fixed bottom-0 left-0 bg-white w-full rounded-t-md h-5/6 overflow-y-auto z-50">
        <StudentInfo studentData={studentData} />
        <MeasurementInfo studentData={studentData} />

        {!isMeasurementComplete ? (
          <>
            <SizeSection
              season={season}
              setSeason={setSeason}
              uniformSizeItems={uniformItems.uniformSizeItems}
              uniformProductsByCategory={uniformProductsByCategory}
              onAddItem={uniformItems.addItem}
              onRemoveItem={uniformItems.removeItem}
              onUpdateSize={uniformItems.updateSize}
              onUpdateCustomization={uniformItems.updateCustomization}
              onUpdatePurchaseCount={uniformItems.updatePurchaseCount}
            />

            <SupplySection
              items={supplyItems.supplyItems}
              itemCounts={supplyItems.itemCounts}
              setItemCounts={supplyItems.setItemCounts}
            />

            <div className="p-6">
              <button
                onClick={onCompleteMeasurement}
                className="w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                측정 완료
              </button>
            </div>
          </>
        ) : (
          <>
            <ConfirmedDataView
              uniformSizeItems={uniformItems.uniformSizeItems}
              supplyItems={supplyItems.supplyItems}
              itemCounts={supplyItems.itemCounts}
            />

            <div className="border-b-8 border-black/5 p-6">
              {mode === "readonly" ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-800 mb-2">
                    수정 불가 안내
                  </p>
                  <p className="text-sm text-yellow-700">
                    결제 완료 후 일정 기간이 지나 더 이상 수정할 수 없습니다.
                    <br />
                    변경이 필요한 경우 관리자에게 문의해주세요.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600 pb-3.5">서명</p>
                  <SignatureCanvas
                    signature={signature}
                    setSignature={setSignature}
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => setIsMeasurementComplete(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      수정하기
                    </button>
                    <button
                      onClick={onFinalConfirmation}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      최종 확정
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* 맞춤 정보 누락 모달 */}
      <CustomizationRequiredModal
        isOpen={showCustomizationModal}
        missingItems={missingCustomizationItems}
        onClose={() => setShowCustomizationModal(false)}
        onConfirm={onConfirmWithoutCustomization}
      />
    </>
  );
}

/* ------------------ 분리된 UI 섹션 ------------------ */

const StudentInfo = ({
  studentData,
}: {
  studentData: StudentMeasurementData;
}) => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-3.5">
      {studentData.school_name} 측정 마감일 : {studentData.deadline}
    </p>
    <div className="flex justify-between gap-8">
      <div className="space-y-1 text-sm">
        <p>
          <span className="text-gray-600">출신학교</span>{" "}
          {studentData.previous_school} →
          <span className="text-gray-600 ml-2">입학학교</span>{" "}
          {studentData.school_name}({studentData.admission_year})
        </p>
        <p>
          <span className="text-gray-600">학생이름</span> {studentData.name} (
          {studentData.gender === "male" ? "남" : "여"})
          <span className="text-gray-600 ml-4">연락처</span>{" "}
          {studentData.student_phone} | {studentData.guardian_phone}
        </p>
      </div>
      <ul className="text-xs text-gray-600 space-y-0.5">
        <li>접수 시간 : {studentData.registered_at || "-"}</li>
        <li>측정 시작 : {studentData.measurement_start_at || "-"}</li>
        <li>측정 완료 : {studentData.measurement_end_at || "-"}</li>
      </ul>
    </div>
  </div>
);

const MeasurementInfo = ({
  studentData,
}: {
  studentData: StudentMeasurementData;
}) => (
  <div className="border-b-8 border-black/5 p-6">
    <p className="text-xs text-gray-600 pb-2">채촌정보</p>
    <div className="grid grid-cols-4 gap-2">
      {[
        `키 ${studentData.body.height || 0}cm`,
        `몸무게 ${studentData.body.weight || 0}kg`,
        `어깨 ${studentData.body.shoulder || 0}cm`,
        `허리 ${studentData.body.waist || 0}cm`,
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

interface UniformProductItem {
  id: string;
  name: string;
  recommendedSize: string;
  availableSizes: number[];
  price: number;
  provided: number;
  quantity: number;
  selectableWith?: string[];
  gender: "male" | "female" | "unisex";
  isCustomizationRequired?: boolean;
}

interface SizeSectionProps {
  season: "동복" | "하복";
  setSeason: (s: "동복" | "하복") => void;
  uniformSizeItems: UniformSizeItem[];
  uniformProductsByCategory: {
    동복: UniformProductItem[];
    하복: UniformProductItem[];
  };
  onAddItem: (itemId: string, season: "동복" | "하복") => void;
  onRemoveItem: (id: string) => void;
  onUpdateSize: (id: string, size: number) => void;
  onUpdateCustomization: (id: string, customization: string) => void;
  onUpdatePurchaseCount: (id: string, delta: number) => void;
}

const SizeSection = ({
  season,
  setSeason,
  uniformSizeItems,
  uniformProductsByCategory,
  onAddItem,
  onRemoveItem,
  onUpdateSize,
  onUpdateCustomization,
  onUpdatePurchaseCount,
}: SizeSectionProps) => {
  // 현재 시즌의 아이템들을 품목별로 그룹화
  const groupedItems = uniformSizeItems
    .filter((item) => item.season === season)
    .reduce(
      (acc, item) => {
        if (!acc[item.itemId]) {
          acc[item.itemId] = [];
        }
        acc[item.itemId].push(item);
        return acc;
      },
      {} as Record<string, UniformSizeItem[]>
    );

  // API 응답 데이터 사용
  const availableProducts = uniformProductsByCategory[season];

  // 모든 품목 목록 (순서 유지를 위해)
  const allItemIds = availableProducts.map((item) => item.id);

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
        const baseItem = availableProducts.find((i) => i.id === itemId);
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

              // selectable_with로 연결된 품목들의 구입개수 합계 계산
              let sharedPurchaseCount = totalPurchaseCount;
              if (
                "selectableWith" in baseItem &&
                baseItem.selectableWith &&
                baseItem.selectableWith.length > 0
              ) {
                // 연결된 다른 품목들의 구입개수도 합산
                baseItem.selectableWith.forEach((linkedName) => {
                  const linkedItems = uniformSizeItems.filter(
                    (i) => i.season === season && i.name.includes(linkedName)
                  );
                  linkedItems.forEach((linkedItem) => {
                    sharedPurchaseCount += linkedItem.purchaseCount;
                  });
                });
              }

              // 총 개수 = 지원개수 + 구입개수 합계 (selectable_with 공유 포함)
              const totalCount = baseItem.provided + sharedPurchaseCount;

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
                    <div className="flex flex-col">
                      <span className="font-medium">{item.name}</span>
                      {index === 0 &&
                        "selectableWith" in baseItem &&
                        baseItem.selectableWith &&
                        baseItem.selectableWith.length > 0 && (
                          <span className="text-xs text-gray-500">
                            ({baseItem.selectableWith.join(", ")}와 호환 가능)
                          </span>
                        )}
                    </div>
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

                  {/* 맞춤 정보 입력 */}
                  <div className="text-center">
                    {item.isCustomizationRequired === false ? (
                      <span className="text-gray-400">-</span>
                    ) : (
                      <input
                        type="text"
                        value={item.customization}
                        onChange={(e) =>
                          onUpdateCustomization(item.id, e.target.value)
                        }
                        placeholder={isPants ? "예: 34 3/4" : "맞춤 정보"}
                        className="w-full text-xs text-center border rounded px-2 py-1 border-gray-300"
                      />
                    )}
                  </div>

                  {/* 지원개수 */}
                  <div className="text-center">
                    {index === 0 ? (
                      <div className="flex flex-col items-center">
                        <span className="font-medium">{baseItem.provided}</span>
                        {"selectableWith" in baseItem &&
                          baseItem.selectableWith &&
                          baseItem.selectableWith.length > 0 && (
                            <span className="text-xs text-blue-600">
                              (공유)
                            </span>
                          )}
                      </div>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
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
  itemCounts: Record<string, number>;
  setItemCounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

const SupplySection = ({
  items,
  itemCounts,
  setItemCounts,
}: SupplySectionProps) => {
  const updateCount = (itemId: string, delta: number) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) + delta),
    }));
  };

  return (
    <div className="border-b-8 border-black/5 p-6">
      <p className="text-xs text-gray-600 pb-3.5">용품</p>

      {/* 헤더 (6열로 변경: 품목, 가격, 종류, 사이즈, 구입개수, 시즌) */}
      <div className="grid grid-cols-6 gap-2 text-xs text-center font-semibold bg-gray-50 py-2 rounded">
        {["품목", "가격", "종류", "사이즈", "구입개수", "시즌"].map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      {/* 용품 리스트 - API에서 받아온 supply_items를 모두 표시 */}
      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          용품 정보가 없습니다.
        </div>
      ) : (
        items.map((item) => {
          const purchaseCount = itemCounts[item.id] || 0;

          return (
            <div
              key={item.id}
              className="grid grid-cols-6 gap-2 py-3 text-sm border-b items-center hover:bg-gray-50"
            >
              {/* 품목 */}
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.name}</span>
              </div>

              {/* 가격 */}
              <div className="text-xs text-gray-500 text-center">
                {item.price ? `${item.price.toLocaleString()}원` : "-"}
              </div>

              {/* 종류 */}
              <div className="text-center">
                <span className="text-xs text-gray-700">{item.category}</span>
              </div>

              {/* 사이즈 */}
              <div className="text-center">
                <span className="text-xs text-gray-700">{item.size}</span>
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

              {/* 시즌 */}
              <div className="text-center">
                <span className="text-xs text-gray-600">
                  {item.season === "all" ? "전체" :
                   item.season === "winter" ? "동복" :
                   item.season === "summer" ? "하복" : item.season || "-"}
                </span>
              </div>
            </div>
          );
        })
      )}
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

const SignatureCanvas = ({
  signature,
  setSignature,
}: {
  signature: string;
  setSignature: (signature: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // 캔버스 초기화 (최초 1회만)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스를 표시되는 크기와 동일하게 설정
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 초기화
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // 서명 로드 (signature가 변경될 때)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (signature && signature.startsWith("data:image")) {
      // 기존 서명이 있으면 로드
      const img = new Image();
      img.onload = () => {
        // 캔버스를 지우고 이미지 그리기
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // 그리기 스타일 재설정
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      };
      img.src = signature;
    } else if (signature === "") {
      // 서명이 비어있으면 캔버스 지우기
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // 그리기 스타일 재설정
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
  }, [signature]);

  const getScaledCoordinates = (
    canvas: HTMLCanvasElement,
    clientX: number,
    clientY: number
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getScaledCoordinates(canvas, e.clientX, e.clientY);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const coords = getScaledCoordinates(canvas, e.clientX, e.clientY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 캔버스를 base64로 변환
    const base64 = canvas.toDataURL("image/png");
    setSignature(base64);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스를 지우고 다시 초기화
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 그리기 스타일 재설정
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    setSignature("");
  };

  // 터치 이벤트 처리
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const touch = e.touches[0];
    const coords = getScaledCoordinates(canvas, touch.clientX, touch.clientY);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const touch = e.touches[0];
    const coords = getScaledCoordinates(canvas, touch.clientX, touch.clientY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  return (
    <div className="space-y-2">
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[200px] bg-white cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
      </div>
      <button
        type="button"
        onClick={clearCanvas}
        className="w-full py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        서명 지우기
      </button>
    </div>
  );
};

const ConfirmedDataView = ({
  uniformSizeItems,
  supplyItems,
  itemCounts,
}: ConfirmedDataViewProps) => {
  // 시즌별로 그룹화
  const groupedBySeason = uniformSizeItems.reduce(
    (acc, item) => {
      if (!acc[item.season]) {
        acc[item.season] = [];
      }
      acc[item.season].push(item);
      return acc;
    },
    {} as Record<"동복" | "하복", UniformSizeItem[]>
  );

  return (
    <div className="border-b-8 border-black/5 p-6">
      <p className="text-xs text-gray-600 pb-3.5">확정 내용</p>

      {/* 교복 확정 내용 */}
      {(["동복", "하복"] as const).map((season) => {
        const items = groupedBySeason[season] || [];
        if (items.length === 0) return null;

        // 시즌별 총 금액 계산
        const totalAmount = items.reduce((sum, item) => {
          const itemPrice = item.price || 0;
          const itemPurchaseCount = item.purchaseCount || 0;
          return sum + itemPrice * itemPurchaseCount;
        }, 0);

        return (
          <div key={season} className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold">교복 ({season})</h3>
              <p className="text-sm font-semibold text-blue-600">
                {season} 총 금액: {totalAmount.toLocaleString()}원
              </p>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">품목</th>
                    <th className="py-2 px-3 text-center">가격</th>
                    <th className="py-2 px-3 text-center">선택 사이즈</th>
                    <th className="py-2 px-3 text-center">맞춤 정보</th>
                    <th className="py-2 px-3 text-center">지원개수</th>
                    <th className="py-2 px-3 text-center">추가개수</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    return (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="py-2 px-3 font-medium">{item.name}</td>
                        <td className="py-2 px-3 text-center text-xs text-gray-600">
                          {(item.price || 0).toLocaleString()}원
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.selectedSize}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.customization || "-"}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold">
                          {item.freeQuantity || 0}
                        </td>
                        <td className="py-2 px-3 text-center font-semibold text-blue-600">
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

const CustomizationRequiredModal = ({
  isOpen,
  missingItems,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  missingItems: string[];
  onClose: () => void;
  onConfirm: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* 모달 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 z-60"
        onClick={onClose}
      />
      {/* 모달 컨텐츠 */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 z-70 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-yellow-600">
          맞춤 정보 누락
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          다음 품목의 맞춤 정보가 입력되지 않았습니다:
        </p>
        <ul className="list-disc list-inside mb-6 text-sm text-gray-600 space-y-1">
          {missingItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            맞춤 정보 입력하기
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            확인 후 진행
          </button>
        </div>
      </div>
    </>
  );
};
