import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import {
  SchoolAddModal,
  SchoolDetailModal,
  ProductAddModal,
  SchoolSelectModal,
} from '@components/organisms';
import type { SchoolPrice, ProductAddData } from '@components/organisms/ProductAddModal';
import { createProduct } from '@/api/product';

import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import {
  getSchoolList,
  updateSupportedSchool,
  deleteSupportedSchool,
  type SchoolListItem,
  type SchoolType,
  type SchoolListParams,
} from '@/api/school';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { downloadCSV } from '@/utils/csvUtils';

interface SchoolRow {
  school_name: string;
  no: number;
  type: string;
  supportYears: string;
  isActive: 'O' | '-';
  isPermanent: boolean;
  measurementPeriod: string;
  registeredDate: string;
  modifiedDate: string;
  _raw: SchoolListItem;
}

const SCHOOL_TYPE_LABEL: Record<SchoolType, string> = {
  '초': '초등학교',
  '중': '중학교',
  '고': '고등학교',
};

const CURRENT_YEAR = new Date().getFullYear();

const YEAR_OPTIONS = [2023, 2024, 2025, 2026];

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}/${mm}/${dd}`;
};

const getMeasurementPeriod = (item: SchoolListItem): string => {
  const currentYearEntry = item.supported_years.find(
    (sy) => sy.year === CURRENT_YEAR
  ) ?? item.supported_years.at(-1);
  if (!currentYearEntry) return '-';
  return `${formatDate(currentYearEntry.measurement_start_date)} ~ ${formatDate(currentYearEntry.measurement_end_date)}`;
};

const toSchoolRow = (item: SchoolListItem, index: number): SchoolRow => ({
  school_name: item.school_name,
  no: index + 1,
  type: SCHOOL_TYPE_LABEL[item.school_type] ?? item.school_type,
  supportYears: item.supported_years.map((sy) => `${sy.year}`).join(', ') || '-',
  isActive: item.is_active ? 'O' : '-',
  isPermanent: item.is_permanent,
  measurementPeriod: getMeasurementPeriod(item),
  registeredDate: item.created_at,
  modifiedDate: item.updated_at,
  _raw: item,
});

export const SchoolListPage = () => {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const [searched, setSearched] = useState(false);

  // 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('통합검색');
  const [typeFilter, setTypeFilter] = useState<SchoolType | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [yearFilter, setYearFilter] = useState<number | 'all' | 'noSupport'>(CURRENT_YEAR);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolListItem | null>(null);
  const [isProductAddModalOpen, setIsProductAddModalOpen] = useState(false);
  const [isSchoolSelectModalOpen, setIsSchoolSelectModalOpen] = useState(false);
  const [selectedSchoolsForProduct, setSelectedSchoolsForProduct] = useState<SchoolPrice[]>([]);

  const sizeTypeToApiSizes = (sizeType: string) => {
    if (!sizeType) return undefined;
    if (sizeType === 'numeric_5') return [{ size: 'numeric', size_type: 'numeric' as const, size_step: 5 as const }];
    if (sizeType === 'numeric_3') return [{ size: 'numeric', size_type: 'numeric' as const, size_step: 3 as const }];
    if (sizeType === 'alpha') return [{ size: 'alpha', size_type: 'alpha' as const }];
    if (sizeType === 'free') return [{ size: 'free', size_type: 'free' as const }];
    return undefined;
  };

  const handleAddProduct = async (data: ProductAddData) => {
    try {
      await createProduct({
        category: data.category,
        gender: data.gender,
        is_repair: data.isRepairable === 'yes' ? true : data.isRepairable === 'no' ? false : undefined,
        is_repair_required: data.isRepairRequired === 'required' ? true : data.isRepairRequired === 'optional' ? false : undefined,
        name: data.displayName,
        price: data.originalPrice,
        season: data.season || undefined,
        sizes: sizeTypeToApiSizes(data.sizeType),
      });
      setIsProductAddModalOpen(false);
      setSelectedSchoolsForProduct([]);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { error?: { message?: string; details?: string | Record<string, string> } } } })?.response?.data?.error;
      const message = errData?.message ?? '상품 추가에 실패했습니다.';
      const details = errData?.details;
      const detailStr = typeof details === 'object' && details !== null ? Object.values(details).join('\n') : (details ?? '');
      alert(detailStr ? `${message}\n\n${detailStr}` : message);
    }
  };

  const buildParams = useCallback((): SchoolListParams => {
    const params: SchoolListParams = {};
    if (typeFilter !== 'all') params.school_type = typeFilter;
    if (activeFilter === 'active') params.is_active = true;
    else if (activeFilter === 'inactive') params.is_active = false;
    if (typeof yearFilter === 'number') params.year = yearFilter;
    return params;
  }, [typeFilter, activeFilter, yearFilter]);

  const fetchSchools = useCallback(async (params?: SchoolListParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSchoolList(params);
      setSchools(data.schools.map(toSchoolRow));
      setTotal(data.total);
      setSearched(true);
    } catch (err) {
      console.error('학교 목록 조회 실패:', err);
      setError(getApiErrorMessage(err, '학교 목록을 불러오는 중 오류가 발생했습니다.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools({ year: CURRENT_YEAR });
  }, [fetchSchools]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSchools(buildParams());
  };

  const handleReset = () => {
    setSearchTerm('');
    setSearchType('통합검색');
    setTypeFilter('all');
    setActiveFilter('all');
    setYearFilter(CURRENT_YEAR);
    setCurrentPage(1);
    fetchSchools({ year: CURRENT_YEAR });
  };

  const handleAddSchool = () => {
    setIsAddModalOpen(false);
    fetchSchools(buildParams());
  };

  const handleOpenDetailModal = (school: SchoolRow) => {
    setSelectedSchool(school._raw);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSchool(null);
  };

  const handleUpdateSchool = async (
    originalName: string,
    data: Parameters<typeof updateSupportedSchool>[1]
  ) => {
    try {
      await updateSupportedSchool(originalName, data);
      handleCloseDetailModal();
      fetchSchools(buildParams());
    } catch (err) {
      alert(getApiErrorMessage(err, '학교 수정에 실패했습니다.'));
    }
  };

  // 클라이언트 측 검색어 필터 (서버 필터 후 추가 필터링)
  const filteredSchools = schools.filter((school) => {
    if (!searchTerm) return true;
    if (searchType === '학교명') return school.school_name.includes(searchTerm);
    return school.school_name.includes(searchTerm) || school.type.includes(searchTerm);
  });

  // 미지원 필터 (year=noSupport는 서버 미지원이므로 클라이언트에서 처리)
  const displaySchools = yearFilter === 'noSupport'
    ? filteredSchools.filter((s) => s._raw.supported_years.length === 0)
    : filteredSchools;

  const handleExportCSV = () => {
    downloadCSV(
      ['No.', '구분', '지원년도', '학교명', '지원여부', '상시지원', '측정기간', '등록일', '수정일'],
      displaySchools.map((s) => [
        s.no, s.type, s.supportYears, s.school_name,
        s.isActive, s.isPermanent ? 'O' : '-',
        s.measurementPeriod, s.registeredDate, s.modifiedDate,
      ]),
      '학교목록',
    );
  };

  const totalPages = Math.ceil(displaySchools.length / itemsPerPage);
  const paginatedSchools = displaySchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns: Column<SchoolRow>[] = [
    { key: 'no', header: 'No.', width: '40px', align: 'center' },
    { key: 'type', header: '구분', width: '80px', align: 'center' },
    { key: 'supportYears', header: '지원년도', width: '120px', align: 'center' },
    { key: 'school_name', header: '학교명', align: 'center' },
    { key: 'isActive', header: '지원여부', width: '65px', align: 'center' },
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
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-neutral-050 text-bg-800"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailModal(school);
            }}
          >
            수정
          </button>
          <button
            className="px-2 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-red-200 text-red-700"
            onClick={async (e) => {
              e.stopPropagation();
              if (!confirm('정말 삭제하시겠습니까?')) return;
              const id = school._raw.supported_years[0]?.id;
              if (id === undefined) {
                alert('학교 ID를 확인할 수 없습니다.');
                return;
              }
              try {
                await deleteSupportedSchool(id);
                fetchSchools(buildParams());
              } catch (err) {
                alert(getApiErrorMessage(err, '학교 삭제에 실패했습니다.'));
              }
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const emptyMessage = loading
    ? '로딩 중...'
    : !searched
    ? '검색 조건을 선택 후 검색해주세요.'
    : error ?? '데이터가 없습니다.';

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="학교"
          buttonLabel="학교추가"
          onButtonClick={() => setIsAddModalOpen(true)}
          actions={
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-15 font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportCSV}
              disabled={displaySchools.length === 0}
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
                <option value="학교명">학교명</option>
              </select>
              <Input
                placeholder="검색어를 입력하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* 구분 + 지원여부 */}
          <div className="flex items-stretch border-b border-gray-200">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              구분
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white border-r border-gray-200">
              {(['all', '초', '중', '고'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="typeFilter"
                    checked={typeFilter === v}
                    onChange={() => setTypeFilter(v)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {v === 'all' ? '전체' : SCHOOL_TYPE_LABEL[v]}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              지원여부
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {(['all', 'active', 'inactive'] as const).map((v) => (
                <label key={v} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="activeFilter"
                    checked={activeFilter === v}
                    onChange={() => setActiveFilter(v)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {v === 'all' ? '전체' : v === 'active' ? '지원' : '미지원'}
                </label>
              ))}
            </div>
          </div>

          {/* 지원년도 */}
          <div className="flex items-stretch">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              지원년도
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              <label className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                <input type="radio" name="yearFilter" checked={yearFilter === 'all'} onChange={() => setYearFilter('all')} className="w-4 h-4 accent-gray-500" />
                전체
              </label>
              <label className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                <input type="radio" name="yearFilter" checked={yearFilter === 'noSupport'} onChange={() => setYearFilter('noSupport')} className="w-4 h-4 accent-gray-500" />
                미지원
              </label>
              {YEAR_OPTIONS.map((y) => (
                <label key={y} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input type="radio" name="yearFilter" checked={yearFilter === y} onChange={() => setYearFilter(y)} className="w-4 h-4 accent-gray-500" />
                  {String(y).slice(2)}년
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
          {searched && !loading && (
            <div className="text-13 text-gray-500 mb-2">총 {total}건</div>
          )}
          <Table
            columns={columns}
            data={loading ? [] : paginatedSchools}
            onRowClick={(school) => handleOpenDetailModal(school)}
            emptyMessage={emptyMessage}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <SchoolAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSchool}
        onAddNewProduct={() => setIsProductAddModalOpen(true)}
      />

      <SchoolDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        school={selectedSchool}
        onUpdate={handleCloseDetailModal}
        onSubmit={handleUpdateSchool}
        onAddNewProduct={() => setIsProductAddModalOpen(true)}
      />

      <ProductAddModal
        isOpen={isProductAddModalOpen}
        onClose={() => { setIsProductAddModalOpen(false); setSelectedSchoolsForProduct([]); }}
        onSubmit={handleAddProduct}
        onOpenSchoolModal={() => setIsSchoolSelectModalOpen(true)}
        selectedSchools={selectedSchoolsForProduct}
        onRemoveSchool={(id) => setSelectedSchoolsForProduct((prev) => prev.filter((s) => s.schoolId !== id))}
        onSchoolPriceChange={(id, price) => setSelectedSchoolsForProduct((prev) => prev.map((s) => s.schoolId === id ? { ...s, price } : s))}
        zIndex={1100}
      />

      <SchoolSelectModal
        isOpen={isSchoolSelectModalOpen}
        onClose={() => setIsSchoolSelectModalOpen(false)}
        onSubmit={(schoolId, schoolName, price, year) => {
          setSelectedSchoolsForProduct((prev) =>
            prev.find((s) => s.schoolId === schoolId)
              ? prev
              : [...prev, { schoolId, schoolName, price, year }]
          );
          setIsSchoolSelectModalOpen(false);
        }}
        zIndex={1200}
      />
    </AdminLayout>
  );
};
