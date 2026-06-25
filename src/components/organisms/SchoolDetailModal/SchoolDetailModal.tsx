import { useState, useEffect, useCallback } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import type { SchoolProductItem } from "../SchoolAddModal";
import { GENDER_OPTIONS } from "@/constants/gender";
import { getAllProducts, updateProductSelectable, type Product } from "@/api/product";
import { CATEGORY_OPTIONS } from "@/constants/productCategories";
import type { SchoolListItem, SupportedYear, UpdateUniformItem } from "@/api/school";
import { getSchoolDetail } from "@/api/school";
import { getApiErrorString } from "@/utils/errorUtils";

export interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolListItem | null;
  onUpdate: () => void;
  onSubmit: (
    schoolName: string,
    data: {
      school_name: string;
      is_permanent?: boolean;
      years?: {
        year: number;
        expected_student_count?: number;
        measurement_start_date?: string;
        measurement_end_date?: string;
      }[];
      uniforms?: { winter?: UpdateUniformItem[]; summer?: UpdateUniformItem[] };
      has_name_tag?: boolean;
      name_tag_price?: number | null;
      name_tag_attach_price?: number | null;
      name_tag_min_unit?: number | null;
    },
  ) => Promise<void>;
  onAddNewProduct?: () => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - 5 + i),
  label: String(currentYear - 5 + i),
}));

const categoryOptions = CATEGORY_OPTIONS.map((o) => ({
  value: o.value,
  label: o.label,
}));
const genderOptions = GENDER_OPTIONS;

interface EditableYear extends SupportedYear {
  _id: string;
  expected_student_count?: number;
}

