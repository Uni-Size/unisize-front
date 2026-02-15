import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import {
  SchoolAddModal,
  SchoolDetailModal,
} from '@components/organisms';


import type { SchoolDetailData } from '@components/organisms/SchoolDetailModal';
import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import { getSupportedSchoolsByYear, deleteSupportedSchool, type School as ApiSchool } from '@/api/school';
import { getTargetYear } from '@/utils/schoolUtils';

interface SchoolRow {
  id: number;
  no: number;
  type: '초등학교' | '중학교' | '고등학교';
  supportYear: string;
  schoolName: string;
  isActive: 'O' | '-';
  measurementPeriod: string;
  registeredDate: string;
  modifiedDate: string;
}

const getSchoolType = (name: string): '초등학교' | '중학교' | '고등학교' => {
  if (name.includes('초등학교')) return '초등학교';
  if (name.includes('고등학교')) return '고등학교';
  return '중학교';
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}/${mm}/${dd}`;
};

const toSchoolRow = (item: ApiSchool, index: number): SchoolRow => ({
  id: item.id,
  no: index + 1,
  type: getSchoolType(item.name),
  supportYear: String(item.year),
  schoolName: item.name,
  isActive: 'O',
  measurementPeriod:
    item.measurement_start_date && item.measurement_end_date
      ? `${formatDate(item.measurement_start_date)} ~ ${formatDate(item.measurement_end_date)}`
      : '-',
  registeredDate: formatDate(item.created_at),
  modifiedDate: formatDate(item.updated_at),
});

export const SchoolListPage = () => {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('통합검색');
  const [typeFilters, setTypeFilters] = useState({ all: true, elementary: false, middle: false, high: false });
  const [activeFilters, setActiveFilters] = useState({ all: true, active: false, inactive: false });
  const [yearFilters, setYearFilters] = useState({ all: true, noSupport: false, y23: false, y24: false, y25: false, y26: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetailData | null>(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const year = getTargetYear();
      const data = await getSupportedSchoolsByYear(year);
      setSchools(data.map(toSchoolRow));
    } catch (error) {
      console.error('학교 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleAddSchool = () => {
    setIsAddModalOpen(false);
    fetchSchools();
  };

  const handleOpenDetailModal = (school: SchoolRow) => {
    const detailData: SchoolDetailData = {
      id: String(school.id),
      schoolName: school.schoolName,
      registeredDate: school.registeredDate,
      lastModifiedDate: school.modifiedDate,
      purchases: [],
      winterProducts: [],
      summerProducts: [],
    };
    setSelectedSchool(detailData);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSchool(null);
  };

  const handleUpdateSchool = (data: SchoolDetailData) => {
    console.log('Update school:', data);
    handleCloseDetailModal();
    fetchSchools();
  };

  const columns: Column<SchoolRow>[] = [
    { key: 'no', header: 'No.', width: '40px', align: 'center' },
    { key: 'type', header: '구분', width: '80px', align: 'center' },
    { key: 'supportYear', header: '지원년도', width: '80px', align: 'center' },
    { key: 'schoolName', header: '학교명', align: 'center' },
    { key: 'isActive', header: '활성', width: '50px', align: 'center' },
    { key: 'measurementPeriod', header: '측정기간', width: '150px', align: 'center' },
    { key: 'registeredDate', header: '등록일', width: '80px', align: 'center' },
    { key: 'modifiedDate', header: '수정일', width: '80px', align: 'center' },
    {
      key: 'actions',
      header: '관리',
      width: '80px',
      align: 'center',
      render: (school) => (
        <div className="flex gap-1">
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#e5e7eb] text-[#374151]"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailModal(school);
            }}
          >
            수정
          </button>
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#fecaca] text-[#991b1b]"
            onClick={async (e) => {
              e.stopPropagation();
              if (!confirm('정말 삭제하시겠습니까?')) return;
              try {
                await deleteSupportedSchool(school.id);
                fetchSchools();
              } catch (error) {
                console.error('학교 삭제 실패:', error);
              }
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const filteredSchools = schools.filter(
    (school) =>
      school.schoolName.includes(searchTerm) || school.type.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="학교"
          buttonLabel="학교추가"
          onButtonClick={() => setIsAddModalOpen(true)}
        />

        <div className="flex flex-col gap-3 p-4 bg-[#fafafa] rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-normal text-[#374151] min-w-12.5">검색어</span>
            <select
              className="h-10 px-3 py-2 border border-gray-200 rounded-lg text-[15px] text-gray-700 bg-white"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="통합검색">통합검색</option>
              <option value="학교명">학교명</option>
            </select>
            <Input
              placeholder="검색어를 입력하세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[15px] font-normal text-[#374151] min-w-12.5">구분</span>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={typeFilters.all} onChange={() => setTypeFilters({...typeFilters, all: !typeFilters.all})} />
              전체
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={typeFilters.elementary} onChange={() => setTypeFilters({...typeFilters, elementary: !typeFilters.elementary})} />
              초등학교
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={typeFilters.middle} onChange={() => setTypeFilters({...typeFilters, middle: !typeFilters.middle})} />
              중학교
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={typeFilters.high} onChange={() => setTypeFilters({...typeFilters, high: !typeFilters.high})} />
              고등학교
            </label>

            <span className="text-[15px] font-normal text-[#374151] min-w-12.5">활성</span>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={activeFilters.all} onChange={() => setActiveFilters({...activeFilters, all: !activeFilters.all})} />
              전체
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={activeFilters.active} onChange={() => setActiveFilters({...activeFilters, active: !activeFilters.active})} />
              활성
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={activeFilters.inactive} onChange={() => setActiveFilters({...activeFilters, inactive: !activeFilters.inactive})} />
              비활성
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[15px] font-normal text-[#374151] min-w-12.5">지원년도</span>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={yearFilters.all} onChange={() => setYearFilters({...yearFilters, all: !yearFilters.all})} />
              전체
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={yearFilters.noSupport} onChange={() => setYearFilters({...yearFilters, noSupport: !yearFilters.noSupport})} />
              미지원
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={yearFilters.y23} onChange={() => setYearFilters({...yearFilters, y23: !yearFilters.y23})} />
              23년
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={yearFilters.y24} onChange={() => setYearFilters({...yearFilters, y24: !yearFilters.y24})} />
              24년
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={yearFilters.y25} onChange={() => setYearFilters({...yearFilters, y25: !yearFilters.y25})} />
              25년
            </label>
            <label className="flex items-center gap-1 text-[15px] text-[#374151] cursor-pointer">
              <input type="checkbox" checked={yearFilters.y26} onChange={() => setYearFilters({...yearFilters, y26: !yearFilters.y26})} />
              26년
            </label>
          </div>

          <div className="flex justify-center gap-3 mt-2">
            <Button variant="primary" className="w-auto px-6 py-2">검색</Button>
            <Button variant="outline" className="w-auto px-6 py-2">초기화</Button>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div>불러오는 중...</div>
          ) : (
            <>
              <Table
                columns={columns}
                data={paginatedSchools}
                onRowClick={(school) => handleOpenDetailModal(school)}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      <SchoolAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSchool}
      />

      <SchoolDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        school={selectedSchool}
        onUpdate={handleUpdateSchool}
      />
    </AdminLayout>
  );
};
