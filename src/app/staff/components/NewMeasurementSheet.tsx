"use client";

import { useState } from "react";
import {
  submitMeasurementOrder,
  type StartMeasurementResponse,
} from "@/api/studentApi";
import { useUniformItems } from "../hooks/useUniformItems";
import { useSupplyItems } from "../hooks/useSupplyItems";
import { useMeasurementData } from "../hooks/useMeasurementData";
import thermalPrinter, { type PrintData } from "@/lib/printer/thermalPrinter";
import PrintConfirmModal from "./PrintConfirmModal";
import PDFShareModal from "./PDFShareModal";
import { PDFGenerationService } from "@/services/pdfService";
import type { NewMeasurementSheetProps, UniformProductItem } from "./MeasurementSheetTypes";
import {
  StudentInfo,
  MeasurementInfo,
  SizeSection,
  SupplySection,
  ConfirmedDataView,
  SignatureCanvas,
  CustomizationRequiredModal,
} from "./MeasurementSheetCommon";

export default function NewMeasurementSheet({
  setIsMeasurementSheetOpen,
  studentId,
  measurementData,
  selectedStudent,
  onSuccess,
  schoolDeadline,
}: NewMeasurementSheetProps) {
  const [season, setSeason] = useState<"winter" | "summer" | "all">("winter");
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [missingCustomizationItems, setMissingCustomizationItems] = useState<
    string[]
  >([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [pdfShareUrl, setPdfShareUrl] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // school_deadline 이후인지 체크
  const isAfterDeadline = () => {
    const deadlineString = measurementData?.school_deadline || schoolDeadline;

    if (!deadlineString) return false;

    // "2025년 12월 31일" 형식을 파싱
    const deadlineMatch = deadlineString.trim().match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (!deadlineMatch) {
      return false;
    }

    const [, year, month, day] = deadlineMatch;

    // 마감일의 끝 시각 (23:59:59.999)
    const deadline = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 23, 59, 59, 999);

    // 현재 시각
    const now = new Date();

    return now > deadline;
  };

  // 실제 사용되는 마감일 문자열
  const actualDeadline = measurementData?.school_deadline || schoolDeadline;

  // recommended_uniforms 데이터를 표시 형식으로 변환
  const uniformProductsByCategory = {
    winter:
      measurementData?.recommended_uniforms?.winter?.map((item) => {
        const availableSizes =
          item.available_sizes.length > 0
            ? item.available_sizes.map((s) => {
                return Number(s.size) || 95;
              })
            : item.recommended_size
            ? [Number(item.recommended_size) || 95]
            : [];

        return {
          id: item.product,
          name: item.product,
          recommendedSize: item.recommended_size,
          availableSizes,
          price: item.price,
          provided: item.supported_quantity,
          quantity: item.quantity,
          selectableWith: item.selectable_with,
          gender: item.gender,
          isCustomizationRequired: item.is_customization_required,
          customization: item.customization,
        };
      }) || [],
    summer:
      measurementData?.recommended_uniforms?.summer?.map((item) => {
        const availableSizes =
          item.available_sizes.length > 0
            ? item.available_sizes.map((s) => {
                return Number(s.size) || 95;
              })
            : item.recommended_size
            ? [Number(item.recommended_size) || 95]
            : [];

        return {
          id: item.product,
          name: item.product,
          recommendedSize: item.recommended_size,
          availableSizes,
          price: item.price,
          provided: item.supported_quantity,
          quantity: item.quantity,
          selectableWith: item.selectable_with,
          gender: item.gender,
          isCustomizationRequired: item.is_customization_required,
          customization: item.customization,
        };
      }) || [],
    all:
      measurementData?.recommended_uniforms?.all?.map((item) => {
        const availableSizes =
          item.available_sizes.length > 0
            ? item.available_sizes.map((s) => {
                return Number(s.size) || 95;
              })
            : item.recommended_size
            ? [Number(item.recommended_size) || 95]
            : [];

        return {
          id: item.product,
          name: item.product,
          recommendedSize: item.recommended_size,
          availableSizes,
          price: item.price,
          provided: item.supported_quantity,
          quantity: item.quantity,
          selectableWith: item.selectable_with,
          gender: item.gender,
          isCustomizationRequired: item.is_customization_required,
          customization: item.customization,
        };
      }) || [],
  };

  // 커스텀 훅으로 상태 관리 분리
  const uniformItems = useUniformItems(uniformProductsByCategory);
  const supplyItems = useSupplyItems(measurementData?.supply_items);
  const measurementHook = useMeasurementData(
    studentId,
    "new",
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
    handleFinalConfirmation,
  } = measurementHook;

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
      // 신규 측정인 경우 submitMeasurementOrder 호출
      const uniform_items = uniformItems.uniformSizeItems.map((item) => ({
        item_id: item.itemId,
        name: item.name,
        season: item.season,
        selected_size: item.selectedSize,
        customization: item.customization || " ",
        purchase_count: item.purchaseCount,
      }));

      await submitMeasurementOrder(studentId, {
        uniform_items,
        supply_items: supply_items_base,
      });

      // 성공 시 측정 완료 상태로 변경
      setIsMeasurementComplete(true);
    } catch (error: unknown) {
      // 에러 응답에서 message 추출
      const errorMessage = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "측정 주문 제출에 실패했습니다.";
      throw new Error(errorMessage);
    }
  };

  const onCompleteMeasurement = async () => {
    try {
      // 맞춤 정보 검증
      const itemsMissingCustomization: string[] = [];

      uniformItems.uniformSizeItems.forEach((item) => {
        if (item.isCustomizationRequired) {
          const hasCustomization =
            item.customization && item.customization.trim().length > 0;

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
    } catch (error: unknown) {
      console.error("측정 주문 제출 실패:", error);
      const errorMessage = (error as { message?: string })?.message || "측정 주문 제출에 실패했습니다. 다시 시도해주세요.";
      alert(errorMessage);
    }
  };

  const onConfirmWithoutCustomization = async () => {
    try {
      setShowCustomizationModal(false);
      await submitMeasurementData();
    } catch (error: unknown) {
      console.error("측정 주문 제출 실패:", error);
      const errorMessage = (error as { message?: string })?.message || "측정 주문 제출에 실패했습니다. 다시 시도해주세요.";
      alert(errorMessage);
    }
  };

  const onFinalConfirmation = async () => {
    try {
      await handleFinalConfirmation();
      // 성공 시 프린트 모달 표시
      setShowPrintModal(true);
    } catch (error) {
      // 에러는 handleFinalConfirmation 내부에서 처리됨
      console.error("최종 확정 처리 중 에러:", error);
    }
  };

  const handlePrintAndClose = async () => {
    if (!studentData) return;

    try {
      // 프린터 연결
      const connected = await thermalPrinter.connect();
      if (!connected) {
        throw new Error("프린터 연결 실패");
      }

      // 프린트 데이터 준비
      const printData: PrintData = {
        schoolName: studentData.school_name,
        studentName: studentData.name,
        studentPhone: studentData.student_phone,
        guardianPhone: studentData.guardian_phone,
        previousSchool: studentData.previous_school,
        admissionYear: studentData.admission_year,
        gender: studentData.gender === "male" ? "남" : "여",
        uniformItems: uniformItems.uniformSizeItems.map((item) => ({
          season: item.season,
          name: item.name,
          size: item.selectedSize,
          customization: item.customization || "",
          quantity: (item.freeQuantity || 0) + item.purchaseCount,
        })),
        supplyItems: supplyItems.supplyItems
          .filter((item) => supplyItems.itemCounts[item.id] > 0)
          .map((item) => ({
            name: item.name,
            size: item.size,
            quantity: supplyItems.itemCounts[item.id],
          })),
      };

      // 프린트 실행
      await thermalPrinter.printReceipt(printData);

      // 프린터 연결 해제
      thermalPrinter.disconnect();

      // 성공 메시지
      alert("송장이 프린트되었습니다.");
    } catch (error) {
      console.error("프린트 오류:", error);
      alert(
        error instanceof Error
          ? error.message
          : "프린트에 실패했습니다. 프린터를 확인해주세요."
      );
    } finally {
      setShowPrintModal(false);
      // 시트 닫기 및 리스트 재조회
      setIsMeasurementSheetOpen(false);
      onSuccess?.();
    }
  };

  const createPDFTemplate = () => {
    if (!studentData) return null;

    // Create temporary container with isolation
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed !important;
      left: -9999px !important;
      top: 0 !important;
      width: 210mm !important;
      visibility: hidden !important;
      pointer-events: none !important;
      z-index: -9999 !important;
    `;
    document.body.appendChild(container);

    // Create PDF template HTML with isolated styles
    const templateHTML = `
      <div style="all: initial; width: 210mm; min-height: 297mm; padding: 20mm; background-color: #ffffff; font-family: Arial, sans-serif; color: #000000; display: block; box-sizing: border-box;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin: 0 0 10px 0;">교복 측정 결과서</h1>
          <p style="font-size: 12px; color: #666; margin: 0;">
            측정일: ${new Date(studentData.measurement_end_at || new Date()).toLocaleDateString("ko-KR")}
          </p>
        </div>

        <!-- Student Info -->
        <section style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">학생 정보</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; width: 25%; font-weight: bold;">학교</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.school_name}</td>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; width: 25%; font-weight: bold;">입학년도</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.admission_year}년 ${studentData.admission_grade}학년</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">이름</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.name}</td>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">성별</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.gender === "M" ? "남" : "여"}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">생년월일</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.birth_date}</td>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">학생 연락처</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.student_phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">보호자 연락처</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.guardian_phone}</td>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">배송 여부</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${studentData.delivery ? "배송" : "매장 수령"}</td>
              </tr>
              ${studentData.delivery ? `<tr>
                <td style="padding: 8px; border: 1px solid #ddd; background-color: #f5f5f5; font-weight: bold;">배송 주소</td>
                <td colspan="3" style="padding: 8px; border: 1px solid #ddd;">${studentData.address}</td>
              </tr>` : ""}
            </tbody>
          </table>
        </section>

        <!-- Body Measurements -->
        <section style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">신체 측정 정보</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; border: 1px solid #ddd;">키</th>
                <th style="padding: 8px; border: 1px solid #ddd;">몸무게</th>
                <th style="padding: 8px; border: 1px solid #ddd;">어깨</th>
                <th style="padding: 8px; border: 1px solid #ddd;">허리</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${studentData.body.height} cm</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${studentData.body.weight} kg</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${studentData.body.shoulder} cm</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${studentData.body.waist} cm</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Uniform Items -->
        ${uniformItems.uniformSizeItems.length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">교복 선택 내역</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; border: 1px solid #ddd;">품목</th>
                <th style="padding: 8px; border: 1px solid #ddd;">계절</th>
                <th style="padding: 8px; border: 1px solid #ddd;">사이즈</th>
                <th style="padding: 8px; border: 1px solid #ddd;">수선 내용</th>
                <th style="padding: 8px; border: 1px solid #ddd;">수량</th>
              </tr>
            </thead>
            <tbody>
              ${uniformItems.uniformSizeItems.map((item) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
                    item.season === "winter" ? "동복" : item.season === "summer" ? "하복" : "사계절"
                  }</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.selectedSize}</td>
                  <td style="padding: 8px; border: 1px solid #ddd;">${item.customization || "-"}</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.purchaseCount}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </section>
        ` : ""}

        <!-- Supply Items -->
        ${supplyItems.supplyItems.filter((item) => supplyItems.itemCounts[item.id] > 0).length > 0 ? `
        <section style="margin-bottom: 25px;">
          <h2 style="font-size: 16px; border-bottom: 2px solid #000; padding-bottom: 5px; margin-bottom: 15px;">용품 선택 내역</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; border: 1px solid #ddd;">품목</th>
                <th style="padding: 8px; border: 1px solid #ddd;">분류</th>
                <th style="padding: 8px; border: 1px solid #ddd;">사이즈</th>
                <th style="padding: 8px; border: 1px solid #ddd;">수량</th>
              </tr>
            </thead>
            <tbody>
              ${supplyItems.supplyItems
                .filter((item) => supplyItems.itemCounts[item.id] > 0)
                .map((item) => `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.category}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.size}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${supplyItems.itemCounts[item.id]}</td>
                  </tr>
                `).join("")}
            </tbody>
          </table>
        </section>
        ` : ""}

        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: center;">
          <p style="margin: 5px 0;">이 문서는 UniSize 시스템에서 자동 생성되었습니다.</p>
          <p style="margin: 5px 0;">문의사항이 있으시면 담당자에게 연락해 주세요.</p>
        </div>
      </div>
    `;

    container.innerHTML = templateHTML;
    return container;
  };

  const handleGeneratePDF = async () => {
    if (!studentData) return;

    setIsGeneratingPDF(true);
    setShowPDFModal(true);

    let container: HTMLDivElement | null = null;

    try {
      // Create temporary PDF template
      container = createPDFTemplate();
      if (!container) throw new Error("PDF 템플릿 생성 실패");

      const templateElement = container.firstElementChild as HTMLElement;

      // Generate filename
      const filename = PDFGenerationService.generateFilename(
        studentData.name,
        studentData.school_name
      );

      // Generate PDF blob
      const pdfBlob = await PDFGenerationService.generatePDFFromElement(
        templateElement
      );

      // 임시: 로컬에 PDF 자동 다운로드
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // 성공 메시지 표시를 위해 가짜 URL 설정
      setPdfShareUrl("local-download-success");
    } catch (error) {
      console.error("PDF 생성 실패:", error);
      alert("PDF 생성에 실패했습니다. 다시 시도해주세요.");
      setPdfShareUrl(null);
    } finally {
      // Cleanup: safely remove temporary container
      if (container) {
        try {
          if (container.parentNode === document.body) {
            document.body.removeChild(container);
          }
        } catch (cleanupError) {
          console.error("Container cleanup error:", cleanupError);
        }
      }
      setIsGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!studentData) return;

    let container: HTMLDivElement | null = null;

    try {
      // Create temporary PDF template
      container = createPDFTemplate();
      if (!container) throw new Error("PDF 템플릿 생성 실패");

      const templateElement = container.firstElementChild as HTMLElement;

      const filename = PDFGenerationService.generateFilename(
        studentData.name,
        studentData.school_name
      );

      await PDFGenerationService.downloadPDF(templateElement, filename);
    } catch (error) {
      console.error("PDF 다운로드 실패:", error);
      alert("PDF 다운로드에 실패했습니다.");
    } finally {
      // Cleanup: safely remove temporary container
      if (container) {
        try {
          if (container.parentNode === document.body) {
            document.body.removeChild(container);
          }
        } catch (cleanupError) {
          console.error("Container cleanup error:", cleanupError);
        }
      }
    }
  };

  const handleSkipPrintAndGeneratePDF = async () => {
    setShowPrintModal(false);
    await handleGeneratePDF();
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

        {isAfterDeadline() ? (
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
        ) : !isMeasurementComplete ? (
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

      {/* 프린트 확인 모달 */}
      <PrintConfirmModal
        isOpen={showPrintModal}
        schoolName={studentData?.school_name || ""}
        studentName={studentData?.name || ""}
        onConfirm={handlePrintAndClose}
        onSkip={handleSkipPrintAndGeneratePDF}
      />

      {/* PDF 공유 모달 */}
      <PDFShareModal
        show={showPDFModal}
        shareUrl={pdfShareUrl}
        onDownload={handleDownloadPDF}
        onClose={() => {
          setShowPDFModal(false);
          // PDF 모달 닫을 때 시트도 닫고 리스트 재조회
          setIsMeasurementSheetOpen(false);
          onSuccess?.();
        }}
        isGenerating={isGeneratingPDF}
      />
    </>
  );
}
