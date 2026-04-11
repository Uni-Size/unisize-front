import React, { useState, useEffect } from "react";
import { Modal, Select } from "@components/atoms";
import { GENDER_OPTIONS_MF } from "@/constants/gender";

// ============================================================================
// 타입 정의
// ============================================================================

export interface UniformItem {
  id: string;
  name: string;
  size: string;
  supportedQuantity: number;
  additionalQuantity: number;
  repair: string;
  reservation: boolean;
  received: boolean;
  nameTag: number | null;
  isDeleted?: boolean;
}

export interface SupplyItem {
  id: string;
  category: string;
  name: string;
  size: string;
  quantity: number;
}

export interface NameTagInfo {
  orderQuantity: number;
  attachQuantity: number;
}

export interface HistoryItem {
  date: string;
  content: string;
}

export interface OrderSnapshot {
  orderId: number;
  date: string;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  history: HistoryItem[];
  modifiedDate?: string;
}

export interface StudentDetailData {
  id: string;
  orderId?: number; // 선택된 주문 ID (수정 API 호출용)
  admissionSchool: string;
  previousSchool: string;
  classNumber: string;
  name: string;
  gender: string;
  studentPhone?: string;
  guardianPhone?: string;
  registeredDate?: string; // 학생 created_at
  modifiedDate?: string; // 주문 last_modified_date
  orderSnapshots?: OrderSnapshot[]; // 전체 주문 탭 데이터
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  supplies: SupplyItem[];
  nameTag: NameTagInfo;
  history?: HistoryItem[];
}

export interface StudentFormInput {
  admissionSchool: string;
  previousSchool: string;
  classNumber: string;
  name: string;
  gender: string;
  studentPhone: string;
  guardianPhone: string;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  supplies: SupplyItem[];
  nameTag: NameTagInfo;
}

export interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  student?: StudentDetailData | null;
  onSubmit?: (data: StudentFormInput) => void;
  onEditSave?: (orderId: number, data: StudentFormInput) => void;
}

// ============================================================================
// 옵션 데이터
// ============================================================================

const genderOptions = GENDER_OPTIONS_MF;

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

const defaultSupplies: SupplyItem[] = [
  {
    id: "supply-1",
    category: "교복 먼티",
    name: "검정 교복 먼티",
    size: "",
    quantity: 0,
  },
  {
    id: "supply-2",
    category: "교복 먼티",
    name: "흰색 교복 먼티",
    size: "",
    quantity: 0,
  },
  { id: "supply-3", category: "스타킹", name: "살색", size: "", quantity: 0 },
  { id: "supply-4", category: "스타킹", name: "유발", size: "", quantity: 0 },
  { id: "supply-5", category: "스타킹", name: "무발", size: "", quantity: 0 },
  { id: "supply-6", category: "스타킹", name: "기모", size: "", quantity: 0 },
  { id: "supply-7", category: "", name: "속바지", size: "", quantity: 0 },
];

// ============================================================================
// 컴포넌트
// ============================================================================

