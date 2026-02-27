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

// 사이즈 목록
const SIZES = [
  "85",
  "90",
  "95",
  "100",
  "105",
  "110",
  "115",
  "120",
  "125",
  "130",
  "135",
];

interface SizeData {
  ordered: number;
  purchased: number;
}

interface ProductSizeRow {
  studentName: string;
  gender: string;
  sizes: Record<string, string>;
  reserved?: boolean;
}

interface ProductSection {
  name: string;
  sizeTotals: Record<string, SizeData>;
  rows: ProductSizeRow[];
}

const OrderReservationTab = ({ schoolName }: { schoolName: string }) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>(["전체"]);
  const productOptions = [
    "전체",
    "후드",
    "셔츠",
    "바지",
    "생활복 상의",
    "라운드티",
  ];

  // TODO: 실제 API 연동 시 학교별 주문/재고 데이터를 가져오도록 교체
  const [sections] = useState<ProductSection[]>([]);

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

  const renderSizeHeader = (sizeTotals: Record<string, SizeData>) => (
    <tr className="bg-gray-50">
      {SIZES.map((size) => {
        const data = sizeTotals[size] || { ordered: 0, purchased: 0 };
        const remaining = data.ordered - data.purchased;
        return (
          <td
            key={size}
            className="border border-gray-200 px-2 py-1.5 text-center text-[13px] font-medium"
          >
            <div>
              {data.ordered} ({data.purchased})
            </div>
            {remaining !== 0 && (
              <div
                className={
                  remaining < 0 ? "text-red-600 font-bold" : "text-blue-600"
                }
              >
                잔여 {remaining}
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );

  const renderProductSection = (section: ProductSection) => (
    <div key={section.name} className="mb-6">
      <h3 className="text-[15px] font-medium text-gray-800 mb-2">
        {section.name}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="bg-gray-100">
              {SIZES.map((size) => (
                <th
                  key={size}
                  className="border border-gray-200 px-2 py-2 text-center font-medium min-w-[70px]"
                >
                  {size} ({section.sizeTotals[size]?.ordered ?? 0})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderSizeHeader(section.sizeTotals)}
            {section.rows.map((row, idx) => (
              <tr key={idx} className={row.reserved ? "bg-yellow-50" : ""}>
                {SIZES.map((size) => (
                  <td
                    key={size}
                    className="border border-gray-200 px-2 py-1.5 text-center text-[13px]"
                  >
                    {row.sizes[size] || ""}
                    {row.sizes[size] && (
                      <span className="ml-1 text-gray-400 text-[11px]">
                        {row.reserved ? "예약" : ""}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const handleSearch = () => {
    // TODO: 검색 API 연동
  };

  const handleReset = () => {
    setSelectedProducts(["전체"]);
  };

  return (
    <>
      <AdminHeader title={`${schoolName} 주문/예약`} />

      <div className="border-y border-gray-200 overflow-hidden">
        <div className="flex items-stretch">
          <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
            품목
          </div>
          <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
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

      {sections.length > 0 ? (
        sections.map(renderProductSection)
      ) : (
        <div className="flex items-center justify-center py-20 text-gray-400 text-[14px]">
          주문/예약 데이터가 없습니다.
        </div>
      )}
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
