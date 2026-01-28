import { useState } from 'react';
import { AdminLayout } from '@components/templates/AdminLayout';
import { AdminHeader } from '@components/organisms/AdminHeader';
import {
  ProductAddModal,
  ProductDetailModal,
  SchoolSelectModal,
} from '@components/organisms';
import type { SchoolPrice, ProductAddData } from '@components/organisms/ProductAddModal';
import type { ProductDetailData } from '@components/organisms/ProductDetailModal';
import { Table } from '@components/atoms/Table';
import { Input } from '@components/atoms/Input';
import { Button } from '@components/atoms/Button';
import { Pagination } from '@components/atoms/Pagination';
import type { Column } from '@components/atoms/Table';
import './ProductListPage.css';

interface Product {
  id: string;
  no: number;
  season: '동복' | '하복' | '사계절';
  category: '셔츠' | '바지' | '치마' | '상의' | '하의';
  gender: '남' | '여';
  productName: string;
  schoolCount: number;
  stockStatus: '정상' | '부족' | '품절';
  createdDate: string;
  modifiedDate: string;
}

const mockProducts: Product[] = [
  { id: '1', no: 1, season: '동복', category: '셔츠', gender: '남', productName: '흰색 각카라 블라우스', schoolCount: 5, stockStatus: '정상', createdDate: '25/12/12', modifiedDate: '25/12/12' },
  { id: '2', no: 2, season: '하복', category: '셔츠', gender: '남', productName: '흰색 각카라 블라우스', schoolCount: 5, stockStatus: '정상', createdDate: '25/12/12', modifiedDate: '25/12/12' },
  { id: '3', no: 3, season: '사계절', category: '셔츠', gender: '남', productName: '흰색 각카라 블라우스', schoolCount: 5, stockStatus: '정상', createdDate: '25/12/12', modifiedDate: '25/12/12' },
  { id: '4', no: 4, season: '동복', category: '셔츠', gender: '남', productName: '흰색 각카라 블라우스', schoolCount: 5, stockStatus: '정상', createdDate: '25/12/12', modifiedDate: '25/12/12' },
  { id: '5', no: 5, season: '하복', category: '셔츠', gender: '남', productName: '흰색 각카라 블라우스', schoolCount: 5, stockStatus: '정상', createdDate: '25/12/12', modifiedDate: '25/12/12' },
];

const mockSchools = [
  { id: 'school-1', name: '복대중학교' },
  { id: 'school-2', name: '오창고등학교' },
  { id: 'school-3', name: '생명중학교' },
  { id: 'school-4', name: '청주고등학교' },
  { id: 'school-5', name: '세광중학교' },
];

const getSeasonValue = (season: string) => {
  switch (season) {
    case '동복':
      return 'winter';
    case '하복':
      return 'summer';
    case '사계절':
      return 'spring-fall';
    default:
      return '';
  }
};

const getCategoryValue = (category: string) => {
  switch (category) {
    case '셔츠':
      return 'shirt';
    case '바지':
      return 'pants';
    case '치마':
      return 'skirt';
    default:
      return '';
  }
};

const getGenderValue = (gender: string) => {
  switch (gender) {
    case '남':
      return 'male';
    case '여':
      return 'female';
    default:
      return '';
  }
};

