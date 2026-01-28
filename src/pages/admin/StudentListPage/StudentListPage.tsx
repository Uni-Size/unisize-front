import { useState } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import './StudentListPage.css';

interface Student {
  id: string;
  no: number;
  category: '신입' | '재학';
  school: string;
  name: string;
  gender: '남' | '여';
  studentPhone: string;
  parentPhone: string;
  governmentPurchase: 'O' | 'X';
  registeredDate: string;
}

const mockStudents: Student[] = Array.from({ length: 7 }, (_, i) => ({
  id: String(i + 1),
  no: i + 1,
  category: '신입',
  school: '용성중학교',
  name: '김인철',
  gender: '남',
  studentPhone: '010-5571-8239',
  parentPhone: '010-4810-2606',
  governmentPurchase: 'O',
  registeredDate: '25/12/12',
}));

export const StudentListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('통합검색');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [purchaseFilter, setPurchaseFilter] = useState('전체');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const columns: Column<Student>[] = [
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
      render: () => (
        <div className="student-list-page__actions-cell">
          <Button variant="primary" size="small">추가</Button>
          <div className="student-list-page__action-buttons">
            <button className="student-list-page__action-btn student-list-page__action-btn--edit">수정</button>
            <button className="student-list-page__action-btn student-list-page__action-btn--delete">삭제</button>
          </div>
        </div>
      ),
    },
  ];

  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.includes(searchTerm) ||
      student.studentPhone.includes(searchTerm) ||
      student.school.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="student-list-page">
        <AdminHeader
          title="학생"
          buttonLabel="학생추가"
          onButtonClick={() => console.log('학생추가 클릭')}
        />

        <div className="student-list-page__filters">
          <div className="student-list-page__filter-row">
            <Input
              placeholder="검색어"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="student-list-page__select"
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

          <div className="student-list-page__filter-row">
            <span className="student-list-page__filter-label">학년</span>
            <label className="student-list-page__checkbox-label">
              <input type="radio" name="category" checked={categoryFilter === '전체'} onChange={() => setCategoryFilter('전체')} />
              전체
            </label>
            <label className="student-list-page__checkbox-label">
              <input type="radio" name="category" checked={categoryFilter === '신입'} onChange={() => setCategoryFilter('신입')} />
              신입
            </label>
            <label className="student-list-page__checkbox-label">
              <input type="radio" name="category" checked={categoryFilter === '재학'} onChange={() => setCategoryFilter('재학')} />
              재학
            </label>

            <span className="student-list-page__filter-label">주관구매</span>
            <label className="student-list-page__checkbox-label">
              <input type="radio" name="purchase" checked={purchaseFilter === '전체'} onChange={() => setPurchaseFilter('전체')} />
              전체
            </label>
            <label className="student-list-page__checkbox-label">
              <input type="radio" name="purchase" checked={purchaseFilter === '신청'} onChange={() => setPurchaseFilter('신청')} />
              신청
            </label>
            <label className="student-list-page__checkbox-label">
              <input type="radio" name="purchase" checked={purchaseFilter === '미신청'} onChange={() => setPurchaseFilter('미신청')} />
              미신청
            </label>
          </div>

          <div className="student-list-page__filter-actions">
            <Button variant="primary">검색</Button>
            <Button variant="outline">초기화</Button>
          </div>
        </div>

        <div className="student-list-page__content">
          <Table
            columns={columns}
            data={paginatedStudents}
            onRowClick={(student) => console.log('Student clicked:', student)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </AdminLayout>
  );
};
