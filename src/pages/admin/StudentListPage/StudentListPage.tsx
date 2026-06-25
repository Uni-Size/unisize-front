import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { StudentModal } from '@components/organisms/StudentModal';
import type { StudentDetailData, StudentFormInput, AvailableUniform, UniformItem } from '@components/organisms/StudentModal';
import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import { getStudents, getStudentDetail, deleteStudent, getOrderHistory, updateAdminOrder, createStudent } from '@/api/student';
import type { AdminStudent } from '@/api/student';
import { getSchoolDetail } from '@/api/school';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { formatDate } from '@/utils/dateUtils';
import { formatGender } from '@/utils/genderUtils';
import { downloadCSV } from '@/utils/csvUtils';

interface StudentRow {
  id: number;
  no: number;
  category: string;
  school: string;
  name: string;
  gender: string;
  studentPhone: string;
  parentPhone: string;
  governmentPurchase: string;
  registeredDate: string;
}

export const StudentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('통합검색');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [purchaseFilter, setPurchaseFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const itemsPerPage = 10;

  // 모달 state
  const [modalMode, setModalMode] = useState<'add' | 'view' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);

  const mapToRow = (student: AdminStudent, index: number, page: number): StudentRow => ({
    id: student.id,
    no: (page - 1) * itemsPerPage + index + 1,
    category: `${student.admission_grade}학년`,
    school: student.admission_school ?? '',
    name: student.name,
    gender: formatGender(student.gender),
    studentPhone: student.student_phone || '-',
    parentPhone: student.guardian_phone || '-',
    governmentPurchase: student.is_eligible_for_public_purchase ? 'O' : 'X',
    registeredDate: formatDate(student.created_at),
  });

  const fetchStudents = useCallback(async (page: number, search?: string, school?: string, grade?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudents({
        page,
        limit: itemsPerPage,
        search,
        school,
        grade,
      });
      const rows = response.data.map((s, i) => mapToRow(s, i, page));
      setStudents(rows);
      setTotalPages(response.meta.total_pages);
    } catch (err) {
      console.error('학생 목록 조회 실패:', err);
      setError(getApiErrorMessage(err, '학생 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(currentPage);
  }, [currentPage, fetchStudents]);

  const handleSearch = () => {
    setCurrentPage(1);
    const gradeParam = categoryFilter === '신입' ? 1 : categoryFilter === '재학' ? 2 : undefined;
    fetchStudents(1, searchTerm || undefined, undefined, gradeParam);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearchType('통합검색');
    setCategoryFilter('전체');
    setPurchaseFilter('전체');
    setCurrentPage(1);
    fetchStudents(1);
  };

  const handleAddStudent = async (data: StudentFormInput) => {
    await createStudent({
      name: data.name,
      admission_year: data.admissionYear as number,
      admission_grade: data.admissionGrade as number,
      admission_school: data.admissionSchool,
      ...(data.previousSchool ? { previous_school: data.previousSchool } : {}),
      ...(data.birthDate ? { birth_date: data.birthDate } : {}),
      ...(data.gender ? { gender: data.gender } : {}),
      ...(data.studentPhone ? { student_phone: data.studentPhone } : {}),
      ...(data.guardianPhone ? { guardian_phone: data.guardianPhone } : {}),
      ...(data.address ? { address: data.address } : {}),
      ...(data.height !== "" || data.weight !== "" || data.shoulder !== "" || data.waist !== ""
        ? {
            body: {
              ...(data.height !== "" ? { height: data.height as number } : {}),
              ...(data.weight !== "" ? { weight: data.weight as number } : {}),
              ...(data.shoulder !== "" ? { shoulder: data.shoulder as number } : {}),
              ...(data.waist !== "" ? { waist: data.waist as number } : {}),
            },
          }
        : {}),
    });
    fetchStudents(currentPage);
  };

  const parseAdminOrderItems = (
    orderItems: import('@/api/student').AdminOrderItem[],
  ): {
    winterUniforms: import('@components/organisms/StudentModal').UniformItem[];
    summerUniforms: import('@components/organisms/StudentModal').UniformItem[];
    allUniforms: import('@components/organisms/StudentModal').UniformItem[];
  } => {
    const winterUniforms: import('@components/organisms/StudentModal').UniformItem[] = [];
    const summerUniforms: import('@components/organisms/StudentModal').UniformItem[] = [];
    const allUniforms: import('@components/organisms/StudentModal').UniformItem[] = [];

    for (const item of orderItems) {
      const productName = item.product?.name ?? '';
      const nameUpper = productName.toUpperCase();
      const rawSeason = item.product?.season?.toUpperCase();
      const seasonCode: 'W' | 'S' | 'A' =
        rawSeason === 'W' ? 'W' :
        rawSeason === 'S' ? 'S' :
        rawSeason === 'A' ? 'A' :
        nameUpper.includes('동복') || nameUpper.includes('WINTER') ? 'W' :
        nameUpper.includes('하복') || nameUpper.includes('SUMMER') ? 'S' : 'A';
      const uniform: import('@components/organisms/StudentModal').UniformItem = {
        id: String(item.id),
        name: productName,
        size: item.selected_size,
        supportedQuantity: item.supported_quantity,
        additionalQuantity: item.purchase_quantity - item.supported_quantity,
        unitPrice: item.unit_price,
        repair: '',
        reservation: item.delivery_status === 'reserved',
        received: item.delivery_status === 'receipt',
        nameTag: item.name_tag_count || null,
        nameTagName: item.name_tag_name || undefined,
        attachCount: item.name_tag_attach ? 1 : 0,
        itemStatus: item.delivery_status,
        seasonCode,
      };
      if (seasonCode === 'W') winterUniforms.push(uniform);
      else if (seasonCode === 'S') summerUniforms.push(uniform);
      else allUniforms.push(uniform);
    }

    return { winterUniforms, summerUniforms, allUniforms };
  };

  const fetchStudentDetail = async (studentId: number): Promise<StudentDetailData> => {
    const detail = await getStudentDetail(studentId);
    const adminOrders = detail.orders ?? [];
    const orderSnapshots: import('@components/organisms/StudentModal').OrderSnapshot[] = adminOrders.map(
      (order: import('@/api/student').AdminStudentOrder) => {
        const { winterUniforms, summerUniforms, allUniforms } = parseAdminOrderItems(order.order_items ?? []);
        return {
          orderId: order.id,
          date: order.order_date ?? order.created_at,
          status: order.order_status,
          winterUniforms,
          summerUniforms,
          allUniforms,
          supplies: [],
          history: [],
          modifiedDate: formatDate(order.updated_at),
        };
      },
    );

    const firstSnapshot = orderSnapshots[0];

    const historyData = firstSnapshot
      ? await getOrderHistory(firstSnapshot.orderId).catch(() => null)
      : null;
    const firstHistory = historyData?.histories.map((h) => ({
      date: h.changed_at,
      content: h.description,
    })) ?? [];

    if (firstSnapshot) {
      firstSnapshot.history = firstHistory;
    }

    const schoolName = detail.admission_school ?? detail.school_name ?? '';
    const availableUniforms: AvailableUniform[] = [];
    let nameTagMinUnit: number | undefined;
    let nameTagPrice: number | null | undefined;
    let nameTagAttachPrice: number | null | undefined;
    if (schoolName) {
      const schoolDetail = await getSchoolDetail(schoolName).catch(() => null);
      if (schoolDetail) {
        nameTagMinUnit = schoolDetail.name_tag_min_unit ?? undefined;
        nameTagPrice = schoolDetail.name_tag_price;
        nameTagAttachPrice = schoolDetail.name_tag_attach_price;
        for (const u of schoolDetail.uniforms.winter) {
          availableUniforms.push({ productId: u.product_id, name: u.display_name, season: 'winter', price: u.contract_price, availableSizes: u.stock_by_sizes.map(s => s.size) });
        }
        for (const u of schoolDetail.uniforms.summer) {
          availableUniforms.push({ productId: u.product_id, name: u.display_name, season: 'summer', price: u.contract_price, availableSizes: u.stock_by_sizes.map(s => s.size) });
        }
      }
    }

    // 기존 주문 아이템에 availableSizes backfill (product_id로 학교 정보와 매칭)
    const sizesByProductId = new Map(availableUniforms.map(u => [u.productId, u.availableSizes]));
    for (const snap of orderSnapshots) {
      for (const u of [...snap.winterUniforms, ...snap.summerUniforms, ...snap.allUniforms]) {
        if (u.productId != null && (!u.availableSizes || u.availableSizes.length === 0)) {
          const sizes = sizesByProductId.get(u.productId);
          if (sizes) u.availableSizes = sizes;
        }
      }
    }

    // 주문 없을 때 recommended_uniforms를 초기 편집 항목으로 변환
    const toUniformItem = (r: import('@/api/student').RecommendedUniformItem, idx: number, seasonCode: 'W' | 'S' | 'A'): import('@components/organisms/StudentModal').UniformItem => ({
      id: `rec-${r.product_id}-${idx}`,
      productId: r.product_id,
      name: r.item_id || r.product_name,
      size: r.recommended_size,
      availableSizes: r.available_sizes.map(a => a.size),
      supportedQuantity: r.supported_quantity,
      additionalQuantity: r.purchase_quantity - r.supported_quantity,
      unitPrice: r.price,
      repair: r.customization ?? '',
      reservation: r.delivery_status === 'reserved',
      received: r.delivery_status === 'receipt',
      nameTag: r.name_tag_count ?? null,
      nameTagName: r.name_tag_name,
      attachCount: r.name_tag_attach ? 1 : 0,
      itemStatus: r.delivery_status,
      seasonCode,
    });

    const recWinter = !firstSnapshot
      ? (detail.recommended_uniforms?.winter ?? []).filter(r => r.season === 'W').map((r, i) => toUniformItem(r, i, 'W'))
      : [];
    const recSummer = !firstSnapshot
      ? (detail.recommended_uniforms?.summer ?? []).filter(r => r.season === 'S').map((r, i) => toUniformItem(r, i, 'S'))
      : [];
    const recAll = !firstSnapshot
      ? [
          ...(detail.recommended_uniforms?.winter ?? []).filter(r => r.season === 'A').map((r, i) => toUniformItem(r, i, 'A')),
          ...(detail.recommended_uniforms?.summer ?? []).filter(r => r.season === 'A').map((r, i) => toUniformItem(r, i, 'A')),
        ]
      : [];

    return {
      id: String(detail.id),
      orderId: firstSnapshot?.orderId,
      admissionSchool: schoolName,
      previousSchool: detail.previous_school ?? '',
      name: detail.name,
      gender: detail.gender,
      birthDate: detail.birth_date ?? undefined,
      admissionYear: detail.admission_year,
      admissionGrade: detail.admission_grade,
      studentPhone: detail.student_phone,
      guardianPhone: detail.guardian_phone,
      address: detail.address ?? undefined,
      height: detail.body_measurements?.height ?? undefined,
      weight: detail.body_measurements?.weight ?? undefined,
      shoulder: detail.body_measurements?.shoulder ?? undefined,
      waist: detail.body_measurements?.waist ?? undefined,
      studentType: detail.student_type,
      isEligibleForPublicPurchase: detail.is_eligible_for_public_purchase,
      registeredDate: formatDate(detail.created_at) || undefined,
      modifiedDate: firstSnapshot?.modifiedDate,
      orderSnapshots,
      availableUniforms,
      nameTagMinUnit,
      nameTagPrice,
      nameTagAttachPrice,
      winterUniforms: firstSnapshot?.winterUniforms ?? recWinter,
      summerUniforms: firstSnapshot?.summerUniforms ?? recSummer,
      allUniforms: firstSnapshot?.allUniforms ?? recAll,
      supplies: [],
      nameTag: { orderQuantity: 0, attachQuantity: 0 },
      history: firstHistory,
      isManuallySupported: detail.is_manually_supported,
    };
  };

  const handleRowClick = async (student: StudentRow) => {
    try {
      const detailData = await fetchStudentDetail(student.id);
      setSelectedStudent(detailData);
      setModalMode('view');
    } catch (error) {
      console.error('학생 상세 조회 실패:', error);
    }
  };

  const handleEditSave = async (orderId: number, data: StudentFormInput) => {
    try {
      const uniformItems = [
        ...data.winterUniforms.filter((u) => !u.isDeleted).map((u) => ({
          item_id: u.productId as number,
          name: u.name,
          season: '동복',
          selected_size: Number(u.size),
          purchase_count: u.supportedQuantity + u.additionalQuantity,
          customization: u.repair,
        })),
        ...data.summerUniforms.filter((u) => !u.isDeleted).map((u) => ({
          item_id: u.productId as number,
          name: u.name,
          season: '하복',
          selected_size: Number(u.size),
          purchase_count: u.supportedQuantity + u.additionalQuantity,
          customization: u.repair,
        })),
      ];
      const supplyItems = data.supplies
        .filter((s) => s.quantity > 0)
        .map((s) => ({
          item_id: s.name,
          name: s.name,
          selected_size: s.size,
          purchase_count: s.quantity,
        }));
      await updateAdminOrder(orderId, {
        uniform_items: uniformItems,
        supply_items: supplyItems,
        notes: '',
        ...(data.orderDate ? { order_date: data.orderDate } : {}),
      });

      // 저장 후 해당 학생 데이터 재조회해서 view 모드로 전환
      const studentId = Number(selectedStudent?.id);
      if (studentId) {
        const refreshed = await fetchStudentDetail(studentId);
        setSelectedStudent(refreshed);
      }
      fetchStudents(currentPage);
    } catch (error) {
      console.error('주문 수정 실패:', error);
    }
  };

  const handleOrderUpdate = async (orderId: number, data: StudentFormInput) => {
    // 원본 스냅샷 (변경 감지용)
    const origSnapshot = selectedStudent?.orderSnapshots?.find(s => s.orderId === orderId);

    const mapUniform = (u: typeof data.winterUniforms[0], season: string) => ({
      item_id: u.productId!,
      name: u.name,
      season,
      selected_size: u.size,
      purchase_count: u.supportedQuantity + u.additionalQuantity,
      customization: u.repair || undefined,
      is_reserved: u.reservation || undefined,
      name_tag_count: (u.nameTag ?? 0) > 0 ? (u.nameTag ?? 0) : undefined,
      name_tag_attach: u.attachCount > 0 ? true : undefined,
    });

    const uniformChanged = (curr: UniformItem[], orig: UniformItem[]): boolean => {
      if (curr.length !== orig.length) return true;
      return curr.some((u, i) => {
        const o = orig[i];
        return u.id !== o.id ||
          u.size !== o.size ||
          (u.supportedQuantity + u.additionalQuantity) !== (o.supportedQuantity + o.additionalQuantity) ||
          u.supportedQuantity !== o.supportedQuantity ||
          u.repair !== o.repair ||
          u.reservation !== o.reservation ||
          u.received !== o.received ||
          (u.nameTag ?? 0) !== (o.nameTag ?? 0) ||
          u.attachCount !== o.attachCount ||
          u.isDeleted !== o.isDeleted;
      });
    };

    const origWinter = origSnapshot?.winterUniforms ?? [];
    const origSummer = origSnapshot?.summerUniforms ?? [];
    const origAll = origSnapshot?.allUniforms ?? [];
    const origDate = origSnapshot?.date ? (origSnapshot.date.slice(0, 10)) : '';

    const currUniforms = [
      ...data.winterUniforms.filter((u) => !u.isDeleted && u.productId != null).map((u) => mapUniform(u, '동복')),
      ...data.summerUniforms.filter((u) => !u.isDeleted && u.productId != null).map((u) => mapUniform(u, '하복')),
      ...(data.allUniforms ?? []).filter((u) => !u.isDeleted && u.productId != null).map((u) => mapUniform(u, '사계절')),
    ];

    const unifsChanged = uniformChanged(data.winterUniforms, origWinter) ||
      uniformChanged(data.summerUniforms, origSummer) ||
      uniformChanged(data.allUniforms ?? [], origAll);

    const suppliesChanged = data.supplies.some((s, i) => {
      const o = origSnapshot?.supplies?.[i];
      return !o || s.size !== o.size || s.quantity !== o.quantity;
    });

    const dateChanged = data.orderDate && data.orderDate !== origDate;

    const payload: import('@/api/order').UpdateAdminOrderRequest = {
      ...(unifsChanged ? { uniform_items: currUniforms } : {}),
      ...(suppliesChanged ? {
        supply_items: data.supplies.filter((s) => s.quantity > 0).map((s) => ({
          item_id: s.name,
          name: s.name,
          selected_size: s.size,
          purchase_count: s.quantity,
        })),
      } : {}),
      ...(dateChanged ? { order_date: data.orderDate } : {}),
    };

    if (Object.keys(payload).length === 0) return; // 변경 없음

    await updateAdminOrder(orderId, payload);
    const studentId = Number(selectedStudent?.id);
    if (studentId) {
      const refreshed = await fetchStudentDetail(studentId);
      setSelectedStudent(refreshed);
    }
    fetchStudents(currentPage);
  };

  const handleOrderCreate = async (studentId: number, data: StudentFormInput) => {
    const { submitMeasurementOrder } = await import('@/api/student');
    const mapUniform = (u: typeof data.winterUniforms[0], season: '동복' | '하복') => ({
      item_id: u.productId as number,
      name: u.name,
      season,
      selected_size: u.size,
      purchase_count: u.supportedQuantity + u.additionalQuantity,
      is_reserved: u.reservation || undefined,
      customization: u.repair || undefined,
      name_tag_count: (u.nameTag ?? 0) > 0 ? (u.nameTag ?? 0) : undefined,
      name_tag_attach: u.attachCount > 0 ? true : undefined,
    });
    const uniformItems = [
      ...data.winterUniforms.filter((u) => !u.isDeleted).map((u) => mapUniform(u, '동복')),
      ...data.summerUniforms.filter((u) => !u.isDeleted).map((u) => mapUniform(u, '하복')),
    ];
    const supplyItems = data.supplies
      .filter((s) => s.quantity > 0)
      .map((s) => ({
        item_id: s.name,
        name: s.name,
        selected_size: s.size || undefined,
        purchase_count: s.quantity,
      }));
    await submitMeasurementOrder(studentId, {
      uniform_items: uniformItems,
      supply_items: supplyItems,
      notes: '',
    });
    const refreshed = await fetchStudentDetail(studentId);
    setSelectedStudent(refreshed);
    fetchStudents(currentPage);
  };

  const handleStatusChange = async (orderId: number, status: import('@components/organisms/StudentModal').OrderStatusValue) => {
    const { updateOrderStatus } = await import('@/api/order');
    await updateOrderStatus(orderId, status as import('@/api/order').OrderStatus);
    const studentId = Number(selectedStudent?.id);
    if (studentId) {
      const refreshed = await fetchStudentDetail(studentId);
      setSelectedStudent(refreshed);
    }
  };

  const handleDeleteStudent = async (e: React.MouseEvent, studentId: number) => {
    e.stopPropagation();
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteStudent(studentId);
      fetchStudents(currentPage);
    } catch (error) {
      console.error('학생 삭제 실패:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const gradeParam = categoryFilter === '신입' ? 1 : categoryFilter === '재학' ? 2 : undefined;
      const response = await getStudents({ search: searchTerm || undefined, grade: gradeParam, limit: 99999 });
      const list = response.data;
      downloadCSV(
        ['No.', '학년', '입학학교', '학생이름', '성별', '학생 연락처', '학부모 연락처', '주관구매', '등록일'],
        list.map((s, i) => [
          i + 1,
          `${s.admission_grade}학년`,
          s.school_name ?? '',
          s.name,
          formatGender(s.gender),
          s.student_phone,
          s.guardian_phone,
          s.is_eligible_for_public_purchase ? 'O' : 'X',
          s.created_at ?? '',
        ]),
        '학생목록',
      );
    } catch (err) {
      console.error('CSV 내보내기 실패:', err);
    }
  };

  const columns: Column<StudentRow>[] = [
    { key: 'no', header: 'No.', width: '40px', align: 'center' },
    { key: 'category', header: '학년', width: '50px', align: 'center' },
    { key: 'school', header: '입학학교', width: '100px', align: 'center' },
    { key: 'name', header: '학생이름', width: '80px', align: 'center' },
    { key: 'gender', header: '성별', width: '40px', align: 'center' },
    { key: 'studentPhone', header: '학생 연락처', width: '120px', align: 'center' },
    { key: 'parentPhone', header: '학부모 연락처', width: '120px', align: 'center' },
    { key: 'governmentPurchase', header: '주관구매', width: '60px', align: 'center' },
    { key: 'registeredDate', header: '등록일', width: '80px', align: 'center' },
    {
      key: 'actions',
      header: '관리',
      width: '140px',
      align: 'center',
      render: (row) => (
        <div className="flex gap-1 justify-center">
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-neutral-050 text-bg-800"
            onClick={(e) => { e.stopPropagation(); handleRowClick(row); }}
          >
            상세
          </button>
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-red-200 text-red-700"
            onClick={(e) => handleDeleteStudent(e, row.id)}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="학생"
          buttonLabel="학생추가"
          onButtonClick={() => { setSelectedStudent(null); setModalMode('add'); }}
          actions={
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-15 font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportCSV}
              disabled={students.length === 0}
            >
              CSV 내보내기
            </button>
          }
        />

        <div className="border-y border-gray-200 overflow-hidden">
          {/* 검색어 */}
          <div className="flex items-stretch border-b border-gray-200">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              검색어
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-white">
              <select
                className="h-9 px-3 py-1.5 border border-gray-200 rounded text-14 text-gray-700 bg-white"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="통합검색">통합검색</option>
                <option value="이름">이름</option>
                <option value="연락처">연락처</option>
              </select>
              <Input
                placeholder="검색어를 입력하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 학년 + 주관구매 (같은 행) */}
          <div className="flex items-stretch">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              학년
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white border-r border-gray-200">
              {[
                { value: '전체', label: '전체' },
                { value: '신입', label: '신입' },
                { value: '재학', label: '재학' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFilter === opt.value}
                    onChange={() => setCategoryFilter(categoryFilter === opt.value ? '전체' : opt.value)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              주관구매
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {[
                { value: '전체', label: '전체' },
                { value: '신청', label: '신청' },
                { value: '미신청', label: '미신청' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={purchaseFilter === opt.value}
                    onChange={() => setPurchaseFilter(purchaseFilter === opt.value ? '전체' : opt.value)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 검색/초기화 버튼 */}
        <div className="flex justify-center gap-3">
          <Button variant="primary" className="w-auto px-8 py-2.5" onClick={handleSearch}>검색</Button>
          <Button variant="outline" className="w-auto px-8 py-2.5 bg-gray-400! text-white! border-gray-400! hover:bg-gray-500!" onClick={handleReset}>초기화</Button>
        </div>

        <div className="flex-1">
          <Table
            columns={columns}
            data={loading ? [] : students}
            onRowClick={handleRowClick}
            emptyMessage={loading ? "로딩 중..." : error ?? "데이터가 없습니다."}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>

        <StudentModal
          isOpen={modalMode !== null}
          onClose={() => setModalMode(null)}
          mode={modalMode ?? 'view'}
          student={selectedStudent}
          onSubmit={handleAddStudent}
          onEditSave={handleEditSave}
          onOrderCreate={handleOrderCreate}
          onOrderUpdate={handleOrderUpdate}
          onStatusChange={handleStatusChange}
        />
      </div>
    </AdminLayout>
  );
};