export const ProductListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('통합검색');
  const [seasonFilters, setSeasonFilters] = useState({ all: true, winter: false, summer: false, allSeason: false });
  const [genderFilters, setGenderFilters] = useState({ all: true, female: false, male: false, unisex: false });
  const [categoryFilters, setCategoryFilters] = useState({ all: true, top: false, bottom: false, supplies: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetailData | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<SchoolPrice[]>([]);
  const [modalContext, setModalContext] = useState<'add' | 'detail'>('add');

  const handleOpenAddModal = () => {
    setSelectedSchools([]);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedSchools([]);
  };

  const handleAddProduct = (data: ProductAddData) => {
    console.log('Add product:', data);
    handleCloseAddModal();
  };

  const handleOpenDetailModal = (product: Product) => {
    const detailData: ProductDetailData = {
      id: product.id,
      season: getSeasonValue(product.season),
      category: getCategoryValue(product.category),
      gender: getGenderValue(product.gender),
      displayName: product.productName,
      originalPrice: 45000,
      isRepairable: 'no',
      isRepairRequired: 'optional',
      sizeUnit: '5',
      schools: [
        { schoolId: 'school-1', schoolName: '복대중학교', price: 45000, year: '2026' },
        { schoolId: 'school-2', schoolName: '오창고등학교', price: 52000, year: '2026' },
        { schoolId: 'school-3', schoolName: '생명중학교', price: 32000, year: '2025' },
      ],
    };
    setSelectedProduct(detailData);
    setSelectedSchools(detailData.schools);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
    setSelectedSchools([]);
  };

  const handleUpdateProduct = (data: ProductDetailData) => {
    console.log('Update product:', data);
    handleCloseDetailModal();
  };

  const handleOpenSchoolModal = (context: 'add' | 'detail') => {
    setModalContext(context);
    setIsSchoolModalOpen(true);
  };

  const handleCloseSchoolModal = () => {
    setIsSchoolModalOpen(false);
  };

  const handleAddSchool = (schoolId: string, schoolName: string, price: number, year: string) => {
    const newSchool: SchoolPrice = { schoolId, schoolName, price, year };
    setSelectedSchools((prev) => {
      if (prev.find((s) => s.schoolId === schoolId && s.year === year)) {
        return prev;
      }
      return [...prev, newSchool];
    });
  };

  const handleRemoveSchool = (schoolId: string) => {
    setSelectedSchools((prev) => prev.filter((s) => s.schoolId !== schoolId));
  };

  const handleSchoolPriceChange = (schoolId: string, price: number) => {
    setSelectedSchools((prev) =>
      prev.map((s) => (s.schoolId === schoolId ? { ...s, price } : s))
    );
  };

  const columns: Column<Product>[] = [
    { key: 'no', header: 'No.', width: '40px', align: 'center' },
    { key: 'season', header: '시즌', width: '60px', align: 'center' },
    { key: 'category', header: '카테고리', width: '80px', align: 'center' },
    { key: 'gender', header: '성별', width: '40px', align: 'center' },
    { key: 'productName', header: '상품명', align: 'center' },
    { key: 'schoolCount', header: '사용학교', width: '70px', align: 'center' },
    { key: 'stockStatus', header: '재고상태', width: '70px', align: 'center' },
    { key: 'createdDate', header: '생성일', width: '80px', align: 'center' },
    { key: 'modifiedDate', header: '수정일', width: '80px', align: 'center' },
    {
      key: 'detail',
      header: '상세',
      width: '40px',
      align: 'center',
      render: (product) => (
        <button
          className="detail-button"
          aria-label="상세 보기"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetailModal(product);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      width: '80px',
      align: 'center',
      render: (product) => (
        <div className="product-list-page__action-buttons">
          <button
            className="product-list-page__action-btn product-list-page__action-btn--edit"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailModal(product);
            }}
          >
            수정
          </button>
          <button
            className="product-list-page__action-btn product-list-page__action-btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Delete product:', product.id);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.productName.includes(searchTerm) ||
      product.season.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AdminLayout>
      <div className="product-list-page">
        <AdminHeader
          title="교복/용품"
          buttonLabel="품목추가"
          onButtonClick={handleOpenAddModal}
        />

        <div className="product-list-page__filters">
          <div className="product-list-page__filter-row">
            <span className="product-list-page__filter-label">검색어</span>
            <select
              className="product-list-page__select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="통합검색">통합검색</option>
              <option value="상품명">상품명</option>
            </select>
            <Input
              placeholder="검색어를 입력하세요."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="product-list-page__filter-row">
            <span className="product-list-page__filter-label">시즌</span>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={seasonFilters.all} onChange={() => setSeasonFilters({...seasonFilters, all: !seasonFilters.all})} />
              전체
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={seasonFilters.winter} onChange={() => setSeasonFilters({...seasonFilters, winter: !seasonFilters.winter})} />
              동복(winter)
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={seasonFilters.summer} onChange={() => setSeasonFilters({...seasonFilters, summer: !seasonFilters.summer})} />
              하복(summer)
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={seasonFilters.allSeason} onChange={() => setSeasonFilters({...seasonFilters, allSeason: !seasonFilters.allSeason})} />
              사계절(all)
            </label>

            <span className="product-list-page__filter-label">성별</span>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={genderFilters.all} onChange={() => setGenderFilters({...genderFilters, all: !genderFilters.all})} />
              전체
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={genderFilters.female} onChange={() => setGenderFilters({...genderFilters, female: !genderFilters.female})} />
              여자(F)
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={genderFilters.male} onChange={() => setGenderFilters({...genderFilters, male: !genderFilters.male})} />
              남자(M)
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={genderFilters.unisex} onChange={() => setGenderFilters({...genderFilters, unisex: !genderFilters.unisex})} />
              공용(U)
            </label>
          </div>

          <div className="product-list-page__filter-row">
            <span className="product-list-page__filter-label">카테고리</span>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={categoryFilters.all} onChange={() => setCategoryFilters({...categoryFilters, all: !categoryFilters.all})} />
              전체
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={categoryFilters.top} onChange={() => setCategoryFilters({...categoryFilters, top: !categoryFilters.top})} />
              상의
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={categoryFilters.bottom} onChange={() => setCategoryFilters({...categoryFilters, bottom: !categoryFilters.bottom})} />
              하의
            </label>
            <label className="product-list-page__checkbox-label">
              <input type="checkbox" checked={categoryFilters.supplies} onChange={() => setCategoryFilters({...categoryFilters, supplies: !categoryFilters.supplies})} />
              용품
            </label>
          </div>

          <div className="product-list-page__filter-actions">
            <Button variant="primary">검색</Button>
            <Button variant="outline">초기화</Button>
          </div>
        </div>

        <div className="product-list-page__content">
          <Table
            columns={columns}
            data={paginatedProducts}
            onRowClick={(product) => handleOpenDetailModal(product)}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ProductAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddProduct}
        onOpenSchoolModal={() => handleOpenSchoolModal('add')}
        selectedSchools={selectedSchools}
        onRemoveSchool={handleRemoveSchool}
        onSchoolPriceChange={handleSchoolPriceChange}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
        onOpenSchoolModal={() => handleOpenSchoolModal('detail')}
        selectedSchools={selectedSchools}
        onRemoveSchool={handleRemoveSchool}
        onSchoolPriceChange={handleSchoolPriceChange}
      />

      <SchoolSelectModal
        isOpen={isSchoolModalOpen}
        onClose={handleCloseSchoolModal}
        onSubmit={handleAddSchool}
        schools={mockSchools}
        title={selectedProduct?.displayName || '학교 추가'}
      />
    </AdminLayout>
  );
};
