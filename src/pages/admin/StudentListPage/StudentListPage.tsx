import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { StudentModal } from '@components/organisms/StudentModal';
import type { StudentDetailData, StudentFormInput } from '@components/organisms/StudentModal';
import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import { getStudents, getStudentDetail, deleteStudent } from '@/api/student';
import type { AdminStudent } from '@/api/student';

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
  const itemsPerPage = 10;

  // 모달 state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetailData | null>(null);

  const mapToRow = (student: AdminStudent, index: number, page: number): StudentRow => ({
    id: student.id,
    no: (page - 1) * itemsPerPage + index + 1,
    category: student.grade === 1 ? '신입' : '재학',
    school: student.school_name,
    name: student.name,
    gender: student.gender === 'M' ? '남' : student.gender === 'F' ? '여' : student.gender === 'U' ? '공용' : student.gender,
    studentPhone: student.student_phone,
    parentPhone: student.guardian_phone,
    governmentPurchase: student.government_purchase ? 'O' : 'X',
    registeredDate: student.created_at ? new Date(student.created_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' }) : '',
  });

  const fetchStudents = useCallback(async (page: number, search?: string, school?: string, grade?: number) => {
    setLoading(true);
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
    } catch (error) {
      console.error('학생 목록 조회 실패:', error);
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

  const handleAddStudent = (data: StudentFormInput) => {
    console.log('학생 추가:', data);
    fetchStudents(currentPage);
  };

  const handleEditStudent = (data: StudentFormInput) => {
    console.log('학생 수정:', data);
    fetchStudents(currentPage);
  };

  const handleRowClick = async (student: StudentRow) => {
    try {
      const detail = await getStudentDetail(student.id);
      const detailData: StudentDetailData = {
        id: String(detail.id),
        admissionSchool: detail.school_name,
        previousSchool: detail.previous_school,
        classNumber: detail.class_name || '',
        name: detail.name,
        gender: detail.gender,
        studentPhone: detail.student_phone,
        guardianPhone: detail.guardian_phone,
        registeredDate: detail.created_at ? new Date(detail.created_at).toLocaleDateString('ko-KR') : '',
        winterUniforms: [],
        summerUniforms: [],
        supplies: [],
        nameTag: { orderQuantity: 0, attachQuantity: 0 },
      };
      setSelectedStudent(detailData);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('학생 상세 조회 실패:', error);
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
        <div className="flex flex-col items-center gap-1">
          <Button variant="primary" size="small">추가</Button>
          <div className="flex gap-1">
            <button className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#e5e7eb] text-[#374151]">수정</button>
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
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="학생"
          buttonLabel="학생추가"
          onButtonClick={() => setIsAddModalOpen(true)}
        />

        <div className="border-y border-gray-200 overflow-hidden">
          {/* 검색어 */}
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

          {/* 학년 + 주관구매 (같은 행) */}
          <div className="flex items-stretch">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
              학년
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white border-r border-gray-200">
              {[
                { value: '전체', label: '전체' },
                { value: '신입', label: '신입' },
                { value: '재학', label: '재학' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer">
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
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
              주관구매
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {[
                { value: '전체', label: '전체' },
                { value: '신청', label: '신청' },
                { value: '미신청', label: '미신청' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer">
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
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#959595]">로딩 중...</div>
          ) : (
            <>
              <Table
                columns={columns}
                data={students}
                onRowClick={handleRowClick}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
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
      </div>
    </AdminLayout>
  );
};
