import { useState, useCallback } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import { NameTagSection } from "../NameTagSection/NameTagSection";
import { getAllProducts, type Product } from "@/api/product";
import { GENDER_OPTIONS } from "@/constants/gender";
import { CATEGORY_GROUPS } from "@/constants/productCategories";
import {
  addSupportedSchool,
  type UniformItem,
} from "@/api/school";
import { getApiErrorString } from "@/utils/errorUtils";

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

export interface SchoolAddData {
  schoolName: string;
  purchaseStatus: string;
  purchaseYear: string;
  expectedStudents: number;
  measurementStartDate: string;
  measurementEndDate: string;
  winterProducts: SchoolProductItem[];
  summerProducts: SchoolProductItem[];
}

export interface SchoolAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onAddNewProduct?: (onCreated: (item: SchoolProductItem) => void) => void;
}

const purchaseStatusOptions = [
  { value: "in-progress", label: "진행" },
  { value: "completed", label: "종료" },
  { value: "pending", label: "대기" },
];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 6 }, (_, i) => ({
  value: String(currentYear - 3 + i),
  label: String(currentYear - 3 + i),
}));

const categoryOptions = CATEGORY_GROUPS;

const genderOptions = GENDER_OPTIONS;

export const SchoolAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  onAddNewProduct,
}: SchoolAddModalProps) => {
  const [schoolName, setSchoolName] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [purchaseYear, setPurchaseYear] = useState(String(currentYear));
  const [expectedStudents, setExpectedStudents] = useState("");
  const [measurementStartDate, setMeasurementStartDate] = useState("");
  const [measurementEndDate, setMeasurementEndDate] = useState("");
  const [winterProducts, setWinterProducts] = useState<SchoolProductItem[]>([]);
  const [summerProducts, setSummerProducts] = useState<SchoolProductItem[]>([]);
  const [productsCache, setProductsCache] = useState<Record<string, Product[]>>(
    {},
  );
  const [hasNameTag, setHasNameTag] = useState(false);
  const [nameTagPrice, setNameTagPrice] = useState<number | "">("");
  const [nameTagAttachPrice, setNameTagAttachPrice] = useState<number | "">("");
  const [nameTagMinUnit, setNameTagMinUnit] = useState<number | "">("");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

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

  const handleAddProduct = (season: "winter" | "summer") => {
    const newProduct: SchoolProductItem = {
      id: `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      category: "",
      gender: "",
      displayName: "",
      contractPrice: 0,
      freeQuantity: 1,
    };
    if (season === "winter") {
      setWinterProducts((prev) => [...prev, newProduct]);
    } else {
      setSummerProducts((prev) => [...prev, newProduct]);
    }
  };

  const handleRemoveProduct = (
    season: "winter" | "summer",
    productId: string,
  ) => {
    if (season === "winter") {
      setWinterProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      setSummerProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  const handleProductChange = (
    season: "winter" | "summer",
    productId: string,
    field: keyof SchoolProductItem | "displayName_override",
    value: string | number,
  ) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const updateFn = (prev: SchoolProductItem[]) =>
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
          return { ...p, gender: newGender, displayName: "", productApiId: "", contractPrice: 0 };
        }
        if (field === "displayName") {
          const cacheKey = `${seasonCode}:${p.category}:${p.gender}`;
          const cached = productsCache[cacheKey];
          const matched = cached?.find((item) => String(item.id) === value);
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

    if (season === "winter") {
      setWinterProducts(updateFn);
    } else {
      setSummerProducts(updateFn);
    }
  };

  const toUniformItem = (p: SchoolProductItem): UniformItem => ({
    product_id: Number(p.productApiId),
    contract_price: p.contractPrice,
    quantity: p.freeQuantity,
    has_name_tag: hasNameTag,
    name_tag_price: hasNameTag && nameTagPrice !== "" ? nameTagPrice : undefined,
    name_tag_attach_price: hasNameTag && nameTagAttachPrice !== "" ? nameTagAttachPrice : undefined,
    name_tag_min_unit: hasNameTag && nameTagMinUnit !== "" ? nameTagMinUnit : undefined,
  });

  const handleSubmit = async () => {
    try {
      const winter = winterProducts.filter((p) => p.productApiId).map(toUniformItem);
      const summer = summerProducts.filter((p) => p.productApiId).map(toUniformItem);

      await addSupportedSchool({
        school_name: schoolName,
        year: Number(purchaseYear),
        expected_student_count: expectedStudents ? Number(expectedStudents) : undefined,
        measurement_start_date: measurementStartDate || undefined,
        measurement_end_date: measurementEndDate || undefined,
        uniforms: (winter.length > 0 || summer.length > 0)
          ? { winter: winter.length > 0 ? winter : undefined, summer: summer.length > 0 ? summer : undefined }
          : undefined,
      });

      onSubmit();
      handleClose();
    } catch (error) {
      setToast({ message: getApiErrorString(error, "학교 추가 중 오류가 발생했습니다."), variant: "error" });
    }
  };

  const handleClose = () => {
    setSchoolName("");
    setPurchaseStatus("");
    setPurchaseYear(String(currentYear));
    setExpectedStudents("");
    setMeasurementStartDate("");
    setMeasurementEndDate("");
    setWinterProducts([]);
    setSummerProducts([]);
    setProductsCache({});
    setHasNameTag(false);
    setNameTagPrice("");
    setNameTagAttachPrice("");
    setNameTagMinUnit("");
    onClose();
  };

  const getDisplayNameOptions = (season: "winter" | "summer", category: string, gender: string) => {
    const seasonCode = season === "winter" ? "W" : "S";
    const cacheKey = `${seasonCode}:${category}:${gender}`;
    const products = productsCache[cacheKey];
    if (!products) return [];
    return products.map((p) => ({ value: String(p.id), label: p.name }));
  };

  const renderProductRow = (
    product: SchoolProductItem,
    season: "winter" | "summer",
  ) => (
    <div key={product.id} className="flex flex-col gap-1">
      <div className="flex gap-2 items-start">
        <button
          className="shrink-0 flex items-center justify-center w-9 h-9 border border-delete-border rounded-lg bg-delete-bg text-white cursor-pointer hover:bg-delete-bg-hover text-xs font-medium"
          onClick={() => handleRemoveProduct(season, product.id)}
        >
          삭제
        </button>
        <div className="w-30 shrink-0">
          <Select
            placeholder="카테고리"
            options={categoryOptions.flatMap((g) => g.options)}
            groups={categoryOptions}
            value={product.category}
            onChange={(value) =>
              handleProductChange(season, product.id, "category", value)
            }
            searchable
            size="sm"
            fullWidth
          />
        </div>
        <div className="w-17.5 shrink-0">
          <Select
            placeholder="성별"
            options={genderOptions}
            value={product.gender}
            onChange={(value) =>
              handleProductChange(season, product.id, "gender", value)
            }
            size="sm"
            fullWidth
          />
        </div>
        <div className="flex-1 min-w-30">
          {product.category && product.gender ? (
            (() => {
              const seasonCode = season === "winter" ? "W" : "S";
              const options = getDisplayNameOptions(
                season,
                product.category,
                product.gender,
              );
              const cacheKey = `${seasonCode}:${product.category}:${product.gender}`;
              const isLoaded = cacheKey in productsCache;
              return (
                <Select
                  placeholder={
                    !isLoaded
                      ? "불러오는 중..."
                      : options.length === 0
                        ? "등록된 아이템이 없습니다"
                        : "제품 검색"
                  }
                  options={options}
                  value={product.productApiId ?? ""}
                  onChange={(value) =>
                    handleProductChange(season, product.id, "displayName", value)
                  }
                  disabled={isLoaded && options.length === 0}
                  searchable
                  size="sm"
                  fullWidth
                />
              );
            })()
          ) : (
            <Select
              placeholder="제품 검색"
              options={[]}
              value=""
              disabled
              size="sm"
              fullWidth
            />
          )}
        </div>
        <div className="w-44 shrink-0">
          <input
            className="w-full h-9 px-2.5 border border-gray-200 rounded-lg bg-white text-13 text-gray-700 outline-none focus:border-gray-400 placeholder:text-bg-400"
            placeholder="표시명"
            value={product.displayName}
            onChange={(e) =>
              handleProductChange(season, product.id, "displayName_override", e.target.value)
            }
          />
        </div>
        <div className="w-35 shrink-0">
          <div className="flex items-center h-9 px-2.5 border border-gray-200 rounded-lg bg-white gap-1">
            <input
              type="number"
              className="min-w-0 flex-1 border-none bg-transparent text-13 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
            <span className="text-13 text-gray-700 shrink-0">원</span>
          </div>
        </div>
        <div className="w-12 shrink-0">
          <Input
            placeholder="0"
            type="number"
            value={String(product.freeQuantity || "")}
            onChange={(e) =>
              handleProductChange(
                season,
                product.id,
                "freeQuantity",
                Number(e.target.value),
              )
            }
            size="sm"
            fullWidth
          />
        </div>
      </div>
    </div>
  );

  const renderProductHeader = () => (
    <div className="flex gap-2 items-start">
      <div className="w-9 shrink-0" />
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

  return (
    <>
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="학교추가"
      width={850}
      actions={
        <>
          <button
            className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleSubmit}
          >
            추가
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-2 items-end">
          <div className="flex-1 min-w-0">
            <Input
              label="학교명"
              placeholder="학교명"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-none w-30 min-w-0">
            <Select
              label="주관구매"
              placeholder="주관구매 진행"
              options={purchaseStatusOptions}
              value={purchaseStatus}
              onChange={setPurchaseStatus}
              fullWidth
            />
          </div>
          <div className="flex-none w-30 min-w-0">
            <Select
              label="진행년도"
              placeholder="년도"
              options={yearOptions}
              value={purchaseYear}
              onChange={setPurchaseYear}
              fullWidth
            />
          </div>
          <div className="flex-none w-30 min-w-0">
            <Input
              label="예상인원"
              placeholder="100"
              type="number"
              value={expectedStudents}
              onChange={(e) => setExpectedStudents(e.target.value)}
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-0">
            <Input
              label="측정기간"
              type="date"
              value={measurementStartDate}
              onChange={(e) => {
                const start = e.target.value;
                setMeasurementStartDate(start);
                if (start) {
                  const d = new Date(start);
                  d.setDate(d.getDate() + 3);
                  setMeasurementEndDate(d.toISOString().slice(0, 10));
                }
              }}
              fullWidth
            />
          </div>
          <span className="text-15 text-gray-700 h-12.5 flex items-center">
            ~
          </span>
          <div className="flex-none w-45 min-w-0">
            <Input
              label=" "
              type="date"
              value={measurementEndDate}
              onChange={(e) => setMeasurementEndDate(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium text-bg-800">교복</span>
            <button
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 cursor-pointer hover:opacity-80"
              onClick={() => onAddNewProduct?.((item) => {
                if (item.season === "summer") {
                  setSummerProducts((prev) => [...prev, item]);
                } else {
                  setWinterProducts((prev) => [...prev, item]);
                }
              })}
            >
              신규품목 추가
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-700">동복</span>
            {winterProducts.length === 0 ? (
              <p className="text-15 text-bg-400 text-center py-4 m-0">
                동복이 구성되지 않았습니다
              </p>
            ) : (
              <>
                {renderProductHeader()}
                <div className="flex flex-col gap-2">
                  {winterProducts.map((product) =>
                    renderProductRow(product, "winter"),
                  )}
                </div>
              </>
            )}
            <button
              className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto hover:opacity-90"
              onClick={() => handleAddProduct("winter")}
            >
              동복 품목 추가
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-gray-700">하복</span>
            {summerProducts.length === 0 ? (
              <p className="text-15 text-bg-400 text-center py-4 m-0">
                하복이 구성되지 않았습니다
              </p>
            ) : (
              <>
                {renderProductHeader()}
                <div className="flex flex-col gap-2">
                  {summerProducts.map((product) =>
                    renderProductRow(product, "summer"),
                  )}
                </div>
              </>
            )}
            <button
              className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-15 text-bg-050 cursor-pointer mx-auto hover:opacity-90"
              onClick={() => handleAddProduct("summer")}
            >
              하복 품목 추가
            </button>
          </div>
        </div>

        {/* 명찰 */}
        <NameTagSection
          hasNameTag={hasNameTag}
          nameTagPrice={nameTagPrice}
          nameTagAttachPrice={nameTagAttachPrice}
          nameTagMinUnit={nameTagMinUnit}
          onHasNameTagChange={setHasNameTag}
          onNameTagPriceChange={setNameTagPrice}
          onNameTagAttachPriceChange={setNameTagAttachPrice}
          onNameTagMinUnitChange={setNameTagMinUnit}
        />
      </div>
    </Modal>
    {toast && (
      <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
    )}
    </>
  );
};
