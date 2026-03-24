import { useState, useCallback } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { getAllProducts, type Product } from "@/api/product";
import { GENDER_OPTIONS } from "@/constants/gender";
import {
  addSupportedSchool,
  type UniformItem,
} from "@/api/school";

export interface SchoolProductItem {
  id: string;
  category: string;
  gender: string;
  displayName: string;
  contractPrice: number;
  freeQuantity: number;
  productApiId?: string;
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
  onAddNewProduct?: () => void;
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

const categoryOptions = [
  { value: "상의", label: "상의" },
  { value: "하의", label: "하의" },
  { value: "후드", label: "후드" },
  { value: "아우터", label: "아우터" },
];

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
    field: keyof SchoolProductItem,
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
    free_support_count: p.freeQuantity,
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
      console.error("학교 추가 실패:", error);
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
    <div key={product.id} className="flex gap-2 items-start">
      <button
        className="shrink-0 flex items-center justify-center w-14 h-12.5 border border-delete-border rounded-lg bg-delete-bg text-white cursor-pointer hover:bg-delete-bg-hover text-sm font-medium"
        onClick={() => handleRemoveProduct(season, product.id)}
      >
        삭제
      </button>
      <div className="w-30 shrink-0">
        <Select
          placeholder="카테고리"
          options={categoryOptions}
          value={product.category}
          onChange={(value) =>
            handleProductChange(season, product.id, "category", value)
          }
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
                      : "표시명"
                }
                options={options}
                value={product.productApiId ?? ""}
                onChange={(value) =>
                  handleProductChange(season, product.id, "displayName", value)
                }
                disabled={isLoaded && options.length === 0}
                fullWidth
              />
            );
          })()
        ) : (
          <Select
            placeholder="표시명"
            options={[]}
            value=""
            disabled
            fullWidth
          />
        )}
      </div>
      <div className="w-35 shrink-0">
        <div className="flex items-center h-12.5 px-3 border border-gray-200 rounded-lg bg-white gap-1">
          <input
            type="number"
            className="min-w-0 flex-1 border-none bg-transparent text-15 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
      </div>
      <div className="w-17.5 shrink-0">
        <Input
          placeholder=""
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
          fullWidth
        />
      </div>
    </div>
  );

  const renderProductHeader = () => (
    <div className="flex gap-2 items-start">
      <div className="w-14 shrink-0" />
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

  return (
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
              placeholder="2025.01.01"
              value={measurementStartDate}
              onChange={(e) => setMeasurementStartDate(e.target.value)}
              fullWidth
            />
          </div>
          <span className="text-15 text-gray-700 h-12.5 flex items-center">
            ~
          </span>
          <div className="flex-none w-45 min-w-0">
            <Input
              label=" "
              placeholder="2025.01.10"
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
              onClick={onAddNewProduct}
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
      </div>
    </Modal>
  );
};