interface EditableProduct extends SchoolProductItem {
  productApiId?: string;
  uniformApiId?: number;
  is_selectable?: boolean;
  free_support_count?: number;
  selectable_with?: { product_id: number; display_name: string; free_support_count?: number }[];
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
  const [schoolName, setSchoolName] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);
  const [hasNameTag, setHasNameTag] = useState(false);
  const [nameTagPrice, setNameTagPrice] = useState<number | "">("");
  const [nameTagAttachPrice, setNameTagAttachPrice] = useState<number | "">("");
  const [nameTagMinUnit, setNameTagMinUnit] = useState<number | "">("");
  const [years, setYears] = useState<EditableYear[]>([]);
  const [winterProducts, setWinterProducts] = useState<EditableProduct[]>([]);
  const [summerProducts, setSummerProducts] = useState<EditableProduct[]>([]);
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>(
    {},
  );
  const [allWinterProducts, setAllWinterProducts] = useState<Product[]>([]);
  const [allSummerProducts, setAllSummerProducts] = useState<Product[]>([]);
  const [selectableSaving, setSelectableSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  useEffect(() => {
    if (!school) return;
    setSchoolName(school.school_name);
    setIsPermanent(school.is_permanent);
    setYears(
      school.supported_years.map((sy) => ({
        ...sy,
        _id: `sy-${sy.year}`,
      })),
    );
    setWinterProducts([]);
    setSummerProducts([]);
    setProductsCache({});

    getSchoolDetail(school.school_name)
      .then((detail) => {
        setHasNameTag(detail.has_name_tag ?? false);
        setNameTagPrice(detail.name_tag_price ?? "");
        setNameTagAttachPrice(detail.name_tag_attach_price ?? "");
        setNameTagMinUnit(detail.name_tag_min_unit ?? "");
        setYears(
          detail.years.map((y) => ({
            _id: `sy-${y.id}`,
            year: y.year,
            measurement_start_date: y.measurement_start_date ?? null,
            measurement_end_date: y.measurement_end_date ?? null,
            expected_student_count: y.expected_student_count,
          })),
        );
        const allUniforms = [...detail.uniforms.winter, ...detail.uniforms.summer];
        // school_uniforms.id → product_id 역매핑 (서버가 selectable_with에 uniform row id를 내려줄 경우 보정)
        const uniformIdToProductId = new Map(allUniforms.map((u) => [u.id, u.product_id]));

        const toEditableProduct = (
          u: (typeof detail.uniforms.winter)[number],
        ): EditableProduct => ({
          id: `uniform-${u.id}`,
          category: u.category,
          gender: u.gender,
          displayName: u.display_name,
          contractPrice: u.contract_price,
          freeQuantity: u.free_support_count,
          productApiId: String(u.product_id),
          uniformApiId: u.id,
          hasNameTag: u.has_name_tag,
          nameTagPrice: u.name_tag_price ?? undefined,
          nameTagAttachPrice: u.name_tag_attach_price ?? undefined,
          nameTagMinUnit: u.name_tag_min_unit ?? undefined,
          is_selectable: u.is_selectable,
          selectable_with: u.selectable_with.map((s) => ({
            // s.product_id가 school_uniforms.id일 수도 있으므로 역매핑으로 보정
            product_id: uniformIdToProductId.get(s.product_id) ?? s.product_id,
            display_name: s.display_name,
          })),
        });
        const genderOrder = (g: string) => g === "U" || g === "공용" ? 0 : g === "M" || g === "남" ? 1 : g === "F" || g === "여" ? 2 : 3;
        const sortByGender = (a: EditableProduct, b: EditableProduct) => genderOrder(a.gender) - genderOrder(b.gender);
        setWinterProducts(detail.uniforms.winter.map(toEditableProduct).sort(sortByGender));
        setSummerProducts(detail.uniforms.summer.map(toEditableProduct).sort(sortByGender));
      })
      .catch((err) => {
        console.error("학교 상세 조회 실패:", err);
      });
  }, [school]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  // 수정 모드 진입 시 기존 품목들의 상품 목록 미리 로드
  const handleEnterEditMode = () => {
    setIsEditMode(true);
    if (school) {
      getAllProducts({ school_name: school.school_name, season: "W", limit: 200 }).then((res) => setAllWinterProducts(res.products)).catch(() => {});
      getAllProducts({ school_name: school.school_name, season: "S", limit: 200 }).then((res) => setAllSummerProducts(res.products)).catch(() => {});
    }
    const allProducts = [
      ...winterProducts.map((p) => ({
        season: "W",
        category: p.category,
        gender: p.gender,
      })),
      ...summerProducts.map((p) => ({
        season: "S",
        category: p.category,
        gender: p.gender,
      })),
    ];
    for (const { season, category, gender } of allProducts) {
      if (category && gender) fetchProducts(season, category, gender);
    }
  };

  const fetchProducts = useCallback(
    async (season: string, category: string, gender: string) => {
      const cacheKey = `${season}:${category}:${gender}`;
      if (productsCache[cacheKey]) return;
      try {
        const data = await getAllProducts({ season, category, gender });
        setProductsCache((prev) => ({ ...prev, [cacheKey]: data.products }));
      } catch (error) {
        console.error("상품 조회 실패:", error);
      }
    },
    [productsCache],
  );

  const handleProductChange = (
    season: "winter" | "summer",
    productId: string,
    field: keyof EditableProduct,
    value: string | number,
  ) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const updateFn = (prev: EditableProduct[]): EditableProduct[] =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (field === "category") {
          const newCategory = value as string;
          if (p.gender) fetchProducts(seasonCode, newCategory, p.gender);
          return {
            ...p,
            category: newCategory,
            displayName: "",
            productApiId: "",
            contractPrice: 0,
          };
        }
        if (field === "gender") {
          const newGender = value as string;
          if (p.category) fetchProducts(seasonCode, p.category, newGender);
          return {
            ...p,
            gender: newGender,
            displayName: "",
            productApiId: "",
            contractPrice: 0,
          };
        }
        if (field === "displayName") {
          const cacheKey = `${seasonCode}:${p.category}:${p.gender}`;
          const matched = productsCache[cacheKey]?.find(
            (item) => String(item.id) === value,
          );
          return {
            ...p,
            productApiId: value as string,
            displayName: matched?.name ?? (value as string),
            contractPrice: matched?.price ?? p.contractPrice,
          };
        }
        return { ...p, [field]: value };
      });

    if (season === "winter") setWinterProducts(updateFn);
    else setSummerProducts(updateFn);
  };

  const handleAddProduct = (season: "winter" | "summer") => {
    const newProduct: EditableProduct = {
      id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: "",
      gender: "",
      displayName: "",
      contractPrice: 0,
      freeQuantity: 1,
    };
    if (season === "winter") setWinterProducts((prev) => [...prev, newProduct]);
    else setSummerProducts((prev) => [...prev, newProduct]);
  };

  const handleRemoveProduct = (
    season: "winter" | "summer",
    productId: string,
  ) => {
    if (season === "winter")
      setWinterProducts((prev) => prev.filter((p) => p.id !== productId));
    else setSummerProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const getDisplayNameOptions = (
    season: "winter" | "summer",
    category: string,
    gender: string,
  ) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const cacheKey = `${seasonCode}:${category}:${gender}`;
    return (
      productsCache[cacheKey]?.map((p) => ({
        value: String(p.id),
        label: p.name,
      })) ?? []
    );
  };

  const handleAddYear = () => {
    const newYear: EditableYear = {
      _id: `sy-${Date.now()}`,
      year: currentYear,
      measurement_start_date: "",
      measurement_end_date: "",
    };
    setYears((prev) => [...prev, newYear]);
  };

  const handleYearChange = (
    id: string,
    field: keyof EditableYear,
    value: string | number,
  ) => {
    setYears((prev) =>
      prev.map((y) => (y._id === id ? { ...y, [field]: value } : y)),
    );
  };

  const handleRemoveYear = (id: string) => {
    setYears((prev) => prev.filter((y) => y._id !== id));
  };

  const toUniformItem = (p: EditableProduct): UpdateUniformItem => ({
    product_id: Number(p.productApiId),
    display_name: p.displayName,
    contract_price: p.contractPrice,
    free_support_count: p.freeQuantity ?? 0,
    is_selectable: p.is_selectable ?? false,
    selectable_with: (p.selectable_with ?? []).map((s) => s.product_id),
  });

  const handleSelectableSave = async (product: EditableProduct) => {
    if (!product.productApiId) return;
    setSelectableSaving(true);
    try {
      const myProductId = Number(product.productApiId);
      const siblingProductIds = (product.selectable_with ?? []).map((s) => s.product_id);

      // 내 쪽 저장
      await updateProductSelectable(myProductId, school!.school_name, {
        is_selectable: product.is_selectable ?? false,
        selectable_with: siblingProductIds,
      });

      // 상대방도 양쪽 참조가 되도록 저장
      await Promise.all(
        siblingProductIds.map((sibId) =>
          updateProductSelectable(sibId, school!.school_name, {
            is_selectable: true,
            selectable_with: [myProductId],
          }),
        ),
      );

      setToast({ message: "교체 가능 설정이 저장되었습니다.", variant: "success" });
    } catch (err) {
      setToast({ message: getApiErrorString(err, "교체 가능 설정 저장에 실패했습니다."), variant: "error" });
    } finally {
      setSelectableSaving(false);
    }
  };

  // 교체 가능 품목 토글 시 상대방 품목의 selectable_with도 동기화
  const toggleSelectableWith = (
    season: "winter" | "summer",
    productId: string,
    target: { product_id: number; display_name: string },
    add: boolean,
  ) => {
    const myProductId = Number(
      (season === "winter" ? winterProducts : summerProducts).find((p) => p.id === productId)?.productApiId,
    );

    const syncBoth = (prev: EditableProduct[]): EditableProduct[] =>
      prev.map((p) => {
        // 내 품목: selectable_with 업데이트
        if (p.id === productId) {
          const current = p.selectable_with ?? [];
          return {
            ...p,
            selectable_with: add
              ? [...current, target]
              : current.filter((s) => s.product_id !== target.product_id),
          };
        }
        // 상대방 품목: 나를 역참조하도록 동기화
        if (p.productApiId === String(target.product_id)) {
          const current = p.selectable_with ?? [];
          const meRef = { product_id: myProductId, display_name: p.displayName };
          return {
            ...p,
            is_selectable: add ? true : p.is_selectable,
            selectable_with: add
              ? current.some((s) => s.product_id === myProductId) ? current : [...current, meRef]
              : current.filter((s) => s.product_id !== myProductId),
          };
        }
        return p;
      });

    if (season === "winter") setWinterProducts(syncBoth);
    else setSummerProducts(syncBoth);
  };

  const updateProductField = (
    season: "winter" | "summer",
    productId: string,
    field: keyof EditableProduct,
    value: boolean | { product_id: number; display_name: string }[],
  ) => {
    const updateFn = (prev: EditableProduct[]) =>
      prev.map((p) => p.id === productId ? { ...p, [field]: value } : p);
    if (season === "winter") setWinterProducts(updateFn);
    else setSummerProducts(updateFn);
  };

  const handleSave = async () => {
    if (!school) return;
    const winter = winterProducts
      .filter((p) => p.productApiId)
      .map(toUniformItem);
    const summer = summerProducts
      .filter((p) => p.productApiId)
      .map(toUniformItem);

    try {
      await onSubmit(school.school_name, {
        school_name: schoolName,
        is_permanent: isPermanent,
        has_name_tag: hasNameTag,
        name_tag_price: hasNameTag && nameTagPrice !== "" ? nameTagPrice : null,
        name_tag_attach_price:
          hasNameTag && nameTagAttachPrice !== "" ? nameTagAttachPrice : null,
        name_tag_min_unit:
          hasNameTag && nameTagMinUnit !== "" ? nameTagMinUnit : null,
        years: years.map((y) => ({
          year: y.year,
          expected_student_count: y.expected_student_count,
          measurement_start_date: y.measurement_start_date || undefined,
          measurement_end_date: y.measurement_end_date || undefined,
        })),
        uniforms:
          winter.length > 0 || summer.length > 0
            ? {
                winter: winter.length > 0 ? winter : undefined,
                summer: summer.length > 0 ? summer : undefined,
              }
            : undefined,
      });
      setIsEditMode(false);
      onUpdate();
      setToast({ message: "저장되었습니다.", variant: "success" });
    } catch (err) {
      setToast({ message: getApiErrorString(err, "저장 중 오류가 발생했습니다."), variant: "error" });
    }
  };

  const renderProductRow = (
    product: EditableProduct,
    season: "winter" | "summer",
    hideQuantity = false,
    hideSelectableUI = false,
  ) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const options = getDisplayNameOptions(
      season,
      product.category,
      product.gender,
    );
    const cacheKey = `${seasonCode}:${product.category}:${product.gender}`;
    const isLoaded = cacheKey in productsCache;

    return (
      <div key={product.id} className="flex flex-col gap-1">
        {/* 교체 가능 설정 */}
        {isEditMode && product.productApiId && !hideSelectableUI && (
          <div className="flex flex-col gap-1.5 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <label className="flex items-center gap-2 text-13 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-primary-900"
                checked={product.is_selectable ?? false}
                onChange={(e) => updateProductField(season, product.id, "is_selectable", e.target.checked)}
              />
              교체 가능 품목 설정
            </label>
            {product.is_selectable && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {(season === "winter" ? allWinterProducts : allSummerProducts)
                    .filter((p) => String(p.id) !== product.productApiId)
                    .map((p) => {
                      const selected = (product.selectable_with ?? []).some((s) => s.product_id === p.id);
                      return (
                        <button
                          key={p.id}
                          className={`px-2.5 py-1 text-13 rounded border cursor-pointer ${selected ? "bg-primary-900 text-white border-primary-900" : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"}`}
                          onClick={() => {
                            toggleSelectableWith(season, product.id, { product_id: p.id, display_name: p.name }, !selected);
                          }}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  {(season === "winter" ? allWinterProducts : allSummerProducts).filter((p) => String(p.id) !== product.productApiId).length === 0 && (
                    <span className="text-13 text-gray-400">같은 시즌의 다른 품목이 없습니다</span>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    className="px-3 py-1 text-13 bg-primary-900 text-white rounded border-none cursor-pointer hover:opacity-90 disabled:opacity-40"
                    disabled={selectableSaving}
                    onClick={() => handleSelectableSave(product)}
                  >
                    저장
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <div className="flex gap-2 items-start">
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
                onChange={(v) =>
                  handleProductChange(season, product.id, "category", v)
                }
                fullWidth
              />
            ) : (
              <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                {categoryOptions.find((o) => o.value === product.category)
                  ?.label ?? product.category}
              </div>
            )}
          </div>
          <div className="w-17.5 shrink-0">
            {isEditMode ? (
              <Select
                placeholder="성별"
                options={genderOptions}
                value={product.gender}
                onChange={(v) =>
                  handleProductChange(season, product.id, "gender", v)
                }
                fullWidth
              />
            ) : (
              <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                {genderOptions.find((o) => o.value === product.gender)?.label ??
                  product.gender}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-30">
            {isEditMode ? (
              product.category && product.gender ? (
                <Select
                  placeholder={
                    !isLoaded
                      ? "불러오는 중..."
                      : options.length === 0
                        ? "등록된 아이템이 없습니다"
                        : "표시명"
                  }
                  options={options}
                  value={product.productApiId ?? ""}
                  onChange={(v) =>
                    handleProductChange(season, product.id, "displayName", v)
                  }
                  disabled={isLoaded && options.length === 0}
                  fullWidth
                />
              ) : (
                <Select
                  placeholder="표시명"
                  options={[]}
                  value=""
                  disabled
                  fullWidth
                />
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
                  value={product.contractPrice || ""}
                  onChange={(e) =>
                    handleProductChange(
                      season,
                      product.id,
                      "contractPrice",
                      Number(e.target.value),
                    )
                  }
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
            {hideQuantity ? (
              <div className="w-17.5" />
            ) : isEditMode ? (
              <Input
                placeholder=""
                type="number"
                value={String(product.freeQuantity ?? "")}
                min="0"
                onChange={(e) =>
                  handleProductChange(
                    season,
                    product.id,
                    "freeQuantity",
                    Math.max(0, Number(e.target.value)),
                  )
                }
                fullWidth
              />
            ) : (
              <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                {product.freeQuantity}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProductHeader = () => (
    <div className="flex gap-2 items-start">
      {isEditMode && <div className="w-14 shrink-0" />}
      <div className="w-30 shrink-0">
        <span className="px-2 text-base text-bg-800">카테고리</span>
      </div>
      <div className="w-17.5 shrink-0">
        <span className="px-2 text-base text-bg-800">성별</span>
      </div>
      <div className="flex-1 min-w-30">
        <span className="px-2 text-base text-bg-800">표시명</span>
      </div>
      <div className="w-35 shrink-0">
        <span className="px-2 text-base text-bg-800">계약가격</span>
      </div>
      <div className="w-17.5 shrink-0">
        <span className="px-2 text-base text-bg-800">무상</span>
      </div>
    </div>
  );

  if (!school) return null;

  return (
    <>
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
              onClick={handleEnterEditMode}
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
        <div className="flex justify-end gap-4">
          <div className="flex items-center gap-1.5 text-xs text-bg-400">
            <span>등록일</span>
            <span>{school.created_at}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-bg-400">
            <span>최종 수정일</span>
            <span>{school.updated_at}</span>
          </div>
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
                <input
                  type="checkbox"
                  checked={isPermanent}
                  readOnly
                  className="w-4 h-4"
                />
              )}
              상시지원
            </label>
          </div>
        </div>

        {/* 지원 년도별 정보 */}
        {years.map((y) => (
          <div
            key={y._id}
            className="flex flex-col gap-3 py-2 border-b border-gray-200 last:border-b-0"
          >
            <div className="flex gap-2 items-end">
              <div className="flex-none w-25 min-w-0">
                {isEditMode ? (
                  <Select
                    label="진행년도"
                    options={yearOptions}
                    value={String(y.year)}
                    onChange={(v) => handleYearChange(y._id, "year", Number(v))}
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
                    value={String(y.expected_student_count ?? "")}
                    onChange={(e) =>
                      handleYearChange(
                        y._id,
                        "expected_student_count",
                        Number(e.target.value),
                      )
                    }
                    fullWidth
                  />
                ) : (
                  <div className="flex flex-col gap-1">
                    <span className="px-2 text-base text-bg-800">예상인원</span>
                    <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                      {y.expected_student_count ?? "-"}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {isEditMode ? (
                  <Input
                    label="측정기간"
                    placeholder="2025-01-01"
                    value={y.measurement_start_date ?? ""}
                    onChange={(e) =>
                      handleYearChange(
                        y._id,
                        "measurement_start_date",
                        e.target.value,
                      )
                    }
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
                    value={y.measurement_end_date ?? ""}
                    onChange={(e) =>
                      handleYearChange(
                        y._id,
                        "measurement_end_date",
                        e.target.value,
                      )
                    }
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

        {/* 명찰 */}
        {(isEditMode || hasNameTag) && (
          <div className="flex flex-col gap-2">
            <span className="text-base font-medium text-bg-800">명찰</span>
            <div className="flex gap-4 items-center flex-wrap">
              <label className="flex items-center gap-1.5 text-15 text-gray-700 cursor-pointer">
                {isEditMode ? (
                  <input
                    type="checkbox"
                    checked={hasNameTag}
                    onChange={(e) => setHasNameTag(e.target.checked)}
                    className="w-4 h-4 accent-primary-900"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={hasNameTag}
                    readOnly
                    className="w-4 h-4 accent-primary-900"
                  />
                )}
                명찰
              </label>
              {hasNameTag && (
                <div className="flex gap-2 items-center flex-wrap">
                  {/* 제작 단가 / 구매 단위 — 하나의 인풋처럼 묶음 */}
                  <div className="flex flex-col gap-0.5">
                    <span className="px-1 text-13 text-gray-500">
                      제작 단가
                    </span>
                    {isEditMode ? (
                      <div className="flex items-center h-10 border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <div className="flex items-center px-3 gap-1 flex-1">
                          <input
                            type="number"
                            className="min-w-0 w-20 border-none bg-transparent text-14 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            placeholder="-"
                            value={nameTagPrice}
                            onChange={(e) =>
                              setNameTagPrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                          <span className="text-14 text-gray-500 shrink-0">
                            원
                          </span>
                        </div>
                        <div className="w-px h-5 bg-gray-200 shrink-0" />
                        <div className="flex items-center px-3 gap-1">
                          <input
                            type="number"
                            className="min-w-0 w-10 border-none bg-transparent text-14 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            placeholder="-"
                            value={nameTagMinUnit}
                            onChange={(e) =>
                              setNameTagMinUnit(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                          />
                          <span className="text-14 text-gray-500 shrink-0">
                            개 단위
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center h-10 border border-gray-200 rounded-lg bg-white overflow-hidden">
                        <div className="flex items-center px-3 flex-1 text-14 text-gray-700">
                          {nameTagPrice !== ""
                            ? `${Number(nameTagPrice).toLocaleString()}원`
                            : "-"}
                        </div>
                        <div className="w-px h-5 bg-gray-200 shrink-0" />
                        <div className="flex items-center px-3 text-14 text-gray-700">
                          {nameTagMinUnit !== ""
                            ? `${nameTagMinUnit}개 단위`
                            : "-"}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="px-1 text-13 text-gray-500">
                      부착 단가
                    </span>
                    {isEditMode ? (
                      <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-white gap-1">
                        <input
                          type="number"
                          className="min-w-0 w-20 border-none bg-transparent text-14 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          placeholder="-"
                          value={nameTagAttachPrice}
                          onChange={(e) =>
                            setNameTagAttachPrice(
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />
                        <span className="text-14 text-gray-500 shrink-0">
                          원
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-white text-14 text-gray-700">
                        {nameTagAttachPrice !== ""
                          ? `${Number(nameTagAttachPrice).toLocaleString()}원`
                          : "-"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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

          {(["winter", "summer"] as const).map((season) => {
            const products = season === "winter" ? winterProducts : summerProducts;
            const label = season === "winter" ? "동복" : "하복";
            const addLabel = season === "winter" ? "동복 품목 추가" : "하복 품목 추가";

            const renderProducts = () => {
              // 단독 품목 먼저, 교체 가능 그룹은 하단에
              const soloProducts: EditableProduct[] = [];
              const selectableGroups: EditableProduct[][] = [];
              const visited = new Set<string>();
              for (const p of products) {
                if (visited.has(p.id)) continue;
                if (p.is_selectable && (p.selectable_with ?? []).length > 0) {
                  const siblingIds = new Set((p.selectable_with ?? []).map((sw) => String(sw.product_id)));
                  const group = [p, ...products.filter((q) => siblingIds.has(q.productApiId ?? ""))];
                  group.forEach((q) => visited.add(q.id));
                  selectableGroups.push(group);
                } else {
                  visited.add(p.id);
                  soloProducts.push(p);
                }
              }
              return (
                <div className="flex flex-col gap-2">
                  {soloProducts.map((p) => renderProductRow(p, season))}
                  {selectableGroups.map((group) => {
                    const totalFree = group.reduce((sum, p) => sum + (p.freeQuantity ?? 0), 0);
                    const names = group.map((p) => p.displayName || p.category);
                    return (
                      <div key={group.map((p) => p.id).join("-")} className="flex flex-col gap-1.5 pt-2 mt-1 border-t border-dashed border-gray-200">
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-12 text-gray-400">교체 가능</span>
                          <span className="text-12 text-gray-500">{names.join(" / ")}</span>
                          <span className="text-12 text-gray-300">·</span>
                          {isEditMode ? (
                            <span className="text-12 text-gray-400">품목별 무상 개수 설정</span>
                          ) : (
                            <span className="text-12 text-gray-500">무상 최대 <span className="font-medium text-gray-700">{totalFree}개</span> 한도 내 자유 조합</span>
                          )}
                        </div>
                        {isEditMode && (
                          <div className="flex flex-col gap-1.5 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            <div className="flex flex-wrap gap-1.5">
                              {(season === "winter" ? allWinterProducts : allSummerProducts)
                                .filter((p) => group.some((g) => g.productApiId === String(p.id)))
                                .map((p) => (
                                  <span key={p.id} className="px-2.5 py-1 text-13 rounded border bg-primary-900 text-white border-primary-900">
                                    {p.name}
                                  </span>
                                ))}
                            </div>
                            <div className="flex justify-end">
                              <button
                                className="px-3 py-1 text-13 bg-primary-900 text-white rounded border-none cursor-pointer hover:opacity-90 disabled:opacity-40"
                                disabled={selectableSaving}
                                onClick={() => handleSelectableSave(group[0])}
                              >
                                저장
                              </button>
                            </div>
                          </div>
                        )}
                        {isEditMode ? (
                          <div className="flex flex-col gap-2">
                            {group.map((p) => renderProductRow(p, season, false, true))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1.5 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                            {group.map((p) => renderProductRow(p, season, true, true))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            };

            return (
              <div key={season} className="flex flex-col gap-2">
                <span className="text-sm text-gray-700">{label}</span>
                {products.length > 0 && (
                  <>
                    {renderProductHeader()}
                    {renderProducts()}
                  </>
                )}
                {isEditMode && (
                  <button
                    className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto hover:opacity-90"
                    onClick={() => handleAddProduct(season)}
                  >
                    {addLabel}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
    {toast && (
      <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
    )}
  </>
  );
};
