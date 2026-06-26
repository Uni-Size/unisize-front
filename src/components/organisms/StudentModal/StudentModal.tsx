import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Select } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import type { ToastVariant } from "@components/atoms/Toast";
import { GENDER_OPTIONS_MF } from "@/constants/gender";
import { updateStudent } from "@/api/student";
import { getSchoolList } from "@/api/school";
import { formatDate, formatDateTime, toDateInputValue } from "@/utils/dateUtils";
import { formatGender } from "@/utils/genderUtils";

// ============================================================================
// 타입 정의
// ============================================================================

export interface UniformItem {
  id: string;
  productId?: number;
  name: string;
  size: string;
  availableSizes?: string[];
  supportedQuantity: number;
  additionalQuantity: number;
  unitPrice?: number;
  repair: string;
  reservation: boolean;
  received: boolean;
  nameTag: number | null;
  nameTagName?: string;
  nameTagUnitPrice?: number;
  nameTagAttachPrice?: number;
  attachCount: number;
  itemStatus?: string; // 품목별 상태
  seasonCode?: 'W' | 'S' | 'A'; // W=동복 S=하복 A=사계절
  isDeleted?: boolean;
}

export interface AvailableUniform {
  productId: number;
  name: string;
  season: 'winter' | 'summer' | 'all';
  price?: number;
  availableSizes: string[];
}

export interface SupplyItem {
  id: string;
  category: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice?: number;
}

export interface NameTagInfo {
  orderQuantity: number;
  attachQuantity: number;
  unitPrice?: number;
  attachPrice?: number;
}

export interface HistoryItem {
  date: string;
  content: string;
}

export interface OrderSnapshot {
  orderId: number;
  date: string;
  status?: string;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  allUniforms: UniformItem[];
  supplies: SupplyItem[];
  history: HistoryItem[];
  modifiedDate?: string;
  name_tag_service?: {
    available: boolean;
    unit_price: number;
    attach_price: number;
    min_unit: number;
  };
  nameTagName?: string;
}

export interface StudentDetailData {
  id: string;
  orderId?: number; // 선택된 주문 ID (수정 API 호출용)
  admissionSchool: string;
  previousSchool: string;
  name: string;
  gender: string;
  birthDate?: string;
  admissionYear?: number;
  admissionGrade?: number;
  studentPhone?: string;
  guardianPhone?: string;
  address?: string;
  height?: number;
  weight?: number;
  shoulder?: number;
  waist?: number;
  studentType?: string;
  isEligibleForPublicPurchase?: boolean;
  registeredDate?: string; // 학생 created_at
  modifiedDate?: string; // 주문 last_modified_date
  orderSnapshots?: OrderSnapshot[]; // 전체 주문 탭 데이터
  availableUniforms?: AvailableUniform[]; // 학교에 등록된 품목 (편집 시 추가용)
  supportAllowances?: { product_id: number; remaining: number }[]; // 품목별 무상지원 잔여
  nameTagMinUnit?: number;
  nameTagPrice?: number | null;
  nameTagAttachPrice?: number | null;
  nameTagName?: string;
  totalNameTagCount?: number;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  allUniforms: UniformItem[];   // 사계절(A) 품목
  supplies: SupplyItem[];
  nameTag: NameTagInfo;
  history?: HistoryItem[];
  isManuallySupported?: boolean;
  isSupported?: boolean;
}

export interface StudentFormInput {
  admissionSchool: string;
  admissionYear: number | "";
  admissionGrade: number | "";
  previousSchool: string;
  name: string;
  gender: string;
  birthDate: string;
  studentPhone: string;
  guardianPhone: string;
  address: string;
  height: number | "";
  weight: number | "";
  shoulder: number | "";
  waist: number | "";
  orderDate: string;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  allUniforms: UniformItem[];
  supplies: SupplyItem[];
  nameTag: NameTagInfo;
  nameTagName: string;
}

export type OrderStatusValue =
  | 'pending'    // 대기중
  | 'confirmed'  // 확인됨
  | 'preparing'  // 준비중
  | 'ready'      // 준비완료
  | 'receive'    // 수령완료
  | 'complete'   // 완료
  | 'cancelled'; // 취소됨

export interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  student?: StudentDetailData | null;
  onSubmit?: (data: StudentFormInput) => void;
  onEditSave?: (orderId: number, data: StudentFormInput) => void;
  onStudentUpdated?: () => void;
  onPaymentComplete?: (orderId: number) => void;
  onOrderCreate?: (studentId: number, data: StudentFormInput) => Promise<void>;
  onOrderUpdate?: (orderId: number, data: StudentFormInput) => Promise<void>;
  onStatusChange?: (orderId: number, status: OrderStatusValue) => Promise<void>;
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
  onStudentUpdated,
  onPaymentComplete,
  onOrderCreate,
  onOrderUpdate,
  onStatusChange,
}: StudentModalProps) => {
  // view 모드에서 수정 버튼 클릭 시 편집 상태
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isOrderCreateMode, setIsOrderCreateMode] = useState(false);
  const [isOrderEditMode, setIsOrderEditMode] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const isView = mode === "view" && !isEditing && !isOrderCreateMode && !isOrderEditMode;
  // 동복/하복 테이블은 주문 생성/수정 모드에서만 편집 가능
  const isTableEditable = isOrderCreateMode || isOrderEditMode || mode === "add";
  const isTableView = !isTableEditable;
  const hasOrder = !!(student?.orderId || (student?.orderSnapshots && student.orderSnapshots.length > 0));
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  // 학교 검색 state
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [allSchoolNames, setAllSchoolNames] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const schoolDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const schoolInputRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // 학생 정보 폼 state
  const [admissionSchool, setAdmissionSchool] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [admissionYear, setAdmissionYear] = useState<number | "">("");
  const [admissionGrade, setAdmissionGrade] = useState<number | "">("");
  const [studentPhone, setStudentPhone] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [address, setAddress] = useState("");
  const [height, setHeight] = useState<number | "">("");
  const [weight, setWeight] = useState<number | "">("");
  const [shoulder, setShoulder] = useState<number | "">("");
  const [waist, setWaist] = useState<number | "">("");

  // 구입일자 state (edit 모드용, 기본값 오늘)
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 교복 state
  const [winterUniforms, setWinterUniforms] = useState<UniformItem[]>([]);
  const [summerUniforms, setSummerUniforms] = useState<UniformItem[]>([]);
  const [allUniforms, setAllUniforms] = useState<UniformItem[]>([]);

  // 용품 state
  const [supplies, setSupplies] = useState<SupplyItem[]>(defaultSupplies);

  // 명찰 state
  const [nameTag, setNameTag] = useState<NameTagInfo>({
    orderQuantity: 0,
    attachQuantity: 0,
  });
  const [nameTagName, setNameTagName] = useState('');

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
    setAllUniforms(snapshot.allUniforms ?? []);
    setSupplies(snapshot.supplies.length > 0 ? snapshot.supplies : defaultSupplies);
    setActiveOrderId(snapshot.orderId);
    setActiveHistory(snapshot.history);
    const allItems = [
      ...snapshot.winterUniforms,
      ...snapshot.summerUniforms,
      ...(snapshot.allUniforms ?? []),
    ];
    const orderQtyFromItems = allItems.reduce((s, i) => s + (i.nameTag ?? 0), 0);
    setNameTag({
      orderQuantity: orderQtyFromItems > 0 ? orderQtyFromItems : (student?.totalNameTagCount ?? 0),
      attachQuantity: allItems.reduce((s, i) => s + (i.attachCount ?? 0), 0),
      unitPrice: snapshot.name_tag_service?.unit_price,
      attachPrice: snapshot.name_tag_service?.attach_price,
    });
    setNameTagName(snapshot.nameTagName ?? '');
    const date = snapshot.date ? (toDateInputValue(snapshot.date) || snapshot.date.slice(0, 10)) : '';
    if (date) setOrderDate(date);
    // 수정 시 변경 감지를 위해 원본 저장
    originalOrderRef.current = {
      winterUniforms: snapshot.winterUniforms,
      summerUniforms: snapshot.summerUniforms,
      allUniforms: snapshot.allUniforms ?? [],
      supplies: snapshot.supplies,
      orderDate: date,
    };
  };

  const handleDateTabClick = (index: number) => {
    if (index === activeDateIndex) return;
    setActiveDateIndex(index);
    const snapshot = student?.orderSnapshots?.[index];
    if (snapshot) {
      applyOrderSnapshot(snapshot);
    }
  };

  // 편집 시작 시점의 원본 값 (변경 감지용)
  const originalStudentRef = React.useRef<{
    admissionSchool: string; previousSchool: string;
    name: string; gender: string; birthDate: string;
    admissionYear: number | ""; admissionGrade: number | "";
    studentPhone: string; guardianPhone: string; address: string;
    height: number | ""; weight: number | ""; shoulder: number | ""; waist: number | "";
  } | null>(null);
  const originalOrderRef = React.useRef<{
    winterUniforms: UniformItem[]; summerUniforms: UniformItem[]; allUniforms: UniformItem[]; supplies: SupplyItem[]; orderDate: string;
  } | null>(null);

  // 모달 열릴 때 학교 전체 목록 로드
  useEffect(() => {
    if (!isOpen) return;
    getSchoolList().then((res) => {
      setAllSchoolNames(res.schools.map((s) => s.school_name));
    }).catch(() => {});
  }, [isOpen]);

  // 입학학교 디바운스 검색
  const handleAdmissionSchoolChange = useCallback((value: string) => {
    setAdmissionSchool(value);
    if (schoolDebounceRef.current) clearTimeout(schoolDebounceRef.current);
    if (!value.trim()) {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    schoolDebounceRef.current = setTimeout(() => {
      const lower = value.toLowerCase();
      const matched = allSchoolNames.filter((n) => n.toLowerCase().includes(lower)).slice(0, 8);
      setSchoolSuggestions(matched);
      setShowSuggestions(matched.length > 0);
    }, 200);
  }, [allSchoolNames]);

  const handleSchoolSelect = (name: string) => {
    setAdmissionSchool(name);
    setShowSuggestions(false);
    setSchoolSuggestions([]);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        schoolInputRef.current && !schoolInputRef.current.contains(e.target as Node) &&
        suggestionRef.current && !suggestionRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // edit/view 모드에서 기존 데이터로 초기화
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && student) {
      const sPhone = student.studentPhone ?? "";
      const gPhone = student.guardianPhone ?? "";
      const aSchool = student.admissionSchool ?? "";
      const pSchool = student.previousSchool ?? "";
      const n = student.name ?? "";
      const g = student.gender ?? "";
      const bd = student.birthDate ?? "";
      const ay: number | "" = student.admissionYear ?? "";
      const ag: number | "" = student.admissionGrade ?? "";
      const addr = student.address ?? "";
      const h: number | "" = student.height ?? "";
      const w: number | "" = student.weight ?? "";
      const sh: number | "" = student.shoulder ?? "";
      const ws: number | "" = student.waist ?? "";

      setAdmissionSchool(aSchool);
      setPreviousSchool(pSchool);
      setName(n);
      setGender(g);
      setBirthDate(bd);
      setAdmissionYear(ay);
      setAdmissionGrade(ag);
      setStudentPhone(sPhone);
      setGuardianPhone(gPhone);
      setAddress(addr);
      setHeight(h);
      setWeight(w);
      setShoulder(sh);
      setWaist(ws);
      const initialSupplies = student.supplies.length > 0 ? student.supplies : defaultSupplies;
      setWinterUniforms(student.winterUniforms);
      setSummerUniforms(student.summerUniforms);
      setAllUniforms(student.allUniforms ?? []);
      setSupplies(initialSupplies);
      setNameTag(student.nameTag);
      setNameTagName(student.nameTagName ?? student.orderSnapshots?.[0]?.nameTagName ?? '');
      setActiveDateIndex(0);
      setActiveOrderId(student.orderId);
      setActiveHistory(student.history ?? []);
      const firstSnapshotDate = student.orderSnapshots?.[0]?.date;
      setOrderDate(firstSnapshotDate ? (toDateInputValue(firstSnapshotDate) || firstSnapshotDate.slice(0, 10)) : new Date().toISOString().slice(0, 10));
      setIsEditing(false);
      setIsOrderEditMode(false);

      originalStudentRef.current = { admissionSchool: aSchool, previousSchool: pSchool, name: n, gender: g, birthDate: bd, admissionYear: ay, admissionGrade: ag, studentPhone: sPhone, guardianPhone: gPhone, address: addr, height: h, weight: w, shoulder: sh, waist: ws };
      const firstSnapshotDateForRef = student.orderSnapshots?.[0]?.date;
      const orderDateForRef = firstSnapshotDateForRef ? (toDateInputValue(firstSnapshotDateForRef) || firstSnapshotDateForRef.slice(0, 10)) : new Date().toISOString().slice(0, 10);
      originalOrderRef.current = { winterUniforms: student.winterUniforms, summerUniforms: student.summerUniforms, allUniforms: student.allUniforms ?? [], supplies: initialSupplies, orderDate: orderDateForRef };
    }
  }, [mode, student]);

  const resetForm = () => {
    setAdmissionSchool("");
    setPreviousSchool("");
    setName("");
    setGender("");
    setBirthDate("");
    setAdmissionYear("");
    setAdmissionGrade("");
    setStudentPhone("");
    setGuardianPhone("");
    setAddress("");
    setHeight("");
    setWeight("");
    setShoulder("");
    setWaist("");
    setWinterUniforms([]);
    setSummerUniforms([]);
    setAllUniforms([]);
    setSupplies(defaultSupplies.map((s) => ({ ...s, size: "", quantity: 0 })));
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
    setNameTagName('');
    setActiveDateIndex(0);
    setActiveHistory([]);
    setIsEditing(false);
    setIsOrderCreateMode(false);
    setIsOrderEditMode(false);
  };

  const enterOrderCreateMode = () => {
    setWinterUniforms([]);
    setSummerUniforms([]);
    setAllUniforms([]);
    setSupplies(defaultSupplies.map((s) => ({ ...s, size: "", quantity: 0 })));
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
    setOrderDate(new Date().toISOString().slice(0, 10));
    setIsOrderCreateMode(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const formData: StudentFormInput = {
      admissionSchool,
      admissionYear,
      admissionGrade,
      previousSchool,
      name,
      gender,
      birthDate,
      studentPhone,
      guardianPhone,
      address,
      height,
      weight,
      shoulder,
      waist,
      orderDate,
      winterUniforms,
      summerUniforms,
      allUniforms,
      supplies,
      nameTag,
      nameTagName,
    };

    if (isEditing) {
      const studentId = student?.id ? Number(student.id) : undefined;
      try {
        const orig = originalStudentRef.current;
        const studentChanged = !orig ||
          orig.name !== name || orig.gender !== gender ||
          orig.birthDate !== birthDate || orig.admissionYear !== admissionYear || orig.admissionGrade !== admissionGrade ||
          orig.studentPhone !== studentPhone || orig.guardianPhone !== guardianPhone ||
          orig.address !== address || orig.previousSchool !== previousSchool ||
          orig.admissionSchool !== admissionSchool ||
          orig.height !== height || orig.weight !== weight || orig.shoulder !== shoulder || orig.waist !== waist;

        const origOrder = originalOrderRef.current;
        const orderChanged = !origOrder ||
          JSON.stringify(origOrder.winterUniforms) !== JSON.stringify(winterUniforms) ||
          JSON.stringify(origOrder.summerUniforms) !== JSON.stringify(summerUniforms) ||
          JSON.stringify(origOrder.supplies) !== JSON.stringify(supplies);

        if (!studentChanged && !orderChanged) {
          setToast({ message: '수정된 내용이 없습니다.', variant: 'info' });
          return;
        }

        if (studentId && studentChanged) {
          await updateStudent(studentId, {
            name,
            ...(gender ? { gender } : {}),
            birth_date: birthDate || undefined,
            admission_year: admissionYear !== "" ? admissionYear : undefined,
            admission_grade: admissionGrade !== "" ? admissionGrade : undefined,
            phone: studentPhone,
            parent_phone: guardianPhone,
            address: address || undefined,
            previous_school: previousSchool,
            admission_school: admissionSchool,
            height: height !== "" ? height : undefined,
            weight: weight !== "" ? weight : undefined,
            shoulder: shoulder !== "" ? shoulder : undefined,
            waist: waist !== "" ? waist : undefined,
          });
          onStudentUpdated?.();
        }
        const targetOrderId = activeOrderId ?? student?.orderId;
        if (targetOrderId && orderChanged) {
          onEditSave?.(targetOrderId, formData);
        }
        setToast({ message: '저장되었습니다.', variant: 'success' });
        setIsEditing(false);
      } catch (err) {
        console.error("학생 정보 수정 실패:", err);
        setToast({ message: '저장에 실패했습니다.', variant: 'error' });
      }
    } else if (isOrderEditMode) {
      const orderId = activeOrderId ?? student?.orderId;
      if (!orderId || !onOrderUpdate) return;
      setIsCreatingOrder(true);
      try {
        await onOrderUpdate(orderId, formData);
        setToast({ message: '주문이 수정되었습니다.', variant: 'success' });
        setIsOrderEditMode(false);
      } catch (err) {
        console.error("주문 수정 실패:", err);
        setToast({ message: '주문 수정에 실패했습니다.', variant: 'error' });
      } finally {
        setIsCreatingOrder(false);
      }
    } else if (isOrderCreateMode) {
      const studentId = student?.id ? Number(student.id) : undefined;
      if (!studentId || !onOrderCreate) return;
      setIsCreatingOrder(true);
      try {
        await onOrderCreate(studentId, formData);
        setToast({ message: '주문이 생성되었습니다.', variant: 'success' });
        setIsOrderCreateMode(false);
      } catch (err) {
        console.error("주문 생성 실패:", err);
        setToast({ message: '주문 생성에 실패했습니다.', variant: 'error' });
      } finally {
        setIsCreatingOrder(false);
      }
    } else {
      onSubmit?.(formData);
      handleClose();
    }
  };

  // 교복 아이템 변경
  const handleUniformChange = (
    season: "winter" | "summer" | "all",
    itemId: string,
    field: keyof UniformItem,
    value: string | number | boolean,
  ) => {
    const setter = season === "winter" ? setWinterUniforms : season === "summer" ? setSummerUniforms : setAllUniforms;
    setter((prev) => {
      const next = prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item,
      );

      const allItems = [...winterUniforms, ...summerUniforms, ...allUniforms];
      const others = allItems.filter(i => !next.some(n => n.id === i.id));

      if (field === "nameTag") {
        const total = [...next, ...others].reduce((sum, item) => sum + (item.nameTag ?? 0), 0);
        const unit = student?.nameTagMinUnit ?? 1;
        const ceiled = total === 0 ? 0 : Math.ceil(total / unit) * unit;
        setNameTag((prev) => ({ ...prev, orderQuantity: Math.max(prev.orderQuantity, ceiled) }));
      }

      if (field === "attachCount") {
        const total = [...next, ...others].reduce((sum, item) => sum + (item.attachCount ?? 0), 0);
        setNameTag((prev) => ({ ...prev, attachQuantity: total }));
      }

      return next;
    });
  };

  // 교복 아이템 삭제 (삭제 표시)
  const handleUniformDelete = (season: "winter" | "summer" | "all", itemId: string) => {
    const setter = season === "winter" ? setWinterUniforms : season === "summer" ? setSummerUniforms : setAllUniforms;
    setter((prev) => {
      const target = prev.find(i => i.id === itemId);
      // 새로 추가한 아이템은 즉시 제거, 기존 아이템은 isDeleted 토글
      if (target?.id.startsWith('new_')) {
        return prev.filter(i => i.id !== itemId);
      }
      return prev.map(i => i.id === itemId ? { ...i, isDeleted: !i.isDeleted } : i);
    });
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

  const genderLabel = formatGender(gender);

  // ============================================================================
  // 가격 계산
  // ============================================================================

  const calcUniformSection = (items: UniformItem[]) => {
    let total = 0;
    let supported = 0;
    for (const item of items) {
      if (item.isDeleted || item.unitPrice == null) continue;
      const totalQty = item.supportedQuantity + item.additionalQuantity;
      total += item.unitPrice * totalQty;
      supported += item.unitPrice * item.supportedQuantity;
    }
    return { total, supported, payable: total - supported };
  };

  const winterCalc = calcUniformSection(winterUniforms);
  const summerCalc = calcUniformSection(summerUniforms);
  const allCalc = calcUniformSection(allUniforms);
  const hasPrice = [...winterUniforms, ...summerUniforms, ...allUniforms].some(i => i.unitPrice != null);
  const supplyCalcTotal = supplies.reduce((sum, i) => i.unitPrice != null ? sum + i.unitPrice * i.quantity : sum, 0);
  const hasSupplyPrice = supplies.some(i => i.unitPrice != null);
  const grandTotal = winterCalc.total + summerCalc.total + allCalc.total + supplyCalcTotal;
  const grandSupported = winterCalc.supported + summerCalc.supported + allCalc.supported;
  const grandPayable = grandTotal - grandSupported;

  // ============================================================================
  // 교복 테이블 렌더링
  // ============================================================================

  const renderUniformTable = (
    title: string,
    items: UniformItem[],
    season: "winter" | "summer" | "all",
  ) => {
    const showPrice = hasPrice;
    const sectionTotal = items.reduce((sum, i) => {
      if (i.isDeleted || i.unitPrice == null) return sum;
      return sum + i.unitPrice * (i.supportedQuantity + i.additionalQuantity);
    }, 0);
    const colSpan = showPrice ? 7 : 6;

    return (
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
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-36">
                지원+추가=총개수
              </th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-20">
                부착/명찰
              </th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-36">
                수선
              </th>
              {showPrice && (
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">
                  금액
                </th>
              )}
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-20">
                품목상태
              </th>
            </tr>
          </thead>
          <tbody>
            {!hasSchool && mode === "add" ? (
              <tr>
                <td colSpan={colSpan} className="text-center p-5 text-sm text-bg-400">
                  학교를 먼저 선택해주세요
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="text-center p-5 text-sm text-bg-400">
                  {mode === "add" ? "학교를 먼저 선택해주세요" : "데이터가 없습니다"}
                </td>
              </tr>
            ) : (
              <>
                {items.map((item) => {
                  const totalQty = item.supportedQuantity + item.additionalQuantity;
                  const rowTotal = item.unitPrice != null ? item.unitPrice * totalQty : null;
                  return (
                    <tr
                      key={item.id}
                      className={item.isDeleted ? "bg-red-050 [&_td]:text-red-700" : ""}
                    >
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle relative">
                        {!isTableView && item.isDeleted && (
                          <button
                            className="inline-flex items-center justify-center px-2.5 py-1 bg-red-500 border-none rounded text-xs font-medium text-white cursor-pointer mr-2 hover:bg-red-600"
                            onClick={() => handleUniformDelete(season, item.id)}
                          >
                            삭제
                          </button>
                        )}
                        {!isTableView && !item.isDeleted && (mode === "edit" || isOrderEditMode || isOrderCreateMode) && (
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
                        {isTableView ? (
                          <span>{item.size || "-"}</span>
                        ) : (
                          <Select
                            options={(() => {
                              // availableUniforms에서 productId로 전체 사이즈 목록 우선 사용
                              const fromCatalog = item.productId != null
                                ? (student?.availableUniforms ?? []).find(u => u.productId === item.productId)?.availableSizes
                                : undefined;
                              const base = (fromCatalog && fromCatalog.length > 0)
                                ? fromCatalog
                                : (item.availableSizes && item.availableSizes.length > 0)
                                  ? item.availableSizes
                                  : item.size ? [item.size] : [];
                              // 현재 선택된 사이즈가 목록에 없으면 추가
                              const all = item.size && !base.includes(item.size) ? [...base, item.size] : base;
                              return [...new Set(all)]
                                .sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
                                .map(s => ({ value: s, label: s }));
                            })()}
                            value={item.size}
                            onChange={(value) => handleUniformChange(season, item.id, "size", value)}
                            fullWidth
                          />
                        )}
                      </td>
                      {/* 지원+추가=총개수 */}
                      <td className="p-1 border border-gray-200 text-center text-gray-700 align-middle">
                        <div className="flex items-center justify-center gap-0.5 text-sm">
                          <span className="text-gray-400 tabular-nums">{item.supportedQuantity}</span>
                          <span className="text-gray-300 text-xs">+</span>
                          {isTableView ? (
                            <span className="tabular-nums">{item.additionalQuantity}</span>
                          ) : (
                            <input
                              type="number"
                              className="w-10 px-1 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={item.additionalQuantity}
                              onChange={(e) => handleUniformChange(season, item.id, "additionalQuantity", Math.max(0, Number(e.target.value)))}
                              min={0}
                            />
                          )}
                          <span className="text-gray-300 text-xs">=</span>
                          <span className="font-medium tabular-nums">{totalQty}</span>
                        </div>
                      </td>
                      {/* 부착/명찰 */}
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {isTableView ? (
                          <span className="text-xs">
                            {item.attachCount > 0 || (item.nameTag ?? 0) > 0
                              ? `${item.attachCount} / ${item.nameTag ?? 0}`
                              : "-"}
                          </span>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <input
                              type="number"
                              className="w-8 px-1 py-0.5 border border-gray-200 rounded text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={item.attachCount}
                              min={0}
                              max={totalQty}
                              onChange={(e) => handleUniformChange(season, item.id, "attachCount", Number(e.target.value))}
                            />
                            <span className="text-gray-400">/</span>
                            <input
                              type="number"
                              className="w-8 px-1 py-0.5 border border-gray-200 rounded text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              value={item.nameTag ?? 0}
                              min={0}
                              max={totalQty}
                              onChange={(e) => handleUniformChange(season, item.id, "nameTag", Number(e.target.value))}
                            />
                          </div>
                        )}
                      </td>
                      {/* 수선 */}
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {isTableView ? (
                          <span>{item.repair || "-"}</span>
                        ) : (
                          <input
                            type="text"
                            className="w-full px-2 py-1 border border-gray-200 rounded text-sm text-gray-700 bg-white outline-none focus:border-primary-900"
                            value={item.repair}
                            placeholder="수선 내용"
                            onChange={(e) => handleUniformChange(season, item.id, "repair", e.target.value)}
                          />
                        )}
                      </td>
                      {/* 금액: 단가 > 총액 */}
                      {showPrice && (
                        <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                          {item.unitPrice != null ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-gray-400 text-xs">{item.unitPrice.toLocaleString()}원</span>
                              <span className="text-sm font-medium">{rowTotal!.toLocaleString()}원</span>
                            </div>
                          ) : "-"}
                        </td>
                      )}
                      {/* 품목별 상태 */}
                      <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                        {isTableView ? (
                          <span className="text-xs">{({
                            pending: '출고 대기', out_of_stock: '재고 부족', reserved: '예약',
                            shipped: '출고 완료', delivered: '배송 완료', receipt: '수령 완료', cancelled: '취소됨',
                          } as Record<string, string>)[item.itemStatus ?? ''] ?? item.itemStatus ?? '-'}</span>
                        ) : (
                          <select
                            className="w-full px-1 py-0.5 text-xs border border-gray-200 rounded outline-none focus:border-primary-900 text-gray-700 bg-white"
                            value={item.itemStatus ?? ""}
                            onChange={(e) => handleUniformChange(season, item.id, "itemStatus", e.target.value)}
                          >
                            <option value="">-</option>
                            <option value="pending">출고 대기</option>
                            <option value="out_of_stock">재고 부족</option>
                            <option value="reserved">예약</option>
                            <option value="shipped">출고 완료</option>
                            <option value="delivered">배송 완료</option>
                            <option value="receipt">수령 완료</option>
                            <option value="cancelled">취소됨</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {(isEditing || isOrderCreateMode || isOrderEditMode) && (() => {
                  const usedIds = new Set(items.filter(i => !i.isDeleted && i.productId != null).map(i => i.productId));
                  const addable = (student?.availableUniforms ?? []).filter(
                    (u) => (u.season === season || u.season === 'all') && !usedIds.has(u.productId),
                  );
                  if (addable.length === 0) return null;
                  return (
                    <tr>
                      <td colSpan={colSpan} className="p-1 border border-gray-200">
                        <select
                          className="w-full px-2 py-1.5 border-none bg-transparent text-sm text-blue-600 outline-none cursor-pointer"
                          value=""
                          onChange={(e) => {
                            const found = addable.find((u) => String(u.productId) === e.target.value);
                            if (!found) return;
                            const allowance = student?.supportAllowances?.find((a) => a.product_id === found.productId);
                            const supportedQty = allowance?.remaining ?? 0;
                            const newItem: UniformItem = {
                              id: `new_${found.productId}_${Date.now()}`,
                              productId: found.productId,
                              name: found.name,
                              size: '',
                              availableSizes: found.availableSizes,
                              supportedQuantity: supportedQty,
                              additionalQuantity: supportedQty > 0 ? 0 : 1,
                              unitPrice: found.price,
                              repair: '',
                              reservation: false,
                              received: false,
                              nameTag: 0,
                              attachCount: 0,
                            };
                            if (season === 'winter') {
                              setWinterUniforms((prev) => [...prev, { ...newItem, seasonCode: 'W' }]);
                            } else if (season === 'summer') {
                              setSummerUniforms((prev) => [...prev, { ...newItem, seasonCode: 'S' }]);
                            } else {
                              setAllUniforms((prev) => [...prev, { ...newItem, seasonCode: 'A' }]);
                            }
                          }}
                        >
                          <option value="">+ 품목 추가</option>
                          {addable.map((u) => (
                            <option key={u.productId} value={String(u.productId)}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })()}
                {showPrice && (
                  <tr className="bg-bg-050 font-medium">
                    <td colSpan={5} className="px-3 py-2 border border-gray-200 text-right text-bg-700">
                      소계
                    </td>
                    <td className="px-3 py-2 border border-gray-200 text-right text-gray-900 tabular-nums">
                      {sectionTotal.toLocaleString()}원
                    </td>
                    <td className="border border-gray-200" />
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

    const showPrice = supplies.some(i => i.unitPrice != null);
    const supplyTotal = supplies.reduce((sum, i) => {
      if (i.unitPrice == null) return sum;
      return sum + i.unitPrice * i.quantity;
    }, 0);

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
              {showPrice && (
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-22">
                  단가
                </th>
              )}
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-25">
                사이즈
              </th>
              <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-17.5">
                수량
              </th>
              {showPrice && (
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">
                  총금액
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) =>
              group.items.map((item, idx) => {
                return (
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
                    {showPrice && (
                      <td className="p-2 border border-gray-200 text-right text-gray-500 align-middle tabular-nums pr-3">
                        {item.unitPrice != null ? `${item.unitPrice.toLocaleString()}원` : "-"}
                      </td>
                    )}
                    <td className="p-1 border border-gray-200 text-center text-gray-700 align-middle">
                      {(isView || isOrderCreateMode || isOrderEditMode) ? (
                        <span>{item.size || "-"}</span>
                      ) : item.category === "스타킹" ? (
                        <span>-</span>
                      ) : (
                        <Select
                          options={supplySizeOptions}
                          value={item.size}
                          onChange={(value) => handleSupplyChange(item.id, "size", value)}
                          placeholder="-"
                          fullWidth
                        />
                      )}
                    </td>
                    <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
                      {(isView || isOrderCreateMode || isOrderEditMode) ? (
                        <span>{item.quantity}</span>
                      ) : (
                        <input
                          type="number"
                          className="w-12.5 px-2 py-1 border border-gray-200 rounded text-sm text-center text-gray-700 bg-white outline-none focus:border-primary-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.quantity}
                          onChange={(e) => handleSupplyChange(item.id, "quantity", Number(e.target.value))}
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
                );
              })
            )}
            {showPrice && supplyTotal > 0 && (
              <tr className="bg-bg-050 font-medium">
                <td colSpan={4} className="px-3 py-2 border border-gray-200 text-right text-bg-700">
                  소계
                </td>
                <td className="px-3 py-2 border border-gray-200 text-center text-gray-700" />
                <td className="px-3 py-2 border border-gray-200 text-right text-gray-900 tabular-nums">
                  {supplyTotal.toLocaleString()}원
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // 명찰 테이블 렌더링
  // ============================================================================

  const renderNameTagTable = () => {
    const minUnit = student?.nameTagMinUnit ?? 1;
    const nameTagPrice = (nameTag.unitPrice != null && nameTag.unitPrice > 0)
      ? nameTag.unitPrice
      : (student?.nameTagPrice != null && student.nameTagPrice > 0) ? student.nameTagPrice : null;
    const attachPrice = (nameTag.attachPrice != null && nameTag.attachPrice > 0)
      ? nameTag.attachPrice
      : (student?.nameTagAttachPrice != null && student.nameTagAttachPrice > 0) ? student.nameTagAttachPrice : null;

    const orderTotal = nameTagPrice != null ? Math.ceil(nameTag.orderQuantity / minUnit) * nameTagPrice : null;
    const attachTotal = attachPrice != null ? nameTag.attachQuantity * attachPrice : null;
    const showPrice = orderTotal != null || attachTotal != null;

    const Stepper = ({
      value,
      onChange,
    }: {
      value: number;
      onChange: (v: number) => void;
    }) => (
      <div className="flex items-center justify-center gap-1">
        <button
          type="button"
          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-base leading-none"
          onClick={() => onChange(Math.max(0, value - minUnit))}
          disabled={value <= 0}
        >
          −
        </button>
        <span className="w-7 text-center text-sm text-gray-800 tabular-nums">{value}</span>
        <button
          type="button"
          className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded text-gray-600 bg-white hover:bg-gray-100 text-base leading-none"
          onClick={() => onChange(value + minUnit)}
        >
          +
        </button>
      </div>
    );

    return (
    <div className="flex-none flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">명찰 표시 이름</span>
        {isTableView ? (
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
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap">
              명찰
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">
              주문수량{minUnit > 1 && <span className="text-xs font-normal text-bg-400 ml-1">({minUnit}개 단위)</span>}
            </th>
            <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">
              부착수량
            </th>
            {showPrice && (
              <>
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">
                  주문금액
                </th>
                <th className="px-2 py-2.5 font-medium text-bg-800 bg-bg-050 border border-gray-200 text-center whitespace-nowrap w-24">
                  부착금액
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
              명찰
            </td>
            <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
                <span>{nameTag.orderQuantity}</span>
              ) : (
                <Stepper
                  value={nameTag.orderQuantity}
                  onChange={(v) => {
                    const itemTotal = [...winterUniforms, ...summerUniforms].reduce((sum, item) => sum + (item.nameTag ?? 0), 0);
                    const minCeiled = itemTotal === 0 ? 0 : Math.ceil(itemTotal / minUnit) * minUnit;
                    setNameTag((prev) => ({ ...prev, orderQuantity: Math.max(v, minCeiled) }));
                  }}
                />
              )}
            </td>
            <td className="p-2 border border-gray-200 text-center text-gray-700 align-middle">
              <span>{nameTag.attachQuantity}</span>
            </td>
            {showPrice && (
              <>
                <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                  {orderTotal != null ? `${orderTotal.toLocaleString()}원` : '-'}
                </td>
                <td className="p-2 border border-gray-200 text-right text-gray-700 align-middle tabular-nums pr-3">
                  {attachTotal != null ? `${attachTotal.toLocaleString()}원` : '-'}
                </td>
              </>
            )}
          </tr>
        </tbody>
      </table>
    </div>
    );
  };

  // ============================================================================
  // 렌더링
  // ============================================================================


  const titleText =
    mode === "add"
      ? "학생추가"
      : mode === "edit"
        ? "학생수정"
        : student
          ? `${student.admissionSchool} ${student.name}`
          : "학생 상세";

  const title =
    mode === "view" && !isEditing && !isOrderCreateMode && !isOrderEditMode && student ? (
      <span className="flex items-center gap-1.5">
        {titleText}
        <button
          type="button"
          className="flex items-center justify-center w-6 h-6 bg-transparent border-none cursor-pointer text-bg-400 hover:text-bg-800 p-0 translate-y-px"
          onClick={() => setIsEditing(true)}
          title="학생 정보 수정"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.333 2a1.885 1.885 0 0 1 2.667 2.667L4.833 13.833 2 14l.167-2.833L11.333 2z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </span>
    ) : titleText;

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      width={1000}
      titleExtra={undefined}
      actions={
        mode === "view" && !isEditing && !isOrderCreateMode && !isOrderEditMode ? (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={handleClose}
            >
              닫기
            </button>
            {onOrderUpdate && (activeOrderId ?? student?.orderId) && (
              <button
                className="px-6 py-2.5 bg-primary-900 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={() => setIsOrderEditMode(true)}
              >
                주문 수정
              </button>
            )}
            {onPaymentComplete && (
              <button
                className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
                onClick={() => {
                  const orderId = activeOrderId ?? student?.orderId;
                  if (orderId) onPaymentComplete(orderId);
                }}
              >
                결제 완료
              </button>
            )}
          </>
        ) : isOrderEditMode ? (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => setIsOrderEditMode(false)}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? '저장 중...' : '주문 저장'}
            </button>
          </>
        ) : isOrderCreateMode ? (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => {
                setIsOrderCreateMode(false);
                const snap = student?.orderSnapshots?.[activeDateIndex];
                if (snap) applyOrderSnapshot(snap);
              }}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isCreatingOrder}
            >
              {isCreatingOrder ? '생성 중...' : '주문 생성'}
            </button>
          </>
        ) : (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={isEditing ? () => setIsEditing(false) : handleClose}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={isEditing && !gender}
              title={isEditing && !gender ? "성별을 선택해주세요" : undefined}
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
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
                <ViewField label="입학학교" value={admissionSchool} />
              ) : (
                <EditField label="입학학교">
                  <div className="relative flex-1">
                    <input
                      ref={schoolInputRef}
                      className="w-full px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                      placeholder="입학 학교"
                      value={admissionSchool}
                      onChange={(e) => handleAdmissionSchoolChange(e.target.value)}
                      onFocus={() => schoolSuggestions.length > 0 && setShowSuggestions(true)}
                      autoComplete="off"
                    />
                    {showSuggestions && (
                      <div
                        ref={suggestionRef}
                        className="absolute left-0 top-full z-50 w-full bg-white border border-gray-200 rounded-b-lg shadow-lg max-h-52 overflow-y-auto"
                      >
                        {schoolSuggestions.map((name) => (
                          <button
                            key={name}
                            type="button"
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-bg-050 border-none bg-transparent cursor-pointer"
                            onMouseDown={(e) => { e.preventDefault(); handleSchoolSelect(name); }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </EditField>
              )}
            </div>
            <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
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
          </div>

          <div className="flex items-stretch">
            <div className="flex-1 min-w-0 flex items-center">
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
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
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
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
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
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
            <div
              className="flex-[1_1_0%] min-w-0 flex items-center"
              style={{ marginRight: "80px" }}
            >
              {(isView || isOrderCreateMode || isOrderEditMode) ? (
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

          {/* 추가 학생 정보 (추가 + 뷰 + 편집 공통) */}
          {(mode === "add" || isView || isEditing || isOrderCreateMode || isOrderEditMode) && (
            <>
              <div className="flex items-stretch">
                <div className="flex-1 min-w-0 flex items-center">
                  {(isView || isOrderCreateMode || isOrderEditMode) ? (
                    <ViewField label="생년월일" value={birthDate || "-"} />
                  ) : (
                    <EditField label="생년월일">
                      <input
                        type="date"
                        className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                      />
                    </EditField>
                  )}
                </div>
                <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
                  {(isView || isOrderCreateMode || isOrderEditMode) ? (
                    <ViewField label="입학년도/학년" value={admissionYear !== "" ? `${admissionYear}년 ${admissionGrade}학년` : "-"} />
                  ) : (
                    <EditField label="입학년도/학년">
                      <input
                        type="number"
                        className="w-20 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="년도"
                        value={admissionYear}
                        onChange={(e) => setAdmissionYear(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-400 px-1">/</span>
                      <input
                        type="number"
                        className="w-12 px-2 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="학년"
                        value={admissionGrade}
                        onChange={(e) => setAdmissionGrade(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </EditField>
                  )}
                </div>
              </div>
              <div className="flex items-stretch">
                <div className="flex-1 min-w-0 flex items-center">
                  {(isView || isOrderCreateMode || isOrderEditMode) ? (
                    <ViewField label="주소" value={address || "-"} />
                  ) : (
                    <EditField label="주소">
                      <input
                        className="flex-1 px-4 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none placeholder:text-bg-400"
                        placeholder="주소"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </EditField>
                  )}
                </div>
                <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
                  <ViewField label="구분" value={student?.studentType ?? "-"} />
                </div>
              </div>
              <div className="flex items-stretch">
                <div className="flex-1 min-w-0 flex items-center">
                  <ViewField label="주관구매" value={student?.isEligibleForPublicPurchase != null ? (student.isEligibleForPublicPurchase ? "O" : "X") : "-"} />
                </div>
                <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }} />
              </div>
              <div className="flex items-stretch">
                <div className="flex-1 min-w-0 flex items-center">
                  {(isView || isOrderCreateMode || isOrderEditMode) ? (
                    <ViewField label="키 / 몸무게" value={height !== "" || weight !== "" ? `${height !== "" ? height : "-"} cm / ${weight !== "" ? weight : "-"} kg` : "-"} />
                  ) : (
                    <EditField label="키 / 몸무게">
                      <input
                        type="number"
                        className="w-16 px-2 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="키"
                        value={height}
                        onChange={(e) => setHeight(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-400 px-1">cm /</span>
                      <input
                        type="number"
                        className="w-16 px-2 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="몸무게"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-400 px-1">kg</span>
                    </EditField>
                  )}
                </div>
                <div className="flex-[1_1_0%] min-w-0 flex items-center" style={{ marginRight: "80px" }}>
                  {(isView || isOrderCreateMode || isOrderEditMode) ? (
                    <ViewField label="어깨 / 허리" value={shoulder !== "" || waist !== "" ? `${shoulder !== "" ? shoulder : "-"} cm / ${waist !== "" ? waist : "-"} cm` : "-"} />
                  ) : (
                    <EditField label="어깨 / 허리">
                      <input
                        type="number"
                        className="w-16 px-2 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="어깨"
                        value={shoulder}
                        onChange={(e) => setShoulder(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-400 px-1">cm /</span>
                      <input
                        type="number"
                        className="w-16 px-2 py-3 text-sm text-gray-700 h-12 bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="허리"
                        value={waist}
                        onChange={(e) => setWaist(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                      <span className="text-sm text-gray-400 px-1">cm</span>
                    </EditField>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 날짜 탭 + 동복/하복/용품/명찰 — 수정 모드에서는 숨김 */}
        {!isEditing && <div className="flex flex-col gap-1">
          {mode === "view" && (() => {
            const currentSnapshot = student?.orderSnapshots?.[activeDateIndex];
            const orderId = activeOrderId ?? student?.orderId;
            const STATUS_LABELS: Record<OrderStatusValue, string> = {
              pending:   '대기중',
              confirmed: '확인됨',
              preparing: '준비중',
              ready:     '준비완료',
              receive:   '수령완료',
              complete:  '완료',
              cancelled: '취소됨',
            };
            const currentStatus = currentSnapshot?.status ?? '';
            return (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {student?.orderSnapshots && student.orderSnapshots.length > 0
                    ? (
                      <>
                        {student.orderSnapshots.map((snapshot, i) => {
                          const isActive = i === activeDateIndex;
                          // 수정 모드에서 활성 탭은 날짜 input으로 교체
                          if (isOrderEditMode && isActive) {
                            return (
                              <input
                                key={snapshot.orderId}
                                type="date"
                                className="px-1.5 py-0.5 text-sm border-b border-primary-900 bg-transparent outline-none text-bg-800 font-bold w-32"
                                value={orderDate}
                                onChange={(e) => setOrderDate(e.target.value)}
                              />
                            );
                          }
                          return (
                            <button
                              key={snapshot.orderId}
                              className={`text-sm px-1 py-0.5 border-none bg-transparent cursor-pointer ${
                                isActive ? "font-bold text-bg-800" : "text-bg-400"
                              }`}
                              onClick={() => {
                                if (!isOrderCreateMode && !isOrderEditMode) {
                                  handleDateTabClick(i);
                                }
                              }}
                            >
                              {formatDate(snapshot.date)}
                            </button>
                          );
                        })}
                        {!isOrderCreateMode && !isOrderEditMode && onOrderCreate && (
                          <button
                            className="text-sm px-1 py-0.5 border-none bg-transparent cursor-pointer text-blue-500 hover:text-blue-700 font-medium"
                            onClick={() => enterOrderCreateMode()}
                          >
                            +
                          </button>
                        )}
                      </>
                    )
                    : !isOrderCreateMode && onOrderCreate && (
                        <button
                          className="text-sm px-1 py-0.5 border-none bg-transparent cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => enterOrderCreateMode()}
                        >
                          + 주문 생성
                        </button>
                      )}
                </div>
                {onStatusChange && orderId && currentSnapshot && !isOrderEditMode && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{STATUS_LABELS[currentStatus] ?? currentStatus}</span>
                    <select
                      className="px-2 py-1 text-xs border border-gray-200 rounded outline-none focus:border-primary-900 text-gray-700 bg-white disabled:opacity-50"
                      defaultValue=""
                      disabled={isChangingStatus}
                      onChange={async (e) => {
                        const next = e.target.value as OrderStatusValue;
                        if (!next) return;
                        setIsChangingStatus(true);
                        try {
                          await onStatusChange(orderId, next);
                          setToast({ message: '주문 상태가 변경되었습니다.', variant: 'success' });
                          currentSnapshot.status = next;
                        } catch {
                          setToast({ message: '상태 변경에 실패했습니다.', variant: 'error' });
                        } finally {
                          setIsChangingStatus(false);
                          e.target.value = '';
                        }
                      }}
                    >
                      <option value="">상태 변경</option>
                      {(Object.entries(STATUS_LABELS) as [OrderStatusValue, string][])
                        .filter(([v]) => v !== currentStatus)
                        .map(([v, label]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })()}
          {isOrderCreateMode && (
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-bg-700 whitespace-nowrap">구입일자</span>
              <input
                type="date"
                className="px-2 py-1 text-sm border border-gray-200 rounded outline-none focus:border-bg-400 text-gray-700"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
          )}
          {/* isOrderEditMode의 구입일자는 날짜 탭 행 내부에 표시 */}
          {renderUniformTable("동복", winterUniforms, "winter")}
        </div>}

        {/* 하복 테이블 */}
        {!isEditing && renderUniformTable("하복", summerUniforms, "summer")}

        {/* 사계절 테이블 — 항목 없으면 숨김 */}
        {!isEditing && (allUniforms.length > 0 || (isTableEditable && (student?.availableUniforms ?? []).some(u => u.season === 'all'))) && renderUniformTable("사계절", allUniforms, "all")}

        {/* 용품 & 명찰 */}
        {!isEditing && (
        <div className="flex gap-4 items-start">
          {renderSupplyTable()}
          {renderNameTagTable()}
        </div>
        )}

        {/* 가격 요약 — 정가 / 지원금액 / 실납부액 */}
        {!isEditing && hasPrice && (
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
                {hasSupplyPrice && supplyCalcTotal > 0 && (
                  <tr className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-700">용품</td>
                    <td className="px-3 py-2 text-right text-gray-700 tabular-nums">{supplyCalcTotal.toLocaleString()}원</td>
                    <td className="px-3 py-2 text-right text-gray-400 tabular-nums">-</td>
                    <td className="px-3 py-2 text-right font-medium text-gray-900 tabular-nums">{supplyCalcTotal.toLocaleString()}원</td>
                  </tr>
                )}
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


{/* 이력 + 등록일/최종수정일 (view 모드) */}
        {mode === "view" && !isEditing && (
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
                    <span className="text-sm text-gray-700 w-40">{formatDateTime(h.date)}</span>
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
