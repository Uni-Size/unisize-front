"use client";

import { useState, useEffect } from "react";
import { updateStaffOrder } from "@/api/staff";
import { useUniformItems } from "../hooks/useUniformItems";
import { useSupplyItems } from "../hooks/useSupplyItems";
import { useMeasurementData } from "../hooks/useMeasurementData";
import type { EditOrderSheetProps } from "./MeasurementSheetTypes";
import {
  StudentInfo,
  MeasurementInfo,
  SizeSection,
  SupplySection,
  CustomizationRequiredModal,
} from "./MeasurementSheetCommon";
import {
  isAfterDeadline,
  transformUniformProducts,
  findMissingCustomizationItems,
} from "../utils/measurementSheetUtils";
import {
  saveMeasurementSession,
  loadMeasurementSession,
  clearMeasurementSession,
} from "../utils/sessionStorage";

export default function EditOrderSheet({
  setIsMeasurementSheetOpen,
  studentId,
  measurementData,
  selectedStudent,
  onSuccess,
  orderId,
  schoolDeadline,
}: EditOrderSheetProps) {
  // 세션 데이터 로드
  const sessionData = loadMeasurementSession(studentId);

  const [season, setSeason] = useState<"winter" | "summer" | "all">(
    sessionData?.season || "winter"
  );
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [missingCustomizationItems, setMissingCustomizationItems] = useState<
    string[]
  >([]);

  // 실제 사용되는 마감일 문자열
  const actualDeadline = measurementData?.school_deadline || schoolDeadline;

  // recommended_uniforms 데이터를 표시 형식으로 변환
  const uniformProductsByCategory = transformUniformProducts(measurementData);

  // 커스텀 훅으로 상태 관리 분리 (세션 데이터 전달)
  const uniformItems = useUniformItems(uniformProductsByCategory, sessionData);
  const supplyItems = useSupplyItems(measurementData?.supply_items, sessionData);
  const measurementHook = useMeasurementData(
    studentId,
    "edit",
    measurementData,
    selectedStudent
  );

  const { studentData, isLoading } = measurementHook;

  // 세션 자동 저장: 편집 모드에서도 데이터 변경 시 저장
  useEffect(() => {
    if (uniformItems.uniformSizeItems.length > 0) {
      saveMeasurementSession(studentId, {
        mode: "edit",
        orderId,
        uniformItems: uniformItems.uniformSizeItems.map((item) => ({
          itemId: item.itemId,
          productId: item.productId,
          name: item.name,
          season: item.season,
          selectedSize: item.selectedSize,
          customization: item.customization,
          purchaseCount: item.purchaseCount,
          freeQuantity: item.freeQuantity,
          isCustomizationRequired: item.isCustomizationRequired,
        })),
        supplyItems: supplyItems.supplyItems.map((item) => ({
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          category: item.category,
          size: item.size,
        })),
        supplyItemCounts: supplyItems.itemCounts,
        season,
      });
    }
  }, [
    studentId,
    orderId,
    uniformItems.uniformSizeItems,
    supplyItems.supplyItems,
    supplyItems.itemCounts,
    season,
  ]);

  const submitMeasurementData = async () => {
    // supplyItems와 itemCounts를 변환
    const supply_items_base = supplyItems.supplyItems
      .filter((item) => item.product_id !== undefined)
      .map((item) => ({
        item_id: item.product_id!,
        name: item.name,
        selected_size: item.size,
        purchase_count: supplyItems.itemCounts[item.id] || 0,
      }))
      .filter((item) => item.purchase_count > 0);

    try {
      // edit 모드이고 수정 가능한 경우 updateStaffOrder 호출
      const uniform_items = uniformItems.uniformSizeItems.map((item) => ({
        item_id: item.productId || 0,
        name: item.name,
        season: item.season,
        selected_size: item.selectedSize,
        customization: item.customization || " ",
        purchase_count: item.purchaseCount,
      }));

      await updateStaffOrder(orderId, {
        uniform_items,
        supply_items: supply_items_base,
      });

      // 세션 삭제
      clearMeasurementSession(studentId);
      // 성공 시 시트 닫기 및 리스트 재조회
      setIsMeasurementSheetOpen(false);
      onSuccess?.();
      alert("주문이 성공적으로 수정되었습니다.");
    } catch (error: unknown) {
      // 에러 응답에서 message 추출
      const errorMessage =
        (error as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message || "주문 수정에 실패했습니다.";
      throw new Error(errorMessage);
    }
  };

  const onCompleteMeasurement = async () => {
    try {
      // 맞춤 정보 검증
      const itemsMissingCustomization = findMissingCustomizationItems(
        uniformItems.uniformSizeItems
      );

      // 맞춤 정보가 없는 품목이 있으면 모달 표시
      if (itemsMissingCustomization.length > 0) {
        setMissingCustomizationItems(itemsMissingCustomization);
        setShowCustomizationModal(true);
        return;
      }

      // 맞춤 정보가 모두 있으면 바로 제출
      await submitMeasurementData();
    } catch (error: unknown) {
      console.error("주문 수정 실패:", error);
      const errorMessage =
        (error as { message?: string })?.message ||
        "주문 수정에 실패했습니다. 다시 시도해주세요.";
      alert(errorMessage);
    }
  };

  const onConfirmWithoutCustomization = async () => {
    try {
      setShowCustomizationModal(false);
      await submitMeasurementData();
    } catch (error: unknown) {
      console.error("주문 수정 실패:", error);
      const errorMessage =
        (error as { message?: string })?.message ||
        "주문 수정에 실패했습니다. 다시 시도해주세요.";
      alert(errorMessage);
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

        {isAfterDeadline(actualDeadline) ? (
          <div className="p-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-2">
                수정 불가 안내
              </p>
              <p className="text-sm text-yellow-700">
                마감일({actualDeadline})이 지나 더 이상 수정할 수 없습니다.
                <br />
                변경이 필요한 경우 관리자에게 문의해주세요.
              </p>
            </div>
          </div>
        ) : (
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
              onAddSameItem={supplyItems.addSameItem}
              onRemoveItem={supplyItems.removeItem}
              onUpdateItem={supplyItems.updateItem}
            />

            <div className="p-6">
              <button
                onClick={onCompleteMeasurement}
                className="w-full py-3 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
              >
                수정 완료
              </button>
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
