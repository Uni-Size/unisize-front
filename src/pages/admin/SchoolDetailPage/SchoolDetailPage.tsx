import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { useParams, useLocation } from "react-router-dom";
import { AdminLayout } from "@components/templates/AdminLayout";
import { AdminHeader } from "@components/organisms/AdminHeader";
import { StudentModal } from "@components/organisms/StudentModal";
import type {
  StudentDetailData,
  StudentFormInput,
} from "@components/organisms/StudentModal";
import { OrderSizeTable } from "@components/organisms/OrderSizeTable";
import { Table } from "@components/atoms/Table";
import { Input } from "@components/atoms/Input";
import { Button } from "@components/atoms/Button";
import { Pagination } from "@components/atoms/Pagination";
import type { Column } from "@components/atoms/Table";
import { getStudents, getStudentDetail, deleteStudent } from "@/api/student";
import type { AdminStudent } from "@/api/student";
import { getSupportedSchoolsByYear } from "@/api/school";
import { getTargetYear } from "@/utils/schoolUtils";
import { getApiErrorMessage } from "@/utils/errorUtils";
import { downloadCSV } from "@/utils/csvUtils";
import { getOrderInventory, updateInventoryStock } from "@/api/order";
import type { InventoryProduct } from "@/api/order";
import { StockAddModal } from "@components/organisms/StockAddModal";

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

// ============================================================================
// 학생 탭
// ============================================================================