export const StudentModal = ({
  isOpen,
  onClose,
  mode,
  student,
  onSubmit,
  onEditSave,
}: StudentModalProps) => {
  // view 모드에서 수정 버튼 클릭 시 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const isView = mode === "view" && !isEditing;

  // 학생 정보 폼 state
  const [admissionSchool, setAdmissionSchool] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // 교복 state
  const [winterUniforms, setWinterUniforms] = useState<UniformItem[]>([]);
  const [summerUniforms, setSummerUniforms] = useState<UniformItem[]>([]);

  // 용품 state
  const [supplies, setSupplies] = useState<SupplyItem[]>(defaultSupplies);

  // 명찰 state
  const [nameTag, setNameTag] = useState<NameTagInfo>({
    orderQuantity: 0,
    attachQuantity: 0,
  });

  // view 모드: 활성 날짜 탭
  const [activeDateIndex, setActiveDateIndex] = useState(0);
  // 현재 선택된 주문 ID (탭 전환 시 변경)
  const [activeOrderId, setActiveOrderId] = useState<number | undefined>(
    undefined,
  );
  // 현재 선택된 주문의 히스토리
  const [activeHistory, setActiveHistory] = useState<HistoryItem[]>([]);

  const applyOrderSnapshot = (snapshot: OrderSnapshot) => {
    setWinterUniforms(snapshot.winterUniforms);
    setSummerUniforms(snapshot.summerUniforms);
    setActiveOrderId(snapshot.orderId);
    setActiveHistory(snapshot.history);
  };

  const handleDateTabClick = (index: number) => {
    if (index === activeDateIndex) return;
    setActiveDateIndex(index);
    const snapshot = student?.orderSnapshots?.[index];
    if (snapshot) {
      applyOrderSnapshot(snapshot);
    }
  };

  // edit/view 모드에서 기존 데이터로 초기화
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && student) {
      setAdmissionSchool(student.admissionSchool ?? "");
      setPreviousSchool(student.previousSchool ?? "");
      setClassNumber(student.classNumber ?? "");
      setName(student.name ?? "");
      setGender(student.gender ?? "");
      setStudentPhone(student.studentPhone ?? "");
      setGuardianPhone(student.guardianPhone ?? "");
      setWinterUniforms(student.winterUniforms);
      setSummerUniforms(student.summerUniforms);
      setSupplies(
        student.supplies.length > 0 ? student.supplies : defaultSupplies,
      );
      setNameTag(student.nameTag);
      setActiveDateIndex(0);
      setActiveOrderId(student.orderId);
      setActiveHistory(student.history ?? []);
      setIsEditing(false);
    }
  }, [mode, student]);

  const resetForm = () => {
    setAdmissionSchool("");
    setPreviousSchool("");
    setClassNumber("");
    setName("");
    setGender("");
    setStudentPhone("");
    setGuardianPhone("");
    setWinterUniforms([]);
    setSummerUniforms([]);
    setSupplies(defaultSupplies.map((s) => ({ ...s, size: "", quantity: 0 })));
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
    setActiveDateIndex(0);
    setActiveHistory([]);
    setIsEditing(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const formData: StudentFormInput = {
      admissionSchool,
      previousSchool,
      classNumber,
      name,
      gender,
      studentPhone,
      guardianPhone,
      winterUniforms,
      summerUniforms,
      supplies,
      nameTag,
    };

    if (isEditing) {
      const targetOrderId = activeOrderId ?? student?.orderId;
      if (targetOrderId) {
        onEditSave?.(targetOrderId, formData);
      }
      // isEditing 모드에서는 저장 후 모달을 닫지 않음 (onEditSave 콜백이 처리)
    } else {
      onSubmit?.(formData);
      handleClose();
    }
  };

  // 교복 아이템 변경
  const handleUniformChange = (
    season: "winter" | "summer",
    itemId: string,
    field: keyof UniformItem,
    value: string | number | boolean,
  ) => {
    const setter = season === "winter" ? setWinterUniforms : setSummerUniforms;
    setter((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  // 교복 아이템 삭제 (삭제 표시)
  const handleUniformDelete = (season: "winter" | "summer", itemId: string) => {
    const setter = season === "winter" ? setWinterUniforms : setSummerUniforms;
    setter((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isDeleted: !item.isDeleted } : item,
      ),
    );
  };

  // 용품 변경
  const handleSupplyChange = (
    itemId: string,
    field: keyof SupplyItem,
    value: string | number,
  ) => {
    setSupplies((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const hasSchool = admissionSchool.trim() !== "";

  const genderLabel = gender === "M" ? "남" : gender === "F" ? "여" : gender;

  // ============================================================================
  // 교복 테이블 렌더링
  // ============================================================================

  const renderUniformTable = (
    title: string,
    items: UniformItem[],
    season: "winter" | "summer",
  ) => (
    <div>
      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-32.5">
              {title}
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-25">
              사이즈
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">
              지원수량
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">
              추가수량
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-20">
              수선
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-15">
              예약
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-15">
              수령
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-15">
              명찰
            </th>
          </tr>
        </thead>
        <tbody>
          {!hasSchool && mode === "add" ? (
            <tr>
              <td colSpan={8} className="text-center p-5 text-sm text-bg-400">
                학교를 먼저 선택해주세요
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center p-5 text-sm text-bg-400">
                {mode === "add"
                  ? "학교를 먼저 선택해주세요"
                  : "데이터가 없습니다"}
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={
                  item.isDeleted ? "bg-red-050 [&_td]:text-red-700" : ""
                }
              >
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle relative">
                  {!isView && item.isDeleted && (
                    <button
                      className="inline-flex items-center justify-center px-2.5 py-1 bg-red-500 border-none rounded text-xs font-medium text-white cursor-pointer mr-2 hover:bg-red-600"
                      onClick={() => handleUniformDelete(season, item.id)}
                    >
                      삭제
                    </button>
                  )}
                  {!isView && !item.isDeleted && mode === "edit" && (
                    <button
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-transparent border border-gray-200 rounded text-sm text-red-700 cursor-pointer p-0 hover:bg-red-050 hover:border-red-700"
                      onClick={() => handleUniformDelete(season, item.id)}
                      title="삭제"
                    >
                      ×
                    </button>
                  )}
                  {item.name}
                </td>
                <td className="p-1 border border-gray-200 text-center text-gray-700 align-middle">
                  {isView ? (
                    <span>{item.size || "-"}</span>
                  ) : (
                    <Select
                      options={sizeOptions}
                      value={item.size}
                      onChange={(value) =>
                        handleUniformChange(season, item.id, "size", value)
                      }
                      fullWidth
                    />
                  )}
                </td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                  {item.supportedQuantity}
                </td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                  {isView ? (
                    <span>{item.additionalQuantity}</span>
                  ) : (
                    <input
                      type="number"
                      className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item.additionalQuantity}
                      onChange={(e) =>
                        handleUniformChange(
                          season,
                          item.id,
                          "additionalQuantity",
                          Number(e.target.value),
                        )
                      }
                      min={0}
                    />
                  )}
                </td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                  {item.repair}
                </td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                  <input
                    type="checkbox"
                    className="w-4.5 h-4.5 accent-primary-900 cursor-pointer"
                    checked={item.reservation}
                    disabled={isView}
                    onChange={(e) =>
                      handleUniformChange(
                        season,
                        item.id,
                        "reservation",
                        e.target.checked,
                      )
                    }
                  />
                </td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                  <input
                    type="checkbox"
                    className="w-4.5 h-4.5 accent-primary-900 cursor-pointer"
                    checked={item.received}
                    disabled={isView}
                    onChange={(e) =>
                      handleUniformChange(
                        season,
                        item.id,
                        "received",
                        e.target.checked,
                      )
                    }
                  />
                </td>
                <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                  {item.nameTag !== null ? item.nameTag : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ============================================================================
  // 용품 테이블 렌더링
  // ============================================================================

  const renderSupplyTable = () => {
    const grouped: { category: string; items: SupplyItem[] }[] = [];
    supplies.forEach((item) => {
      const existing = grouped.find((g) => g.category === item.category);
      if (existing) {
        existing.items.push(item);
      } else {
        grouped.push({ category: item.category, items: [item] });
      }
    });

    return (
      <div className="flex-1">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr>
              <th
                className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap"
                colSpan={2}
              >
                용품
              </th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-25">
                사이즈
              </th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">
                수량
              </th>
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
                  <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                    {item.name}
                  </td>
                  <td className="p-1 border border-gray-200 text-center text-gray-700 align-middle">
                    {isView ? (
                      <span>{item.size || "-"}</span>
                    ) : item.category === "스타킹" ? (
                      <span>-</span>
                    ) : (
                      <Select
                        options={supplySizeOptions}
                        value={item.size}
                        onChange={(value) =>
                          handleSupplyChange(item.id, "size", value)
                        }
                        placeholder="-"
                        fullWidth
                      />
                    )}
                  </td>
                  <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                    {isView ? (
                      <span>{item.quantity}</span>
                    ) : (
                      <input
                        type="number"
                        className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        value={item.quantity}
                        onChange={(e) =>
                          handleSupplyChange(
                            item.id,
                            "quantity",
                            Number(e.target.value),
                          )
                        }
                        min={0}
                      />
                    )}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // 명찰 테이블 렌더링
  // ============================================================================

  const renderNameTagTable = () => (
    <div className="flex-none">
      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead>
          <tr>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap">
              명찰
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">
              주문수량
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">
              부착수량
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
              명찰
            </td>
            <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
              {isView ? (
                <span>{nameTag.orderQuantity}</span>
              ) : (
                <input
                  type="number"
                  className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={nameTag.orderQuantity}
                  onChange={(e) =>
                    setNameTag((prev) => ({
                      ...prev,
                      orderQuantity: Number(e.target.value),
                    }))
                  }
                  min={0}
                />
              )}
            </td>
            <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
              {isView ? (
                <span>{nameTag.attachQuantity}</span>
              ) : (
                <input
                  type="number"
                  className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={nameTag.attachQuantity}
                  onChange={(e) =>
                    setNameTag((prev) => ({
                      ...prev,
                      attachQuantity: Number(e.target.value),
                    }))
                  }
                  min={0}
                />
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ============================================================================
  // 렌더링
  // ============================================================================

  const title =
    mode === "add"
      ? "학생추가"
      : mode === "edit"
        ? "학생수정"
        : student
          ? `${student.admissionSchool} ${student.name}`
          : "학생 상세";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      width={1000}
      titleExtra={
        mode === "view" && !isEditing ? (
          <button
            className="px-5 py-2 bg-yellow-700 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={() => setIsEditing(true)}
          >
            수정
          </button>
        ) : undefined
      }
      actions={
        mode === "view" && !isEditing ? (
          <button
            className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
          >
            닫기
          </button>
        ) : (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={isEditing ? () => setIsEditing(false) : handleClose}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={handleSubmit}
            >
              {mode === "add" ? "추가" : "저장"}
            </button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4 w-full">
        {/* 학생 정보 */}
        <div className="flex flex-col overflow-hidden [&_.input-wrapper]:flex-row [&_.input-wrapper]:items-center [&_.input-wrapper]:w-full [&_.input-wrapper]:gap-0 [&_.input-label]:flex-[0_0_120px] [&_.input-label]:px-4 [&_.input-label]:py-3 [&_.input-label]:text-15 [&_.input-label]:font-medium [&_.input-label]:text-bg-800 [&_.input-label]:bg-bg-050 [&_.input-label]:border-r [&_.input-label]:border-gray-200 [&_.input-label]:mb-0 [&_.input-label]:h-full [&_.input-label]:flex [&_.input-label]:items-center [&_.input]:border-none [&_.input]:rounded-none [&_.input]:h-12 [&_.input:focus]:shadow-none [&_.input:focus]:border-none [&_.select-wrapper]:flex-row [&_.select-wrapper]:items-center [&_.select-wrapper]:w-full [&_.select-wrapper]:gap-0 [&_.select-label]:flex-[0_0_120px] [&_.select-label]:px-4 [&_.select-label]:py-3 [&_.select-label]:text-15 [&_.select-label]:font-medium [&_.select-label]:text-bg-800 [&_.select-label]:bg-bg-050 [&_.select-label]:border-r [&_.select-label]:border-gray-200 [&_.select-label]:mb-0 [&_.select-label]:h-full [&_.select-label]:flex [&_.select-label]:items-center [&_.select]:border-none [&_.select]:rounded-none [&_.select]:h-12">
          <div className="flex items-stretch">
            <div className="flex-1 min-w-0 flex items-center">
              {isView || isEditing ? (
                <ViewField label="입학학교" value={admissionSchool} />
              ) : (
                <EditField label="입학학교">
                  <input
                    className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                    placeholder="입학 학교"
                    value={admissionSchool}
                    onChange={(e) => setAdmissionSchool(e.target.value)}
                  />
                </EditField>
              )}
            </div>
            <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
              <div className="flex-1 flex items-center">
                {isView || isEditing ? (
                  <ViewField label="출신학교" value={previousSchool} />
                ) : (
                  <EditField label="출신학교">
                    <input
                      className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                      placeholder="출신 학교"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                    />
                  </EditField>
                )}
              </div>
              <div className="flex-[0_0_140px] flex items-center">
                {isView || isEditing ? (
                  <ViewField label="반" value={classNumber} />
                ) : (
                  <EditField label="반" labelWidth="70px">
                    <input
                      className="w-20 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                      placeholder="반"
                      value={classNumber}
                      onChange={(e) => setClassNumber(e.target.value)}
                    />
                  </EditField>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="flex-1 min-w-0 flex items-center">
              {isView || isEditing ? (
                <ViewField label="이름" value={name} />
              ) : (
                <EditField label="이름">
                  <input
                    className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                    placeholder="학생이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </EditField>
              )}
            </div>
            <div
              className="flex-[1_1_0%] min-w-0 flex items-center"
              style={{ marginRight: "80px" }}
            >
              {isView || isEditing ? (
                <ViewField label="성별" value={genderLabel} />
              ) : (
                <EditField label="성별">
                  <select
                    className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">성별</option>
                    {genderOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </EditField>
              )}
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="flex-1 min-w-0 flex items-center">
              {isView || isEditing ? (
                <ViewField label="학생 연락처" value={studentPhone} />
              ) : (
                <EditField label="학생 연락처">
                  <input
                    className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                    placeholder="학생연락처"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                  />
                </EditField>
              )}
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="flex-1 min-w-0 flex items-center">
              {isView || isEditing ? (
                <ViewField label="보호자 연락처" value={guardianPhone} />
              ) : (
                <EditField label="보호자 연락처">
                  <input
                    className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                    placeholder="보호자연락처"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                  />
                </EditField>
              )}
            </div>
          </div>
        </div>

        {/* 날짜 탭 + 동복 테이블 */}
        <div className="flex flex-col gap-1">
          {(mode === "view" || isEditing) &&
            student?.orderSnapshots &&
            student.orderSnapshots.length > 0 && (
              <div className="flex gap-3">
                {student.orderSnapshots.map((snapshot, i) => (
                  <button
                    key={snapshot.orderId}
                    className={`text-sm px-1 py-0.5 border-none bg-transparent cursor-pointer ${
                      i === activeDateIndex
                        ? "font-bold text-bg-800"
                        : "text-bg-400"
                    }`}
                    onClick={() => handleDateTabClick(i)}
                  >
                    {snapshot.date}
                  </button>
                ))}
              </div>
            )}
          {renderUniformTable("동복", winterUniforms, "winter")}
        </div>

        {/* 하복 테이블 */}
        {renderUniformTable("하복", summerUniforms, "summer")}

        {/* 용품 & 명찰 */}
        <div className="flex gap-4 items-start">
          {renderSupplyTable()}
          {renderNameTagTable()}
        </div>

        {/* 이력 + 등록일/최종수정일 (view/edit 모드) */}
        {(mode === "view" || isEditing) && (
          <div className="flex justify-between items-end gap-4">
            {/* 이력 */}
            <div className="flex flex-col gap-2 flex-1">
              <div className="flex border-b border-gray-200 pb-1">
                <span className="text-sm font-medium text-bg-800 w-40">
                  날짜
                </span>
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

            {/* 등록일/최종수정일 */}
            {(student?.registeredDate || student?.modifiedDate) && (
              <div className="flex flex-col items-end gap-2 flex-none">
                {student.registeredDate && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-bg-400">등록일</span>
                    <span className="text-xs text-gray-700">
                      {student.registeredDate}
                    </span>
                  </div>
                )}
                {student.modifiedDate && (
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-bg-400">최종 수정일</span>
                    <span className="text-xs text-gray-700">
                      {student.modifiedDate}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// ============================================================================
// read-only 필드 컴포넌트
// ============================================================================

const EditField = ({
  label,
  children,
  labelWidth = "120px",
}: {
  label: string;
  children: React.ReactNode;
  labelWidth?: string;
}) => (
  <div className="flex flex-row items-center w-full">
    <span
      className="flex-none px-4 py-3 text-15 font-medium text-bg-800 bg-bg-050 border-r border-gray-200 h-12 flex items-center"
      style={{ width: labelWidth }}
    >
      {label}
    </span>
    {children}
  </div>
);

const ViewField = ({ label, value }: { label: string; value: string }) => (
  <div className="input-wrapper flex flex-row items-center w-full gap-0">
    <span className="input-label flex-[0_0_120px] px-4 py-3 text-15 font-medium text-bg-800 bg-bg-050 border-r border-gray-200 h-12 flex items-center">
      {label}
    </span>
    <span className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 flex items-center">
      {value || "-"}
    </span>
  </div>
);
