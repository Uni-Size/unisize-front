import { useState, useEffect, useCallback } from 'react';
import { Modal, Select, Input } from '@components/atoms';
import type { SchoolProductItem } from '../SchoolAddModal';
import { GENDER_OPTIONS } from '@/constants/gender';
import { getAllProducts, type Product } from '@/api/product';
import { CATEGORY_OPTIONS } from '@/constants/productCategories';
import type { SchoolListItem, SupportedYear, UniformItem } from '@/api/school';
import { getSchoolDetail } from '@/api/school';

export interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolListItem | null;
  onUpdate: () => void;
  onSubmit: (schoolName: string, data: {
    school_name: string;
    is_permanent?: boolean;
    years?: { year: number; expected_student_count?: number; measurement_start_date?: string; measurement_end_date?: string; }[];
    uniforms?: { winter?: UniformItem[]; summer?: UniformItem[]; };
  }) => Promise<void>;
  onAddNewProduct?: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - 5 + i),
  label: String(currentYear - 5 + i),
}));

const categoryOptions = CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }));
const genderOptions = GENDER_OPTIONS;

interface EditableYear extends SupportedYear {
  _id: string;
  expected_student_count?: number;
}

interface EditableProduct extends SchoolProductItem {
  productApiId?: string;
}

export const SchoolDetailModal = ({
  isOpen,
  onClose,
  school,
  onUpdate,
  onSubmit,
  onAddNewProduct,
}: SchoolDetailModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [years, setYears] = useState<EditableYear[]>([]);
  const [winterProducts, setWinterProducts] = useState<EditableProduct[]>([]);
  const [summerProducts, setSummerProducts] = useState<EditableProduct[]>([]);
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    if (!school) return;
    setSchoolName(school.school_name);
    setIsPermanent(school.is_permanent);
    setYears(
      school.supported_years.map((sy) => ({
        ...sy,
        _id: `sy-${sy.year}`,
      }))
    );
    setWinterProducts([]);
    setSummerProducts([]);
    setProductsCache({});

    getSchoolDetail(school.school_name).then((detail) => {
      setYears(
        detail.years.map((y) => ({
          _id: `sy-${y.id}`,
          year: y.year,
          measurement_start_date: y.measurement_start_date ?? null,
          measurement_end_date: y.measurement_end_date ?? null,
          expected_student_count: y.expected_student_count,
        }))
      );
      const toEditableProduct = (u: typeof detail.uniforms.winter[number]): EditableProduct => ({
        id: `uniform-${u.id}`,
        category: u.category,
        gender: u.gender,
        displayName: u.display_name,
        contractPrice: u.contract_price,
        freeQuantity: u.free_support_count,
        productApiId: String(u.product_id),
      });
      setWinterProducts(detail.uniforms.winter.map(toEditableProduct));
      setSummerProducts(detail.uniforms.summer.map(toEditableProduct));
    }).catch((err) => {
      console.error('학교 상세 조회 실패:', err);
    });
  }, [school]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const fetchProducts = useCallback(
    async (season: string, category: string, gender: string) => {
      const cacheKey = `${season}:${category}:${gender}`;
      if (productsCache[cacheKey]) return;
      try {
        const data = await getAllProducts({ season, category, gender });
        setProductsCache((prev) => ({ ...prev, [cacheKey]: data.products }));
      } catch (error) {
        console.error('상품 조회 실패:', error);
      }
    },
    [productsCache],
  );

  const handleProductChange = (
    season: 'winter' | 'summer',
    productId: string,
    field: keyof EditableProduct,
    value: string | number,
  ) => {
    const seasonCode = season === 'winter' ? 'W' : 'S';
    const updateFn = (prev: EditableProduct[]): EditableProduct[] =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (field === 'category') {
          const newCategory = value as string;
          if (p.gender) fetchProducts(seasonCode, newCategory, p.gender);
          return { ...p, category: newCategory, displayName: '', productApiId: '', contractPrice: 0 };
        }
        if (field === 'gender') {
          const newGender = value as string;
          if (p.category) fetchProducts(seasonCode, p.category, newGender);
          return { ...p, gender: newGender, displayName: '', productApiId: '', contractPrice: 0 };
        }
        if (field === 'displayName') {
          const cacheKey = `${seasonCode}:${p.category}:${p.gender}`;
          const matched = productsCache[cacheKey]?.find((item) => String(item.id) === value);
          return {
            ...p,
            productApiId: value as string,
            displayName: matched?.name ?? (value as string),
            contractPrice: matched?.price ?? p.contractPrice,
          };
        }
        return { ...p, [field]: value };
      });

    if (season === 'winter') setWinterProducts(updateFn);
    else setSummerProducts(updateFn);
  };

  const handleAddProduct = (season: 'winter' | 'summer') => {
    const newProduct: EditableProduct = {
      id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: '',
      gender: '',
      displayName: '',
      contractPrice: 0,
      freeQuantity: 1,
    };
    if (season === 'winter') setWinterProducts((prev) => [...prev, newProduct]);
    else setSummerProducts((prev) => [...prev, newProduct]);
  };

  const handleRemoveProduct = (season: 'winter' | 'summer', productId: string) => {
    if (season === 'winter') setWinterProducts((prev) => prev.filter((p) => p.id !== productId));
    else setSummerProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const getDisplayNameOptions = (season: 'winter' | 'summer', category: string, gender: string) => {
    const seasonCode = season === 'winter' ? 'W' : 'S';
    const cacheKey = `${seasonCode}:${category}:${gender}`;
    return productsCache[cacheKey]?.map((p) => ({ value: String(p.id), label: p.name })) ?? [];
  };

  const handleAddYear = () => {
    const newYear: EditableYear = {
      _id: `sy-${Date.now()}`,
      year: currentYear,
      measurement_start_date: '',
      measurement_end_date: '',
    };
    setYears((prev) => [...prev, newYear]);
  };

  const handleYearChange = (id: string, field: keyof EditableYear, value: string | number) => {
    setYears((prev) => prev.map((y) => (y._id === id ? { ...y, [field]: value } : y)));
  };

  const handleRemoveYear = (id: string) => {
    setYears((prev) => prev.filter((y) => y._id !== id));
  };

  const toUniformItem = (p: EditableProduct): UniformItem => ({
    product_id: Number(p.productApiId),
    contract_price: p.contractPrice,
    free_support_count: p.freeQuantity,
  });

  const handleSave = async () => {
    if (!school) return;
    const winter = winterProducts.filter((p) => p.productApiId).map(toUniformItem);
    const summer = summerProducts.filter((p) => p.productApiId).map(toUniformItem);

    await onSubmit(school.school_name, {
      school_name: schoolName,
      is_permanent: isPermanent,
      years: years.map((y) => ({
        year: y.year,
        expected_student_count: y.expected_student_count,
        measurement_start_date: y.measurement_start_date || undefined,
        measurement_end_date: y.measurement_end_date || undefined,
      })),
      uniforms:
        winter.length > 0 || summer.length > 0
          ? { winter: winter.length > 0 ? winter : undefined, summer: summer.length > 0 ? summer : undefined }
          : undefined,
    });
    setIsEditMode(false);
    onUpdate();
  };

  const renderProductRow = (product: EditableProduct, season: 'winter' | 'summer') => {
    const seasonCode = season === 'winter' ? 'W' : 'S';
    const options = getDisplayNameOptions(season, product.category, product.gender);
    const cacheKey = `${seasonCode}:${product.category}:${product.gender}`;
    const isLoaded = cacheKey in productsCache;

    return (
      <div key={product.id} className="flex gap-2 items-start">
        {isEditMode && (
          <button
            className="shrink-0 flex items-center justify-center w-14 h-12.5 border border-delete-border rounded-lg bg-delete-bg text-white cursor-pointer hover:bg-delete-bg-hover text-sm font-medium"
            onClick={() => handleRemoveProduct(season, product.id)}
          >
            삭제
          </button>
        )}
        <div className="w-30 shrink-0">
          {isEditMode ? (
            <Select
              placeholder="카테고리"
              options={categoryOptions}
              value={product.category}
              onChange={(v) => handleProductChange(season, product.id, 'category', v)}
              fullWidth
            />
          ) : (
            <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
              {categoryOptions.find((o) => o.value === product.category)?.label ?? product.category}
            </div>
          )}
        </div>
        <div className="w-17.5 shrink-0">
          {isEditMode ? (
            <Select
              placeholder="성별"
              options={genderOptions}
              value={product.gender}
              onChange={(v) => handleProductChange(season, product.id, 'gender', v)}
              fullWidth
            />
          ) : (
            <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
              {genderOptions.find((o) => o.value === product.gender)?.label ?? product.gender}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-30">
          {isEditMode ? (
            product.category && product.gender ? (
              <Select
                placeholder={!isLoaded ? '불러오는 중...' : options.length === 0 ? '등록된 아이템이 없습니다' : '표시명'}
                options={options}
                value={product.productApiId ?? ''}
                onChange={(v) => handleProductChange(season, product.id, 'displayName', v)}
                disabled={isLoaded && options.length === 0}
                fullWidth
              />
            ) : (
              <Select placeholder="표시명" options={[]} value="" disabled fullWidth />
            )
          ) : (
            <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
              {product.displayName}
            </div>
          )}
        </div>
        <div className="w-35 shrink-0">
          {isEditMode ? (
            <div className="flex items-center h-12.5 px-3 border border-gray-200 rounded-lg bg-white gap-1">
              <input
                type="number"
                className="min-w-0 flex-1 border-none bg-transparent text-15 text-gray-700 text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="-"
                value={product.contractPrice || ''}
                onChange={(e) => handleProductChange(season, product.id, 'contractPrice', Number(e.target.value))}
              />
              <span className="text-15 text-gray-700 shrink-0">원</span>
            </div>
          ) : (
            <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
              {product.contractPrice.toLocaleString()}원
            </div>
          )}
        </div>
        <div className="w-17.5 shrink-0">
          {isEditMode ? (
            <Input
              placeholder=""
              type="number"
              value={String(product.freeQuantity || '')}
              onChange={(e) => handleProductChange(season, product.id, 'freeQuantity', Number(e.target.value))}
              fullWidth
            />
          ) : (
            <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
              {product.freeQuantity}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProductHeader = () => (
    <div className="flex gap-2 items-start">
      {isEditMode && <div className="w-14 shrink-0" />}
      <div className="w-30 shrink-0"><span className="px-2 text-base text-bg-800">카테고리</span></div>
      <div className="w-17.5 shrink-0"><span className="px-2 text-base text-bg-800">성별</span></div>
      <div className="flex-1 min-w-30"><span className="px-2 text-base text-bg-800">표시명</span></div>
      <div className="w-35 shrink-0"><span className="px-2 text-base text-bg-800">계약가격</span></div>
      <div className="w-17.5 shrink-0"><span className="px-2 text-base text-bg-800">무상</span></div>
    </div>
  );

  if (!school) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={school.school_name}
      width={850}
      actions={
        isEditMode ? (
          <>
            <button
              className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => setIsEditMode(false)}
            >
              취소
            </button>
            <button
              className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={handleSave}
            >
              저장
            </button>
          </>
        ) : (
          <>
            <button
              className="px-6 py-2.5 bg-yellow-700 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
              onClick={() => setIsEditMode(true)}
            >
              수정
            </button>
            <button
              className="px-6 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100/50"
              onClick={handleClose}
            >
              닫기
            </button>
          </>
        )
      }
    >
      <div className="flex flex-col gap-4 w-full">
        {/* 등록일 / 수정일 */}
        <div className="flex flex-col items-end gap-1 absolute top-3.75 right-30">
          <span className="text-xs text-bg-400">등록일</span>
          <span className="text-xs text-bg-400">{school.created_at}</span>
          <span className="text-xs text-bg-400">최종 수정일</span>
          <span className="text-xs text-bg-400">{school.updated_at}</span>
        </div>

        {/* 학교명 / 상시지원 */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            {isEditMode ? (
              <Input
                label="학교명"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                fullWidth
              />
            ) : (
              <div className="flex flex-col gap-1">
                <span className="px-2 text-base text-bg-800">학교명</span>
                <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                  {school.school_name}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center h-12.5 gap-2 px-2 pb-0.5">
            <label className="flex items-center gap-1.5 text-15 text-gray-700 cursor-pointer">
              {isEditMode ? (
                <input
                  type="checkbox"
                  checked={isPermanent}
                  onChange={(e) => setIsPermanent(e.target.checked)}
                  className="w-4 h-4"
                />
              ) : (
                <input type="checkbox" checked={isPermanent} readOnly className="w-4 h-4" />
              )}
              상시지원
            </label>
          </div>
        </div>

        {/* 지원 년도별 정보 */}
        {years.map((y) => (
          <div key={y._id} className="flex flex-col gap-3 py-2 border-b border-gray-200 last:border-b-0">
            <div className="flex gap-2 items-end">
              <div className="flex-none w-25 min-w-0">
                {isEditMode ? (
                  <Select
                    label="진행년도"
                    options={yearOptions}
                    value={String(y.year)}
                    onChange={(v) => handleYearChange(y._id, 'year', Number(v))}
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">진행년도</span>
                    <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                      {y.year}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-none w-25 min-w-0">
                {isEditMode ? (
                  <Input
                    label="예상인원"
                    type="number"
                    value={String(y.expected_student_count ?? '')}
                    onChange={(e) => handleYearChange(y._id, 'expected_student_count', Number(e.target.value))}
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">예상인원</span>
                    <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                      {y.expected_student_count ?? '-'}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <Input
                    label="측정기간"
                    placeholder="2025-01-01"
                    value={y.measurement_start_date ?? ''}
                    onChange={(e) => handleYearChange(y._id, 'measurement_start_date', e.target.value)}
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">측정기간</span>
                    <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                      {y.measurement_start_date}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-15 text-gray-700 pb-4">~</span>
              <div className="flex-none w-35 min-w-0">
                {isEditMode ? (
                  <Input
                    label=" "
                    placeholder="2025-01-10"
                    value={y.measurement_end_date ?? ''}
                    onChange={(e) => handleYearChange(y._id, 'measurement_end_date', e.target.value)}
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800"> </span>
                    <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                      {y.measurement_end_date}
                    </div>
                  </div>
                )}
              </div>
              {isEditMode && (
                <button
                  className="shrink-0 flex items-center justify-center w-10 h-12.5 border-none bg-transparent cursor-pointer text-gray-400 text-lg hover:text-red-500"
                  onClick={() => handleRemoveYear(y._id)}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        {isEditMode && (
          <button
            className="flex items-center justify-center px-5 py-2.5 bg-bg-800 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto mt-2 hover:opacity-90"
            onClick={handleAddYear}
          >
            년도 추가
          </button>
        )}

        {/* 교복 */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-bg-800">교복</span>
            {isEditMode && onAddNewProduct && (
              <button
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:opacity-80"
                onClick={onAddNewProduct}
              >
                신규품목 추가
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-700">동복</span>
            {winterProducts.length > 0 && (
              <>
                {renderProductHeader()}
                <div className="flex flex-col gap-2">
                  {winterProducts.map((p) => renderProductRow(p, 'winter'))}
                </div>
              </>
            )}
            {isEditMode && (
              <button
                className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto hover:opacity-90"
                onClick={() => handleAddProduct('winter')}
              >
                동복 품목 추가
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-700">하복</span>
            {summerProducts.length > 0 && (
              <>
                {renderProductHeader()}
                <div className="flex flex-col gap-2">
                  {summerProducts.map((p) => renderProductRow(p, 'summer'))}
                </div>
              </>
            )}
            {isEditMode && (
              <button
                className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto hover:opacity-90"
                onClick={() => handleAddProduct('summer')}
              >
                하복 품목 추가
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