const StudentTab = ({ schoolName }: { schoolName: string }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("통합검색");
  const [categoryFilter, setCategoryFilter] = useState("전체");
  const [purchaseFilter, setPurchaseFilter] = useState("전체");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const itemsPerPage = 10;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailData | null>(null);

  const mapToRow = (
    student: AdminStudent,
    index: number,
    page: number,
  ): StudentRow => ({
    id: student.id,
    no: (page - 1) * itemsPerPage + index + 1,
    category: `${student.admission_grade}학년`,
    school: student.school_name,
    name: student.name,
    gender:
      student.gender === "M"
        ? "남"
        : student.gender === "F"
          ? "여"
          : student.gender === "U"
            ? "공용"
            : student.gender,
    studentPhone: student.student_phone,
    parentPhone: student.guardian_phone,
    governmentPurchase: student.government_purchase ? "O" : "X",
    registeredDate: student.created_at
      ? new Date(student.created_at).toLocaleDateString("ko-KR", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit",
        })
      : "",
  });

  const fetchStudents = useCallback(
    async (page: number, search?: string, grade?: number) => {
      setLoading(true);
      setError(null);
      try {
        const response = await getStudents({
          page,
          limit: itemsPerPage,
          search,
          school: schoolName,
          grade,
        });
        const list = Array.isArray(response.data)
          ? response.data
          : ((response.data as unknown as { students: AdminStudent[] })
              .students ?? []);
        const rows = list.map((s, i) => mapToRow(s, i, page));
        setStudents(rows);
        setTotalPages(response.meta?.total_pages ?? 1);
      } catch (err) {
        console.error("학생 목록 조회 실패:", err);
        setError(
          getApiErrorMessage(
            err,
            "학생 목록을 불러오는 중 오류가 발생했습니다.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [schoolName],
  );

  useEffect(() => {
    if (schoolName) fetchStudents(currentPage);
  }, [currentPage, fetchStudents, schoolName]);

  const handleSearch = () => {
    setCurrentPage(1);
    const gradeParam =
      categoryFilter === "신입" ? 1 : categoryFilter === "재학" ? 2 : undefined;
    fetchStudents(1, searchTerm || undefined, gradeParam);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchType("통합검색");
    setCategoryFilter("전체");
    setPurchaseFilter("전체");
    setCurrentPage(1);
    fetchStudents(1);
  };

  const handleAddStudent = (data: StudentFormInput) => {
    console.log("학생 추가:", data);
    fetchStudents(currentPage);
  };

  const handleEditStudent = (data: StudentFormInput) => {
    console.log("학생 수정:", data);
    fetchStudents(currentPage);
  };

  const handleRowClick = async (student: StudentRow) => {
    try {
      const detail = await getStudentDetail(student.id);
      const detailData: StudentDetailData = {
        id: String(detail.id),
        admissionSchool: detail.school_name,
        previousSchool: detail.previous_school,
        classNumber: detail.class_name || "",
        name: detail.name,
        gender: detail.gender,
        studentPhone: detail.student_phone,
        guardianPhone: detail.guardian_phone,
        registeredDate: detail.created_at
          ? new Date(detail.created_at).toLocaleDateString("ko-KR")
          : "",
        winterUniforms: [],
        summerUniforms: [],
        supplies: [],
        nameTag: { orderQuantity: 0, attachQuantity: 0 },
      };
      setSelectedStudent(detailData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error("학생 상세 조회 실패:", error);
    }
  };

  const handleDeleteStudent = async (
    e: React.MouseEvent,
    studentId: number,
  ) => {
    e.stopPropagation();
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteStudent(studentId);
      fetchStudents(currentPage);
    } catch (error) {
      console.error("학생 삭제 실패:", error);
    }
  };

  const handleExportCSV = async () => {
    try {
      const gradeParam = categoryFilter === "신입" ? 1 : categoryFilter === "재학" ? 2 : undefined;
      const response = await getStudents({ search: searchTerm || undefined, school: schoolName, grade: gradeParam, limit: 99999 });
      const list = Array.isArray(response.data) ? response.data : ((response.data as unknown as { students: AdminStudent[] }).students ?? []);
      downloadCSV(
        ['No.', '학년', '입학학교', '학생이름', '성별', '학생 연락처', '학부모 연락처', '주관구매', '등록일'],
        list.map((s, i) => [
          i + 1,
          `${s.admission_grade}학년`,
          s.school_name,
          s.name,
          s.gender === "M" ? "남" : s.gender === "F" ? "여" : s.gender === "U" ? "공용" : s.gender,
          s.student_phone,
          s.guardian_phone,
          s.government_purchase ? "O" : "X",
          s.created_at ?? '',
        ]),
        `${schoolName}_학생목록`,
      );
    } catch (err) {
      console.error('CSV 내보내기 실패:', err);
    }
  };

  const columns: Column<StudentRow>[] = [
    { key: "no", header: "No.", width: "40px", align: "center" },
    { key: "category", header: "학년", width: "50px", align: "center" },
    { key: "school", header: "입학학교", width: "100px", align: "center" },
    { key: "name", header: "학생이름", width: "80px", align: "center" },
    { key: "gender", header: "성별", width: "40px", align: "center" },
    {
      key: "studentPhone",
      header: "학생 연락처",
      width: "120px",
      align: "center",
    },
    {
      key: "parentPhone",
      header: "학부모 연락처",
      width: "120px",
      align: "center",
    },
    {
      key: "governmentPurchase",
      header: "주관구매",
      width: "60px",
      align: "center",
    },
    { key: "registeredDate", header: "등록일", width: "80px", align: "center" },
    {
      key: "actions",
      header: "관리",
      width: "140px",
      align: "center",
      render: (row) => (
        <div className="flex flex-col items-center gap-1">
          <Button variant="primary" size="small">
            추가
          </Button>
          <div className="flex gap-1">
            <button className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#e5e7eb] text-[#374151]">
              수정
            </button>
            <button
              className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#fecaca] text-[#991b1b]"
              onClick={(e) => handleDeleteStudent(e, row.id)}
            >
              삭제
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminHeader
        title={`${schoolName} 학생`}
        buttonLabel="학생추가"
        onButtonClick={() => setIsAddModalOpen(true)}
        actions={
          <button
            type="button"
            className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-[15px] font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleExportCSV}
            disabled={students.length === 0}
          >
            CSV 내보내기
          </button>
        }
      />

      <div className="border-y border-gray-200 overflow-hidden">
        <div className="flex items-stretch border-b border-gray-200">
          <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
            검색어
          </div>
          <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-white">
            <select
              className="h-9 px-3 py-1.5 border border-gray-200 rounded text-[14px] text-gray-700 bg-white"
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

        <div className="flex items-stretch">
          <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
            학년
          </div>
          <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white border-r border-gray-200">
            {[
              { value: "전체", label: "전체" },
              { value: "신입", label: "신입" },
              { value: "재학", label: "재학" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={categoryFilter === opt.value}
                  onChange={() =>
                    setCategoryFilter(
                      categoryFilter === opt.value ? "전체" : opt.value,
                    )
                  }
                  className="w-4 h-4 accent-gray-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
            주관구매
          </div>
          <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
            {[
              { value: "전체", label: "전체" },
              { value: "신청", label: "신청" },
              { value: "미신청", label: "미신청" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={purchaseFilter === opt.value}
                  onChange={() =>
                    setPurchaseFilter(
                      purchaseFilter === opt.value ? "전체" : opt.value,
                    )
                  }
                  className="w-4 h-4 accent-gray-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          variant="primary"
          className="w-auto px-8 py-2.5"
          onClick={handleSearch}
        >
          검색
        </Button>
        <Button
          variant="outline"
          className="w-auto px-8 py-2.5 bg-gray-400! text-white! border-gray-400! hover:bg-gray-500!"
          onClick={handleReset}
        >
          초기화
        </Button>
      </div>

      <div className="flex-1">
        <Table
          columns={columns}
          data={loading ? [] : students}
          onRowClick={handleRowClick}
          emptyMessage={
            loading ? "로딩 중..." : (error ?? "데이터가 없습니다.")
          }
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <StudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        mode="add"
        onSubmit={handleAddStudent}
      />
      <StudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mode="edit"
        student={selectedStudent}
        onSubmit={handleEditStudent}
      />
    </>
  );
};

// ============================================================================
// 주문/예약 탭
// ============================================================================

const EXCLUDED_STATUSES = new Set(['receipt', 'delivered', 'shipped']);

const OrderReservationTab = ({ schoolName }: { schoolName: string }) => {
  const [allProducts, setAllProducts] = useState<InventoryProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["전체"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  const fetchInventory = () => {
    if (!schoolName) return;
    setLoading(true);
    setError(null);
    getOrderInventory(schoolName)
      .then((data) => setAllProducts(data.products))
      .catch((err) => {
        console.error("주문/재고 조회 실패:", err);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, [schoolName]);

  const productOptions = ["전체", ...allProducts.map((p) => p.display_name)];
  const individualOptions = productOptions.filter((o) => o !== "전체");

  const toggleProduct = (product: string) => {
    if (product === "전체") {
      setSelectedProducts((prev) => (prev.includes("전체") ? [] : ["전체"]));
      return;
    }
    const next = selectedProducts.filter((p) => p !== "전체");
    if (next.includes(product)) {
      setSelectedProducts(next.filter((p) => p !== product));
    } else {
      const updated = [...next, product];
      if (updated.length === individualOptions.length) {
        setSelectedProducts(["전체"]);
      } else {
        setSelectedProducts(updated);
      }
    }
  };

  const visibleProducts = selectedProducts.includes("전체")
    ? allProducts
    : allProducts.filter((p) => selectedProducts.includes(p.display_name));

  const handleReset = () => setSelectedProducts(["전체"]);

  const handleExportCSV = () => {
    const sectionBlocks = visibleProducts.map((product) => {
      const sizes = product.size_stats.map((s) => s.size);
      const headerRow = [`[${product.display_name}]`, ...sizes];
      const stockRow = ['재고', ...product.size_stats.map((s) => s.stock)];
      const orderedRow = ['주문', ...product.size_stats.map((s) => s.ordered)];
      const remainRow = ['잔여', ...product.size_stats.map((s) => s.remaining)];

      // 사이즈별 visibleOrders 모으기
      const sizeOrders = product.size_stats.map((s) =>
        s.orders.filter((o) => !EXCLUDED_STATUSES.has(o.status))
      );
      const maxRows = Math.max(0, ...sizeOrders.map((o) => o.length));

      const studentRows = Array.from({ length: maxRows }).map((_, rowIdx) => [
        '',
        ...sizeOrders.map((orders) => orders[rowIdx]?.name ?? ''),
      ]);

      return { cols: sizes.length + 1, rows: [headerRow, stockRow, orderedRow, remainRow, ...studentRows] };
    });

    if (sectionBlocks.length === 0) return;

    const maxRowCount = Math.max(...sectionBlocks.map((b) => b.rows.length));
    const csvRows: (string | number)[][] = [];
    for (let i = 0; i < maxRowCount; i++) {
      const row: (string | number)[] = [];
      sectionBlocks.forEach((block, bi) => {
        if (bi > 0) row.push('');
        const cells = block.rows[i] ?? Array(block.cols).fill('');
        row.push(...cells);
      });
      csvRows.push(row);
    }

    downloadCSV([], csvRows, `${schoolName}_주문예약`);
  };

  const handleStockSubmit = async (items: { product_id: number; size: string; stock: number }[]) => {
    await updateInventoryStock(schoolName, { items });
    fetchInventory();
  };

  return (
    <>
      <AdminHeader
        title={`${schoolName} 주문/예약`}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-[15px] font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap"
              onClick={() => setIsStockModalOpen(true)}
            >
              재고 추가
            </button>
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-[15px] font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap"
              onClick={handleExportCSV}
            >
              CSV 내보내기
            </button>
          </div>
        }
      />

      <div className="border-y border-gray-200 overflow-hidden">
        <div className="flex items-stretch">
          <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
            품목
          </div>
          <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white flex-wrap">
            {productOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    selectedProducts.includes(opt) ||
                    selectedProducts.includes("전체")
                  }
                  onChange={() => toggleProduct(opt)}
                  className="w-4 h-4 accent-gray-500"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          variant="outline"
          className="w-auto px-8 py-2.5 bg-gray-400! text-white! border-gray-400! hover:bg-gray-500!"
          onClick={handleReset}
        >
          초기화
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 text-[14px]">
          로딩 중...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-20 text-red-400 text-[14px]">
          {error}
        </div>
      ) : visibleProducts.length > 0 ? (
        visibleProducts.map((product) => (
          <OrderSizeTable key={product.product_id} product={product} />
        ))
      ) : (
        <div className="flex items-center justify-center py-20 text-gray-400 text-[14px]">
          주문/예약 데이터가 없습니다.
        </div>
      )}

      <StockAddModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        products={allProducts}
        onSubmit={handleStockSubmit}
      />
    </>
  );
};

// ============================================================================
// SchoolDetailPage (메인)
// ============================================================================

export const SchoolDetailPage = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const location = useLocation();
  const [schoolName, setSchoolName] = useState("");

  const isOrdersPage = location.pathname.endsWith("/orders");

  useEffect(() => {
    if (!schoolId) return;
    const targetYear = getTargetYear();
    getSupportedSchoolsByYear(targetYear).then((schools) => {
      const found = schools.find((s) => s.id === Number(schoolId));
      if (found) setSchoolName(found.name);
    });
  }, [schoolId]);

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        {isOrdersPage
          ? schoolName && <OrderReservationTab schoolName={schoolName} />
          : schoolName && <StudentTab schoolName={schoolName} />}
      </div>
    </AdminLayout>
  );
};
