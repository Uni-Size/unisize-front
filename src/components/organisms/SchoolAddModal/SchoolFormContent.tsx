import { useState, useCallback } from "react";
import { Select, Input } from "@components/atoms";
import { NameTagSection } from "../NameTagSection/NameTagSection";
import { getAllProducts, type Product } from "@/api/product";
import { GENDER_OPTIONS } from "@/constants/gender";
import { CATEGORY_GROUPS, getCategoryLabel } from "@/constants/productCategories";

export interface SchoolProductItem {
  id: string;
  category: string;
  gender: string;
  displayName: string;
  contractPrice: number;
  freeQuantity: number;
  productApiId?: string;
  season?: "winter" | "summer";
}

export interface EditableProduct extends SchoolProductItem {
  uniformApiId?: string;
  is_selectable?: boolean;
  selectable_with?: { product_id: string; display_name: string }[];
}

export interface EditableYear {
  _id: string;
  year: number;
  measurement_start_date: string | null;
  measurement_end_date: string | null;
  expected_student_count?: number;
}

export type SchoolFormMode = "add" | "view" | "edit";

export interface SchoolFormState {
  schoolName: string;
  isPermanent: boolean;
  hasNameTag: boolean;
  nameTagPrice: number | "";
  nameTagAttachPrice: number | "";
  nameTagMinUnit: number | "";
  years: EditableYear[];
  winterProducts: EditableProduct[];
  summerProducts: EditableProduct[];
  productsCache: Record<string, { id: string; name: string; price: number }[]>;
  allWinterProducts: Product[];
  allSummerProducts: Product[];
}

export interface SchoolFormContentProps {
  mode: SchoolFormMode;
  state: SchoolFormState;
  onChange: (patch: Partial<SchoolFormState>) => void;
  /** 학교추가 모드에서만 사용: 시작일 변경 시 종료일 자동 설정 포함 */
  onMeasurementStartChange?: (id: string, value: string) => void;
  onAddNewProduct?: (
    onCreated: (item: SchoolProductItem) => void,
    addToCache: (cacheKey: string, product: { id: string; name: string; price: number }) => void,
  ) => void;
  /** 디테일 모드 전용: 교체 가능 저장 */
  onSelectableSave?: (product: EditableProduct) => Promise<void>;
  selectableSaving?: boolean;
  schoolNameForDisplay?: string;
  createdAt?: string;
  updatedAt?: string;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 10 }, (_, i) => ({
  value: String(currentYear - 5 + i),
  label: String(currentYear - 5 + i),
}));
const addYearOptions = Array.from({ length: 6 }, (_, i) => ({
  value: String(currentYear - 3 + i),
  label: String(currentYear - 3 + i),
}));

const categoryOptions = CATEGORY_GROUPS;
const genderOptions = GENDER_OPTIONS;

