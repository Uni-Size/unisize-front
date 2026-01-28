import { useState } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import {
  SchoolAddModal,
  SchoolDetailModal,
  ProductAddModal,
} from '@components/organisms';
import type { SchoolProductItem, SchoolAddData } from '@components/organisms/SchoolAddModal';
import type { SchoolDetailData, PurchaseInfo } from '@components/organisms/SchoolDetailModal';
import type { SchoolPrice, ProductAddData } from '@components/organisms/ProductAddModal';
import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import './SchoolListPage.css';

interface School {
  id: string;
  no: number;
  type: '초등학교' | '중학교' | '고등학교';
  supportYear: string;
  schoolName: string;
  isActive: 'O' | '-';
  measurementPeriod: string;
  registeredDate: string;
  modifiedDate: string;
}

const mockSchools: School[] = [
  { id: '1', no: 1, type: '중학교', supportYear: '2026', schoolName: '가경중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '2', no: 2, type: '중학교', supportYear: '2026', schoolName: '경덕중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '3', no: 3, type: '중학교', supportYear: '2026', schoolName: '복대중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '4', no: 4, type: '중학교', supportYear: '2026', schoolName: '산남중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '5', no: 5, type: '중학교', supportYear: '2026', schoolName: '생명중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '6', no: 6, type: '중학교', supportYear: '2026', schoolName: '세광중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '7', no: 7, type: '중학교', supportYear: '2026', schoolName: '용성중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '8', no: 8, type: '중학교', supportYear: '2026', schoolName: '율량중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '9', no: 9, type: '중학교', supportYear: '2026', schoolName: '중앙여자중학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '10', no: 10, type: '고등학교', supportYear: '2026', schoolName: '세광고등학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '11', no: 11, type: '고등학교', supportYear: '2026', schoolName: '오창고등학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
  { id: '12', no: 12, type: '고등학교', supportYear: '2026', schoolName: '청주고등학교', isActive: 'O', measurementPeriod: '25/12/12 ~ 25/12/16', registeredDate: '25/12/16', modifiedDate: '25/12/16' },
];

export const SchoolListPage = () => {
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
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<SchoolDetailData | null>(null);
  const [winterProducts, setWinterProducts] = useState<SchoolProductItem[]>([]);
  const [summerProducts, setSummerProducts] = useState<SchoolProductItem[]>([]);
  const [currentSeason, setCurrentSeason] = useState<'winter' | 'summer'>('winter');
  const [productModalSelectedSchools, setProductModalSelectedSchools] = useState<SchoolPrice[]>([]);

  const handleOpenAddModal = () => {
    setWinterProducts([]);
    setSummerProducts([]);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setWinterProducts([]);
    setSummerProducts([]);
  };

  const handleAddSchool = (data: SchoolAddData) => {
    console.log('Add school:', data);
    handleCloseAddModal();
  };

  const handleOpenDetailModal = (school: School) => {
    const detailData: SchoolDetailData = {
      id: school.id,
      schoolName: school.schoolName,
      registeredDate: '2026.01.09 15:23',
      lastModifiedDate: '2026.01.10 15:23',
      purchases: [
        {
          id: 'purchase-1',
          purchaseStatus: 'in-progress',
          purchaseYear: '2026',
          expectedStudents: 183,
          measurementStartDate: '2022.01.03',
          measurementEndDate: '2022.01.11',
        },
        {
          id: 'purchase-2',
          purchaseStatus: 'completed',
          purchaseYear: '2022',
          expectedStudents: 135,
          measurementStartDate: '2026.01.09',
          measurementEndDate: '2026.01.15',
        },
      ],
      winterProducts: [
        { id: 'wp-1', category: 'hood', gender: 'unisex', displayName: '용성중 후드집업', contractPrice: 78000, freeQuantity: 1 },
        { id: 'wp-2', category: 'top', gender: 'unisex', displayName: '용성중 셔츠', contractPrice: 46000, freeQuantity: 1 },
        { id: 'wp-3', category: 'bottom', gender: 'unisex', displayName: '용성중 온고무줌 바지', contractPrice: 76000, freeQuantity: 1 },
      ],
      summerProducts: [
        { id: 'sp-1', category: 'top', gender: 'unisex', displayName: '용성중 카라반팔티', contractPrice: 54000, freeQuantity: 1 },
        { id: 'sp-2', category: 'bottom', gender: 'unisex', displayName: '용성중 반바지', contractPrice: 44000, freeQuantity: 1 },
      ],
    };
    setSelectedSchool(detailData);
    setWinterProducts(detailData.winterProducts);
    setSummerProducts(detailData.summerProducts);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedSchool(null);
    setWinterProducts([]);
    setSummerProducts([]);
  };

  const handleUpdateSchool = (data: SchoolDetailData) => {
    console.log('Update school:', data);
    handleCloseDetailModal();
  };

  const handleOpenProductModal = (season: 'winter' | 'summer') => {
    setCurrentSeason(season);
    setProductModalSelectedSchools([]);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setProductModalSelectedSchools([]);
  };

  const handleAddProduct = (data: ProductAddData) => {
    const newProduct: SchoolProductItem = {
      id: `product-${Date.now()}`,
      category: data.category,
      gender: data.gender,
      displayName: data.displayName,
      contractPrice: data.originalPrice,
      freeQuantity: 1,
    };

    if (currentSeason === 'winter') {
      setWinterProducts((prev) => [...prev, newProduct]);
    } else {
      setSummerProducts((prev) => [...prev, newProduct]);
    }
    handleCloseProductModal();
  };

  const handleRemoveProduct = (season: 'winter' | 'summer', productId: string) => {
    if (season === 'winter') {
      setWinterProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setSummerProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleProductChange = (
    season: 'winter' | 'summer',
    productId: string,
    field: keyof SchoolProductItem,
    value: string | number
  ) => {
    const updateFn = (prev: SchoolProductItem[]) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p));

    if (season === 'winter') {
      setWinterProducts(updateFn);
    } else {
      setSummerProducts(updateFn);
    }
  };

  const columns: Column<School>[] = [
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
        <div className="school-list-page__action-buttons">
          <button
            className="school-list-page__action-btn school-list-page__action-btn--edit"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailModal(school);
            }}
          >
            수정
          </button>
          <button
            className="school-list-page__action-btn school-list-page__action-btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete school:', school.id);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const filteredSchools = mockSchools.filter(
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
      <div className="school-list-page">
        <AdminHeader
          title="학교"
          buttonLabel="학교추가"
          onButtonClick={handleOpenAddModal}
        />

        <div className="school-list-page__filters">
          <div className="school-list-page__filter-row">
            <span className="school-list-page__filter-label">검색어</span>
            <select
              className="school-list-page__select"
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

          <div className="school-list-page__filter-row">
            <span className="school-list-page__filter-label">구분</span>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={typeFilters.all} onChange={() => setTypeFilters({...typeFilters, all: !typeFilters.all})} />
              전체
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={typeFilters.elementary} onChange={() => setTypeFilters({...typeFilters, elementary: !typeFilters.elementary})} />
              초등학교
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={typeFilters.middle} onChange={() => setTypeFilters({...typeFilters, middle: !typeFilters.middle})} />
              중학교
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={typeFilters.high} onChange={() => setTypeFilters({...typeFilters, high: !typeFilters.high})} />
              고등학교
            </label>

            <span className="school-list-page__filter-label">활성</span>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={activeFilters.all} onChange={() => setActiveFilters({...activeFilters, all: !activeFilters.all})} />
              전체
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={activeFilters.active} onChange={() => setActiveFilters({...activeFilters, active: !activeFilters.active})} />
              활성
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={activeFilters.inactive} onChange={() => setActiveFilters({...activeFilters, inactive: !activeFilters.inactive})} />
              비활성
            </label>
          </div>

          <div className="school-list-page__filter-row">
            <span className="school-list-page__filter-label">지원년도</span>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={yearFilters.all} onChange={() => setYearFilters({...yearFilters, all: !yearFilters.all})} />
              전체
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={yearFilters.noSupport} onChange={() => setYearFilters({...yearFilters, noSupport: !yearFilters.noSupport})} />
              미지원
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={yearFilters.y23} onChange={() => setYearFilters({...yearFilters, y23: !yearFilters.y23})} />
              23년
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={yearFilters.y24} onChange={() => setYearFilters({...yearFilters, y24: !yearFilters.y24})} />
              24년
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={yearFilters.y25} onChange={() => setYearFilters({...yearFilters, y25: !yearFilters.y25})} />
              25년
            </label>
            <label className="school-list-page__checkbox-label">
              <input type="checkbox" checked={yearFilters.y26} onChange={() => setYearFilters({...yearFilters, y26: !yearFilters.y26})} />
              26년
            </label>
          </div>

          <div className="school-list-page__filter-actions">
            <Button variant="primary">검색</Button>
            <Button variant="outline">초기화</Button>
          </div>
        </div>

        <div className="school-list-page__content">
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
        </div>
      </div>

      <SchoolAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddSchool}
        onOpenProductModal={handleOpenProductModal}
        winterProducts={winterProducts}
        summerProducts={summerProducts}
        onRemoveProduct={handleRemoveProduct}
        onProductChange={handleProductChange}
      />

      <SchoolDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        school={selectedSchool}
        onUpdate={handleUpdateSchool}
        onOpenProductModal={handleOpenProductModal}
        winterProducts={winterProducts}
        summerProducts={summerProducts}
        onRemoveProduct={handleRemoveProduct}
        onProductChange={handleProductChange}
      />

      <ProductAddModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        onSubmit={handleAddProduct}
        onOpenSchoolModal={() => {}}
        selectedSchools={productModalSelectedSchools}
        onRemoveSchool={() => {}}
        onSchoolPriceChange={() => {}}
      />
    </AdminLayout>
  );
};
