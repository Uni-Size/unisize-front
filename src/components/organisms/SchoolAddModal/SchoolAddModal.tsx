import { useState, useCallback } from "react";
import { Modal, Select, Input } from "@components/atoms";
import { getProducts, type Product } from "@/api/product";
import {
  addSupportedSchool,
  addSchoolProducts,
  type SchoolProduct,
} from "@/api/school";

export interface SchoolProductItem {
  id: string;
  category: string;
  gender: string;
  displayName: string;
  contractPrice: number;
  freeQuantity: number;
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

const genderOptions = [
  { value: "M", label: "남" },
  { value: "F", label: "여" },
  { value: "U", label: "공용" },
];

export const SchoolAddModal = ({
  isOpen,
  onClose,
  onSubmit,
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
    async (category: string, gender: string) => {
      const cacheKey = `${category}:${gender}`;
      if (productsCache[cacheKey]) return;
      try {
        const data = await getProducts({ category, gender });
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
    const updateFn = (prev: SchoolProductItem[]) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        if (field === "category") {
          const newCategory = value as string;
          if (p.gender) fetchProducts(newCategory, p.gender);
          return {
            ...p,
            category: newCategory,
            displayName: "",
            contractPrice: 0,
          };
        }
        if (field === "gender") {
          const newGender = value as string;
          if (p.category) fetchProducts(p.category, newGender);
          return { ...p, gender: newGender, displayName: "", contractPrice: 0 };
        }
        if (field === "displayName") {
          const cacheKey = `${p.category}:${p.gender}`;
          const cached = productsCache[cacheKey];
          const matched = cached?.find((item) => item.name === value);
          return {
            ...p,
            displayName: value as string,
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

  const handleSubmit = async () => {
    try {
      await addSupportedSchool({
        school_name: schoolName,
        year: Number(purchaseYear),
        measurement_start_date: measurementStartDate || undefined,
        measurement_end_date: measurementEndDate || undefined,
        notes: undefined,
      });

      const allProducts = [
        ...winterProducts.map((p) => ({ ...p, season: "winter" as const })),
        ...summerProducts.map((p) => ({ ...p, season: "summer" as const })),
      ];

      if (allProducts.length > 0) {
        await addSchoolProducts({
          school_name: schoolName,
          year: Number(purchaseYear),
          products: allProducts.map(
            (p): SchoolProduct => ({
              name: p.displayName,
              category: p.category,
              gender: p.gender,
              season: p.season,
              price: p.contractPrice,
              display_name: p.displayName,
              quantity: p.freeQuantity,
              is_selectable: true,
            }),
          ),
        });
      }

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

  const getDisplayNameOptions = (category: string, gender: string) => {
    const cacheKey = `${category}:${gender}`;
    const products = productsCache[cacheKey];
    if (!products) return [];
    return products.map((p) => ({ value: p.name, label: p.name }));
  };

  const renderProductRow = (
    product: SchoolProductItem,
    season: "winter" | "summer",
  ) => (
    <div key={product.id} className="flex gap-2 items-start">
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
            const options = getDisplayNameOptions(
              product.category,
              product.gender,
            );
            const cacheKey = `${product.category}:${product.gender}`;
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
                value={product.displayName}
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
      <div className="w-27.5 shrink-0">
        <div className="flex items-center h-12.5 px-3 border border-[#c6c6c6] rounded-lg bg-white">
          <input
            type="number"
            className="w-full border-none bg-transparent text-[15px] text-[#4c4c4c] text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
          <span className="text-[15px] text-[#4c4c4c] ml-1 shrink-0">원</span>
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
      <button
        className="shrink-0 flex items-center justify-center w-8 h-8 mt-2.5 border border-[#fecaca] rounded bg-[#fef2f2] text-[#991b1b] cursor-pointer hover:bg-[#fecaca] text-sm"
        onClick={() => handleRemoveProduct(season, product.id)}
      >
        ×
      </button>
    </div>
  );

  const renderProductHeader = () => (
    <div className="flex gap-2 items-start">
      <div className="w-30 shrink-0">
        <span className="px-2 text-base text-bg-800">카테고리</span>
      </div>
      <div className="w-17.5 shrink-0">
        <span className="px-2 text-base text-bg-800">성별</span>
      </div>
      <div className="flex-1 min-w-30">
        <span className="px-2 text-base text-bg-800">표시명</span>
      </div>
      <div className="w-27.5 shrink-0">
        <span className="px-2 text-base text-bg-800">계약가격</span>
      </div>
      <div className="w-17.5 shrink-0">
        <span className="px-2 text-base text-bg-800">무상</span>
      </div>
      <div className="w-8 shrink-0" />
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
            className="px-6 py-2.5 bg-[#6c757d] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleSubmit}
          >
            추가
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-190 mx-auto">
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
          <span className="text-[15px] text-[#4c4c4c] h-12.5 flex items-center">
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
          <span className="text-base font-medium text-bg-800">교복</span>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#4c4c4c]">동복</span>
            {winterProducts.length === 0 ? (
              <p className="text-[15px] text-bg-400 text-center py-4 m-0">
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
              className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-[15px] text-[#f9fafb] cursor-pointer mx-auto hover:opacity-90"
              onClick={() => handleAddProduct("winter")}
            >
              동복 품목 추가
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-[#4c4c4c]">하복</span>
            {summerProducts.length === 0 ? (
              <p className="text-[15px] text-bg-400 text-center py-4 m-0">
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
              className="flex items-center justify-center px-5 py-2.5 bg-primary-900 border-none rounded-lg text-[15px] text-[#f9fafb] cursor-pointer mx-auto hover:opacity-90"
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