export const SchoolFormContent = ({
  mode,
  state,
  onChange,
  onAddNewProduct,
  onSelectableSave,
  selectableSaving = false,
  schoolNameForDisplay,
  createdAt,
  updatedAt,
}: SchoolFormContentProps) => {
  const {
    schoolName,
    isPermanent,
    hasNameTag,
    nameTagPrice,
    nameTagAttachPrice,
    nameTagMinUnit,
    years,
    winterProducts,
    summerProducts,
    productsCache,
    allWinterProducts,
    allSummerProducts,
  } = state;

  const isAdd = mode === "add";
  const isEdit = mode === "add" || mode === "edit";

  const fetchProducts = useCallback(
    async (season: string, category: string, gender: string) => {
      const cacheKey = `${season}:${category}:${gender}`;
      if (productsCache[cacheKey]) return;
      try {
        const data = await getAllProducts({ season, category, gender });
        onChange({ productsCache: { ...productsCache, [cacheKey]: data.products } });
      } catch {
        // silent
      }
    },
    [productsCache, onChange],
  );

  const getDisplayNameOptions = (season: "winter" | "summer", category: string, gender: string) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const cacheKey = `${seasonCode}:${category}:${gender}`;
    return (
      productsCache[cacheKey]?.map((p) => ({ value: p.id, label: p.name })) ?? []
    );
  };

  const handleProductChange = (
    season: "winter" | "summer",
    productId: string,
    field: keyof EditableProduct | "displayName_override",
    value: string | number,
  ) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const updateFn = (prev: EditableProduct[]): EditableProduct[] =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (field === "category") {
          const newCategory = value as string;
          if (p.gender) fetchProducts(seasonCode, newCategory, p.gender);
          return { ...p, category: newCategory, displayName: "", productApiId: "", contractPrice: 0 };
        }
        if (field === "gender") {
          const newGender = value as string;
          if (p.category) fetchProducts(seasonCode, p.category, newGender);
          return { ...p, gender: newGender, displayName: "", productApiId: "", contractPrice: 0 };
        }
        if (field === "displayName") {
          const cacheKey = `${seasonCode}:${p.category}:${p.gender}`;
          const matched = productsCache[cacheKey]?.find((item) => item.id === value);
          return {
            ...p,
            productApiId: value as string,
            displayName: matched?.name ?? (value as string),
            contractPrice: matched?.price ?? p.contractPrice,
          };
        }
        if (field === "displayName_override") {
          return { ...p, displayName: value as string };
        }
        return { ...p, [field]: value };
      });

    if (season === "winter") onChange({ winterProducts: updateFn(winterProducts) });
    else onChange({ summerProducts: updateFn(summerProducts) });
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
    if (season === "winter") onChange({ winterProducts: [...winterProducts, newProduct] });
    else onChange({ summerProducts: [...summerProducts, newProduct] });
  };

  const handleRemoveProduct = (season: "winter" | "summer", productId: string) => {
    if (season === "winter")
      onChange({ winterProducts: winterProducts.filter((p) => p.id !== productId) });
    else onChange({ summerProducts: summerProducts.filter((p) => p.id !== productId) });
  };

  const updateProductField = (
    season: "winter" | "summer",
    productId: string,
    field: keyof EditableProduct,
    value: boolean | { product_id: string; display_name: string }[],
  ) => {
    const updateFn = (prev: EditableProduct[]) =>
      prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p));
    if (season === "winter") onChange({ winterProducts: updateFn(winterProducts) });
    else onChange({ summerProducts: updateFn(summerProducts) });
  };

  const toggleSelectableWith = (
    season: "winter" | "summer",
    productId: string,
    target: { product_id: string; display_name: string },
    add: boolean,
  ) => {
    const myProductId = (season === "winter" ? winterProducts : summerProducts)
      .find((p) => p.id === productId)?.productApiId ?? "";
    const syncBoth = (prev: EditableProduct[]): EditableProduct[] =>
      prev.map((p) => {
        if (p.id === productId) {
          const current = p.selectable_with ?? [];
          return {
            ...p,
            selectable_with: add
              ? [...current, target]
              : current.filter((s) => s.product_id !== target.product_id),
          };
        }
        if (p.productApiId === target.product_id) {
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
    if (season === "winter") onChange({ winterProducts: syncBoth(winterProducts) });
    else onChange({ summerProducts: syncBoth(summerProducts) });
  };

  const handleAddYear = () => {
    const newYear: EditableYear = {
      _id: `sy-${Date.now()}`,
      year: currentYear,
      measurement_start_date: "",
      measurement_end_date: "",
    };
    onChange({ years: [...years, newYear] });
  };

  const handleYearChange = (id: string, field: keyof EditableYear, value: string | number) => {
    onChange({
      years: years.map((y) => {
        if (y._id !== id) return y;
        if (field === "measurement_start_date" && isAdd && typeof value === "string" && value) {
          const d = new Date(value);
          d.setDate(d.getDate() + 3);
          return { ...y, measurement_start_date: value, measurement_end_date: d.toISOString().slice(0, 10) };
        }
        return { ...y, [field]: value };
      }),
    });
  };

  const handleRemoveYear = (id: string) => {
    onChange({ years: years.filter((y) => y._id !== id) });
  };

  const renderProductRow = (
    product: EditableProduct,
    season: "winter" | "summer",
    hideQuantity = false,
    hideSelectableUI = false,
  ) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const options = getDisplayNameOptions(season, product.category, product.gender);
    const cacheKey = `${seasonCode}:${product.category}:${product.gender}`;
    const isLoaded = cacheKey in productsCache;

    // 교체 가능 후보: 서버에서 로드한 전체 품목 + 현재 편집 중인 품목(productApiId 있는 것)
    const siblingPool: { id: string; name: string }[] = mode === "edit" ? (() => {
      const fromServer = (season === "winter" ? allWinterProducts : allSummerProducts)
        .map((p) => ({ id: p.id, name: p.name }));
      const fromEditing = (season === "winter" ? winterProducts : summerProducts)
        .filter((p) => p.productApiId && p.id !== product.id && p.displayName)
        .map((p) => ({ id: p.productApiId!, name: p.displayName }));
      const seen = new Set(fromServer.map((p) => p.id));
      const merged = [...fromServer];
      for (const p of fromEditing) {
        if (!seen.has(p.id)) { seen.add(p.id); merged.push(p); }
      }
      return merged.filter((p) => p.id !== product.productApiId);
    })() : [];

    return (
      <div key={product.id} className="flex flex-col gap-1">
        <div className="flex gap-2 items-start">
          {isEdit && (
            <>
              {/* 삭제 아이콘 */}
              <button
                className="shrink-0 flex items-center justify-center w-6 h-9 text-gray-400 cursor-pointer hover:text-red-500 bg-transparent border-none"
                onClick={() => handleRemoveProduct(season, product.id)}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              {/* 교체 가능 체크박스 */}
              {mode === "edit" && !hideSelectableUI && (
                <div className="shrink-0 flex items-center justify-center w-10 h-9">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 accent-primary-900"
                    checked={product.is_selectable ?? false}
                    onChange={(e) => updateProductField(season, product.id, "is_selectable", e.target.checked)}
                  />
                </div>
              )}
            </>
          )}
          <div className="w-30 shrink-0">
            {isEdit ? (
              <Select
                placeholder="카테고리"
                options={categoryOptions.flatMap((g) => g.options)}
                groups={categoryOptions}
                value={product.category}
                onChange={(v) => handleProductChange(season, product.id, "category", v)}
                searchable
                size="sm"
                fullWidth
              />
            ) : (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700">
                {getCategoryLabel(product.category)}
              </div>
            )}
          </div>
          <div className="w-17.5 shrink-0">
            {isEdit ? (
              <Select
                placeholder="성별"
                options={genderOptions}
                value={product.gender}
                onChange={(v) => handleProductChange(season, product.id, "gender", v)}
                size="sm"
                fullWidth
              />
            ) : (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700">
                {genderOptions.find((o) => o.value === product.gender)?.label ?? product.gender}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-30">
            {isEdit ? (
              product.category && product.gender ? (
                <Select
                  placeholder={
                    !isLoaded ? "불러오는 중..." : options.length === 0 ? "등록된 아이템이 없습니다" : "제품 검색"
                  }
                  options={options}
                  value={product.productApiId ?? ""}
                  onChange={(v) => handleProductChange(season, product.id, "displayName", v)}
                  disabled={isLoaded && options.length === 0}
                  searchable
                  size="sm"
                  fullWidth
                />
              ) : (
                <Select placeholder="제품 검색" options={[]} value="" disabled size="sm" fullWidth />
              )
            ) : (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700">
                {product.displayName}
              </div>
            )}
          </div>
          <div className="w-44 shrink-0">
            {isEdit ? (
              <input
                className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700 outline-none focus:border-gray-400 placeholder:text-bg-400"
                placeholder="표시명"
                value={product.displayName}
                onChange={(e) => handleProductChange(season, product.id, "displayName_override", e.target.value)}
              />
            ) : (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700">
                {product.displayName}
              </div>
            )}
          </div>
          <div className="w-35 shrink-0">
            {isEdit ? (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white gap-1">
                <input
                  type="number"
                  className="min-w-0 flex-1 border-none bg-transparent text-13 text-gray-700 text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="-"
                  value={product.contractPrice || ""}
                  onChange={(e) => handleProductChange(season, product.id, "contractPrice", Number(e.target.value))}
                />
                <span className="text-13 text-gray-700 shrink-0">원</span>
              </div>
            ) : (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700">
                {product.contractPrice.toLocaleString()}원
              </div>
            )}
          </div>
          <div className="w-12 shrink-0">
            {hideQuantity ? (
              <div className="w-12" />
            ) : isEdit ? (
              <Input
                placeholder="0"
                type="number"
                value={String(product.freeQuantity ?? "")}
                min="0"
                onChange={(e) =>
                  handleProductChange(season, product.id, "freeQuantity", Math.max(0, Number(e.target.value)))
                }
                size="sm"
                fullWidth
              />
            ) : (
              <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700">
                {product.freeQuantity}
              </div>
            )}
          </div>
        </div>
        {/* 교체 가능 품목 선택 (체크 시) */}
        {mode === "edit" && !hideSelectableUI && product.is_selectable && (
          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-12 text-gray-400 shrink-0">↳ 교체 가능:</span>
            <div className="flex flex-wrap gap-1">
              {siblingPool.map((p) => {
                const selected = (product.selectable_with ?? []).some((s) => s.product_id === p.id);
                return (
                  <button
                    key={p.id}
                    className={`px-2 py-0.5 text-12 rounded border cursor-pointer transition-colors ${selected ? "bg-primary-900 text-white border-primary-900" : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}
                    onClick={() => toggleSelectableWith(season, product.id, { product_id: p.id, display_name: p.name }, !selected)}
                  >
                    {p.name}
                  </button>
                );
              })}
              {siblingPool.length === 0 && (
                <span className="text-12 text-gray-400">다른 품목 없음</span>
              )}
            </div>
            <button
              className="ml-auto px-2 py-0.5 text-12 bg-primary-900 text-white rounded border-none cursor-pointer hover:opacity-90 disabled:opacity-40 shrink-0"
              disabled={selectableSaving}
              onClick={() => onSelectableSave?.(product)}
            >
              저장
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderProductHeader = () => (
    <div className="flex gap-2 items-start">
      {isEdit && <div className="w-6 shrink-0" />}
      {mode === "edit" && (
        <div className="w-10 shrink-0 flex items-center justify-center">
          <span className="text-base text-bg-800">교체</span>
        </div>
      )}
      <div className="w-30 shrink-0">
        <span className="px-2 text-base text-bg-800">카테고리</span>
      </div>
      <div className="w-17.5 shrink-0">
        <span className="px-2 text-base text-bg-800">성별</span>
      </div>
      <div className="flex-1 min-w-30">
        <span className="px-2 text-base text-bg-800">제품 검색</span>
      </div>
      <div className="w-44 shrink-0">
        <span className="px-2 text-base text-bg-800">표시명</span>
      </div>
      <div className="w-35 shrink-0">
        <span className="px-2 text-base text-bg-800">계약가격</span>
      </div>
      <div className="w-12 shrink-0">
        <span className="px-2 text-base text-bg-800">무상</span>
      </div>
    </div>
  );

  const categoryOrder = Object.fromEntries(
    CATEGORY_GROUPS.flatMap((g, gi) => g.options.map((opt, oi) => [opt.value, gi * 100 + oi]))
  );
  const genderOrder = (g: string) =>
    g === "U" || g === "공용" ? 0 : g === "M" || g === "남" ? 1 : g === "F" || g === "여" ? 2 : 3;
  const sortProducts = (list: EditableProduct[]) =>
    [...list].sort((a, b) => {
      const catDiff = (categoryOrder[a.category] ?? 9999) - (categoryOrder[b.category] ?? 9999);
      return catDiff !== 0 ? catDiff : genderOrder(a.gender) - genderOrder(b.gender);
    });

  const renderSeasonSection = (season: "winter" | "summer") => {
    const products = sortProducts(season === "winter" ? winterProducts : summerProducts);
    const label = season === "winter" ? "동복" : "하복";
    const addLabel = season === "winter" ? "동복 품목 추가" : "하복 품목 추가";

    const renderProducts = () => {
      if (isAdd) {
        return (
          <div className="flex flex-col gap-2">
            {products.map((p) => renderProductRow(p, season))}
          </div>
        );
      }

      // 디테일: 단독 / 교체 가능 그룹 분리
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

      // soloProducts와 selectableGroups를 카테고리 순서 기준으로 합쳐서 정렬
      type RenderItem =
        | { kind: "solo"; product: EditableProduct; order: number }
        | { kind: "group"; group: EditableProduct[]; order: number };
      const renderItems: RenderItem[] = [
        ...soloProducts.map((p) => ({ kind: "solo" as const, product: p, order: categoryOrder[p.category] ?? 9999 })),
        ...selectableGroups.map((g) => ({ kind: "group" as const, group: g, order: categoryOrder[g[0]?.category] ?? 9999 })),
      ].sort((a, b) => a.order - b.order);

      return (
        <div className="flex flex-col gap-2">
          {renderItems.map((item) => {
            if (item.kind === "solo") return renderProductRow(item.product, season);
            const group = item.group;
            const groupFree = group[0]?.freeQuantity ?? 0;
            const names = group.map((p) => p.displayName || p.category);
            const groupKey = group.map((p) => p.id).join("-");

            const setGroupFree = (qty: number) => {
              group.forEach((p) => handleProductChange(season, p.id, "freeQuantity", qty));
            };

            return (
              <div key={groupKey} className="flex flex-col gap-1.5 pt-2 pb-2 mt-1 mb-1 border-t border-b border-dashed border-gray-200">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-12 text-gray-400">교체 가능</span>
                  <span className="text-12 text-gray-500">{names.join(" / ")}</span>
                  <span className="text-12 text-gray-300">·</span>
                  {mode === "edit" ? (
                    <div className="flex items-center gap-1">
                      <span className="text-12 text-gray-400">무상</span>
                      <div className="flex items-center h-6 px-1.5 border border-gray-200 rounded bg-white gap-0.5">
                        <input
                          type="number"
                          className="w-8 border-none bg-transparent text-12 text-gray-700 text-right outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          value={groupFree || ""}
                          min="0"
                          placeholder="0"
                          onChange={(e) => setGroupFree(Math.max(0, Number(e.target.value)))}
                        />
                        <span className="text-12 text-gray-500">개</span>
                      </div>
                      <span className="text-12 text-gray-400">한도 내 자유 조합</span>
                    </div>
                  ) : (
                    <span className="text-12 text-gray-500">
                      무상 최대 <span className="font-medium text-gray-700">{groupFree}개</span> 한도 내 자유 조합
                    </span>
                  )}
                  {mode === "edit" && (
                    <button
                      className="ml-auto px-2 py-0.5 text-12 bg-primary-900 text-white rounded border-none cursor-pointer hover:opacity-90 disabled:opacity-40"
                      disabled={selectableSaving}
                      onClick={() => onSelectableSave?.(group[0])}
                    >
                      저장
                    </button>
                  )}
                </div>
                <div className={mode === "edit" ? "flex flex-col gap-2" : "flex flex-col gap-1.5 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg"}>
                  {group.map((p) => renderProductRow(p, season, true, true))}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div key={season} className="flex flex-col gap-2">
        <span className="text-sm text-gray-700">{label}</span>
        {isAdd ? (
          products.length === 0 ? (
            <p className="text-15 text-bg-400 text-center py-4 m-0">
              {season === "winter" ? "동복이 구성되지 않았습니다" : "하복이 구성되지 않았습니다"}
            </p>
          ) : (
            <>
              {renderProductHeader()}
              {renderProducts()}
            </>
          )
        ) : (
          products.length > 0 && (
            <>
              {renderProductHeader()}
              {renderProducts()}
            </>
          )
        )}
        {isEdit && (
          <button
            className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto hover:opacity-90"
            onClick={() => handleAddProduct(season)}
          >
            {addLabel}
          </button>
        )}
      </div>
    );
  };

  const activeYearOptions = isAdd ? addYearOptions : yearOptions;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 등록일 / 수정일 (디테일 전용) */}
      {!isAdd && createdAt && (
        <div className="flex justify-end gap-4">
          <div className="flex items-center gap-1.5 text-xs text-bg-400">
            <span>등록일</span>
            <span>{createdAt}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-bg-400">
            <span>최종 수정일</span>
            <span>{updatedAt}</span>
          </div>
        </div>
      )}

      {/* 학교명 */}
      <div className="flex gap-2 items-end">
        <div className="flex-1 min-w-0">
          {isEdit ? (
            <Input
              label="학교명"
              placeholder="학교명"
              value={schoolName}
              onChange={(e) => onChange({ schoolName: e.target.value })}
              fullWidth
            />
          ) : (
            <div className="flex flex-col gap-1">
              <span className="px-2 text-base text-bg-800">학교명</span>
              <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white text-15 text-gray-700">
                {schoolNameForDisplay ?? schoolName}
              </div>
            </div>
          )}
        </div>
        {!isAdd && (
          <div className="flex items-center h-12.5 gap-2 px-2 pb-0.5">
            <label className="flex items-center gap-1.5 text-15 text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={isPermanent}
                onChange={isEdit ? (e) => onChange({ isPermanent: e.target.checked }) : undefined}
                readOnly={!isEdit}
                className="w-4 h-4"
              />
              상시지원
            </label>
          </div>
        )}
      </div>

      {/* 학교추가 모드: 단일 년도 인라인 */}
      {isAdd && years.length > 0 && (() => {
        const y = years[0];
        return (
          <div className="flex gap-2 items-end">
            <div className="flex-none w-30 min-w-0">
              <Select
                label="주관구매"
                placeholder="주관구매 진행"
                options={[
                  { value: "in-progress", label: "진행" },
                  { value: "completed", label: "종료" },
                  { value: "pending", label: "대기" },
                ]}
                value=""
                onChange={() => {}}
                fullWidth
              />
            </div>
            <div className="flex-none w-30 min-w-0">
              <Select
                label="진행년도"
                placeholder="년도"
                options={activeYearOptions}
                value={String(y.year)}
                onChange={(v) => handleYearChange(y._id, "year", Number(v))}
                fullWidth
              />
            </div>
            <div className="flex-none w-30 min-w-0">
              <Input
                label="예상인원"
                placeholder="100"
                type="number"
                value={String(y.expected_student_count ?? "")}
                onChange={(e) => handleYearChange(y._id, "expected_student_count", Number(e.target.value))}
                fullWidth
              />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                label="측정기간"
                type="date"
                value={y.measurement_start_date ?? ""}
                onChange={(e) => handleYearChange(y._id, "measurement_start_date", e.target.value)}
                fullWidth
              />
            </div>
            <span className="text-15 text-gray-700 h-12.5 flex items-center">~</span>
            <div className="flex-none w-45 min-w-0">
              <Input
                label=" "
                type="date"
                value={y.measurement_end_date ?? ""}
                onChange={(e) => handleYearChange(y._id, "measurement_end_date", e.target.value)}
                fullWidth
              />
            </div>
          </div>
        );
      })()}

      {/* 디테일 모드: 다중 년도 */}
      {!isAdd && years.map((y) => (
        <div key={y._id} className="flex flex-col gap-3 py-2 border-b border-gray-200 last:border-b-0">
          <div className="flex gap-2 items-end">
            <div className="flex-none w-25 min-w-0">
              {isEdit ? (
                <Select
                  label="진행년도"
                  options={activeYearOptions}
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
              {isEdit ? (
                <Input
                  label="예상인원"
                  type="number"
                  value={String(y.expected_student_count ?? "")}
                  onChange={(e) => handleYearChange(y._id, "expected_student_count", Number(e.target.value))}
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
              {isEdit ? (
                <Input
                  label="측정기간"
                  placeholder="2025-01-01"
                  value={y.measurement_start_date ?? ""}
                  onChange={(e) => handleYearChange(y._id, "measurement_start_date", e.target.value)}
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
              {isEdit ? (
                <Input
                  label=" "
                  placeholder="2025-01-10"
                  value={y.measurement_end_date ?? ""}
                  onChange={(e) => handleYearChange(y._id, "measurement_end_date", e.target.value)}
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
            {isEdit && (
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

      {!isAdd && isEdit && (
        <button
          className="flex items-center justify-center px-5 py-2.5 bg-bg-800 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto mt-2 hover:opacity-90"
          onClick={handleAddYear}
        >
          년도 추가
        </button>
      )}

      {/* 명찰 */}
      <NameTagSection
        isEditMode={isEdit}
        hasNameTag={hasNameTag}
        nameTagPrice={nameTagPrice}
        nameTagAttachPrice={nameTagAttachPrice}
        nameTagMinUnit={nameTagMinUnit}
        onHasNameTagChange={(v) => onChange({ hasNameTag: v })}
        onNameTagPriceChange={(v) => onChange({ nameTagPrice: v })}
        onNameTagAttachPriceChange={(v) => onChange({ nameTagAttachPrice: v })}
        onNameTagMinUnitChange={(v) => onChange({ nameTagMinUnit: v })}
      />

      {/* 교복 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-bg-800">교복</span>
          {isEdit && onAddNewProduct && (
            <button
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:opacity-80"
              onClick={() =>
                onAddNewProduct(
                  (item) => {
                    if (item.season === "summer") onChange({ summerProducts: [...summerProducts, item] });
                    else onChange({ winterProducts: [...winterProducts, item] });
                  },
                  (cacheKey, product) => {
                    onChange({
                      productsCache: {
                        ...productsCache,
                        [cacheKey]: [...(productsCache[cacheKey] ?? []), product],
                      },
                    });
                  },
                )
              }
            >
              신규품목 추가
            </button>
          )}
        </div>
        {renderSeasonSection("winter")}
        {renderSeasonSection("summer")}
      </div>
    </div>
  );
};

export function makeEmptyFormState(): SchoolFormState {
  const currentYr = new Date().getFullYear();
  return {
    schoolName: "",
    isPermanent: false,
    hasNameTag: false,
    nameTagPrice: "",
    nameTagAttachPrice: "",
    nameTagMinUnit: "",
    years: [
      {
        _id: `sy-init`,
        year: currentYr,
        measurement_start_date: "",
        measurement_end_date: "",
        expected_student_count: undefined,
      },
    ],
    winterProducts: [],
    summerProducts: [],
    productsCache: {},
    allWinterProducts: [],
    allSummerProducts: [],
  };
}

export function useSchoolFormState(initial?: Partial<SchoolFormState>) {
  const [state, setState] = useState<SchoolFormState>({ ...makeEmptyFormState(), ...initial });
  const onChange = useCallback((patch: Partial<SchoolFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);
  const reset = useCallback(() => setState(makeEmptyFormState()), []);
  return { state, onChange, reset };
}
