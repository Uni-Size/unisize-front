import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { AdminLayout } from "@components/templates/AdminLayout";
import { AdminHeader } from "@components/organisms/AdminHeader";
import {
  ProductAddModal,
  ProductDetailModal,
  SchoolSelectModal,
} from "@components/organisms";
import type {
  SchoolPrice,
  ProductAddData,
} from "@components/organisms/ProductAddModal";
import type { ProductDetailData } from "@components/organisms/ProductDetailModal";
import { Table } from "@components/atoms/Table";
import { Input } from "@components/atoms/Input";
import { Button } from "@components/atoms/Button";
import { Pagination } from "@components/atoms/Pagination";
import type { Column } from "@components/atoms/Table";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  type Product as ApiProduct,
} from "@/api/product";
import { getApiErrorMessage } from "@/utils/errorUtils";
import { downloadCSV } from "@/utils/csvUtils";
import { CATEGORY_LABEL_MAP } from "@/constants/productCategories";
import { GENDER_LABEL_MAP, GENDER_OPTIONS } from "@/constants/gender";

interface ProductRow {
  id: string;
  no: number;
  season: string;
  category: string;
  gender: string;
  productName: string;
  price: number;
  isRepair: boolean;
  isRepairRequired: boolean;
  rawSeason: string;
  rawCategory: string;
  rawGender: string;
  createdDate: string;
  modifiedDate: string;
  // TODO: API 응답에 추가되면 실제 값으로 교체
  schoolCount: number;
  stockStatus: "정상" | "부족재고 있음";
}

const seasonLabel: Record<string, string> = {
  S: "하복",
  W: "동복",
  A: "사계절",
};


const genderLabel = GENDER_LABEL_MAP;


const toProductRow = (
  item: ApiProduct,
  index: number,
  page: number,
  limit: number,
): ProductRow => ({
  id: String(item.id),
  no: (page - 1) * limit + index + 1,
  season: seasonLabel[item.season ?? ""] ?? item.season ?? "",
  category: CATEGORY_LABEL_MAP[item.category] ?? item.category,
  gender: genderLabel[item.gender] ?? item.gender,
  productName: item.name,
  price: item.price,
  isRepair: item.is_repair,
  isRepairRequired: item.is_repair_required,
  rawSeason: item.season ?? "",
  rawCategory: item.category,
  rawGender: item.gender,
  createdDate: item.created_at ?? "",
  modifiedDate: item.updated_at ?? "",
  schoolCount: 0, // HARDCODED: API 응답에 추가되면 실제 값으로 교체
  stockStatus: "정상", // HARDCODED: API 응답에 추가되면 실제 값으로 교체
});

export const ProductListPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("통합검색");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [seasonFilter, setSeasonFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ReactNode>(null);
  const itemsPerPage = 10;

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductDetailData | null>(null);
  const [selectedSchools, setSelectedSchools] = useState<SchoolPrice[]>([]);

  const fetchProducts = useCallback(
    async (
      page: number,
      category?: string,
      gender?: string,
      season?: string,
      search?: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({
          page,
          limit: itemsPerPage,
          category: category || undefined,
          gender: gender || undefined,
          season: season || undefined,
          search: search || undefined,
        });
        setProducts(
          data.products.map((item, idx) =>
            toProductRow(item, idx, page, itemsPerPage),
          ),
        );
        setTotalPages(Math.ceil(data.total / itemsPerPage) || 1);
      } catch (err) {
        console.error("상품 목록 조회 실패:", err);
        setError(getApiErrorMessage(err, "상품 목록을 불러오는 중 오류가 발생했습니다."));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // 초기 로드: 필터 없이 전체 조회
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts(1, categoryFilter, genderFilter, seasonFilter, searchTerm);
  };

  const handleReset = () => {
    setSearchTerm("");
    setSearchType("통합검색");
    setCategoryFilter("");
    setGenderFilter("");
    setSeasonFilter("");
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, categoryFilter, genderFilter, seasonFilter, searchTerm);
  };

  const handleOpenAddModal = () => {
    setSelectedSchools([]);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedSchools([]);
  };

  const apiSizesToSizeType = (sizes?: { size_type: string; size_step?: number }[]): string => {
    const first = sizes?.[0];
    if (!first) return "";
    if (first.size_type === "numeric") return first.size_step === 3 ? "numeric_3" : "numeric_5";
    if (first.size_type === "alpha") return "alpha";
    if (first.size_type === "free") return "free";
    return "";
  };

  const sizeTypeToApiSizes = (sizeType: string) => {
    if (!sizeType) return undefined;
    if (sizeType === "numeric_5") return [{ size: "numeric", size_type: "numeric" as const, size_step: 5 as const }];
    if (sizeType === "numeric_3") return [{ size: "numeric", size_type: "numeric" as const, size_step: 3 as const }];
    if (sizeType === "alpha") return [{ size: "alpha", size_type: "alpha" as const }];
    if (sizeType === "free") return [{ size: "free", size_type: "free" as const }];
    return undefined;
  };

  const handleAddProduct = async (data: ProductAddData) => {
    try {
      await createProduct({
        category: data.category,
        gender: data.gender,
        is_repair: data.isRepairable === "yes" ? true : data.isRepairable === "no" ? false : undefined,
        is_repair_required: data.isRepairRequired === "required" ? true : data.isRepairRequired === "optional" ? false : undefined,
        name: data.displayName,
        price: data.originalPrice,
        season: data.season || undefined,
        sizes: sizeTypeToApiSizes(data.sizeType),
      });
      handleCloseAddModal();
      fetchProducts(currentPage, categoryFilter, genderFilter, seasonFilter, searchTerm);
    } catch (err: unknown) {
      const errData = (
        err as {
          response?: {
            data?: {
              error?: {
                message?: string;
                details?: string | Record<string, string>;
              };
            };
          };
        }
      )?.response?.data?.error;
      const message = errData?.message ?? "상품 추가에 실패했습니다.";
      const details = errData?.details;
      const detailStr =
        typeof details === "object" && details !== null
          ? Object.values(details).join("\n")
          : (details ?? "");
      alert(detailStr ? `${message}\n\n${detailStr}` : message);
    }
  };

  const handleOpenDetailModal = async (product: ProductRow) => {
    try {
      const detail = await getProduct(Number(product.id));
      const detailData: ProductDetailData = {
        id: product.id,
        season: detail.season ?? "",
        category: detail.category,
        gender: detail.gender,
        displayName: detail.name,
        originalPrice: detail.price,
        isRepairable: detail.is_repair ? "yes" : "no",
        isRepairRequired: detail.is_repair_required ? "required" : "optional",
        sizeType: apiSizesToSizeType(detail.sizes),
        schools: [],
      };
      setSelectedProduct(detailData);
      setSelectedSchools([]);
      setIsDetailModalOpen(true);
    } catch (err) {
      console.error("상품 상세 조회 실패:", err);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
    setSelectedSchools([]);
  };

  const handleUpdateProduct = async (data: ProductDetailData) => {
    try {
      await updateProduct(Number(data.id), {
        category: data.category,
        gender: data.gender,
        is_repair: data.isRepairable === "yes" ? true : data.isRepairable === "no" ? false : undefined,
        is_repair_required: data.isRepairRequired === "required" ? true : data.isRepairRequired === "optional" ? false : undefined,
        name: data.displayName,
        price: data.originalPrice,
        season: data.season || undefined,
        sizes: sizeTypeToApiSizes(data.sizeType),
      });
      handleCloseDetailModal();
      fetchProducts(currentPage, categoryFilter, genderFilter, seasonFilter, searchTerm);
    } catch (error) {
      console.error("상품 수정 실패:", error);
    }
  };

  const handleOpenSchoolModal = () => {
    setIsSchoolModalOpen(true);
  };

  const handleCloseSchoolModal = () => {
    setIsSchoolModalOpen(false);
  };

  const handleAddSchool = (
    schoolId: string,
    schoolName: string,
    price: number,
    year: string,
  ) => {
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
      prev.map((s) => (s.schoolId === schoolId ? { ...s, price } : s)),
    );
  };

  const handleExportCSV = async () => {
    try {
      const data = await getProducts({
        category: categoryFilter || undefined,
        gender: genderFilter || undefined,
        season: seasonFilter || undefined,
        search: searchTerm || undefined,
        limit: 99999,
      });
      downloadCSV(
        ['No.', '시즌', '카테고리', '성별', '상품명', '가격', '생성일', '수정일'],
        data.products.map((p, i) => [
          i + 1,
          seasonLabel[p.season ?? ''] ?? p.season ?? '',
          CATEGORY_LABEL_MAP[p.category] ?? p.category,
          genderLabel[p.gender] ?? p.gender,
          p.name,
          `${p.price.toLocaleString()}원`,
          p.created_at ?? "",
          p.updated_at ?? "",
        ]),
        '교복용품목록',
      );
    } catch (err) {
      console.error('CSV 내보내기 실패:', err);
    }
  };

  const columns: Column<ProductRow>[] = [
    { key: "no", header: "No.", width: "40px", align: "center" },
    { key: "season", header: "시즌", width: "60px", align: "center" },
    { key: "category", header: "카테고리", width: "80px", align: "center" },
    { key: "gender", header: "성별", width: "40px", align: "center" },
    { key: "productName", header: "상품명", align: "center" },
    {
      key: "schoolCount",
      header: "사용학교",
      width: "80px",
      align: "center",
      render: (product) => <span>{product.schoolCount}</span>, // HARDCODED
    },
    {
      key: "stockStatus",
      header: "재고상태",
      width: "100px",
      align: "center",
      render: (product) => (
        <span
          className={
            product.stockStatus === "정상"
              ? "text-green-600"
              : "text-red-500"
          }
        >
          {product.stockStatus} {/* HARDCODED */}
        </span>
      ),
    },
    { key: "createdDate", header: "생성일", width: "80px", align: "center" },
    { key: "modifiedDate", header: "수정일", width: "80px", align: "center" },
    {
      key: "detail",
      header: "상세",
      width: "40px",
      align: "center",
      render: (product) => (
        <button
          className="flex items-center justify-center bg-transparent border-none cursor-pointer p-0 hover:opacity-70"
          aria-label="상세 보기"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetailModal(product);
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ),
    },
    {
      key: "actions",
      header: "관리",
      width: "80px",
      align: "center",
      render: (product) => (
        <div className="flex flex-col gap-1">
          <button
            className="px-3 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-neutral-050 text-bg-800"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailModal(product);
            }}
          >
            수정
          </button>
          <button
            className="px-3 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-red-200 text-red-700"
            onClick={async (e) => {
              e.stopPropagation();
              if (!confirm("정말 삭제하시겠습니까?")) return;
              try {
                await deleteProduct(Number(product.id));
                fetchProducts(
                  currentPage,
                  categoryFilter,
                  genderFilter,
                  searchTerm,
                );
              } catch (error) {
                console.error("상품 삭제 실패:", error);
              }
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col p-5 gap-4">
        <AdminHeader
          title="교복/용품"
          buttonLabel="품목추가"
          onButtonClick={handleOpenAddModal}
          actions={
            <button
              type="button"
              className="flex items-center justify-center w-auto h-8.5 px-4 bg-white border border-gray-300 rounded-lg text-15 font-normal text-gray-700 cursor-pointer transition-opacity duration-200 hover:opacity-80 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleExportCSV}
              disabled={products.length === 0}
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
                <option value="상품명">상품명</option>
              </select>
              <Input
                placeholder="검색어를 입력하세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* 시즌 + 성별 (같은 행) */}
          <div className="flex items-stretch border-b border-gray-200">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              시즌
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white border-r border-gray-200">
              {[
                { value: "", label: "전체" },
                { value: "W", label: "동복(W)" },
                { value: "S", label: "하복(S)" },
                { value: "A", label: "사계절(A)" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seasonFilter === opt.value}
                    onChange={() => setSeasonFilter(seasonFilter === opt.value ? "" : opt.value)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              성별
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {[{ value: "", label: "전체" }, ...GENDER_OPTIONS].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={genderFilter === opt.value}
                    onChange={() => setGenderFilter(genderFilter === opt.value ? "" : opt.value)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* 카테고리 */}
          <div className="flex items-stretch">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-14 font-medium text-gray-700 border-r border-gray-200">
              카테고리
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {[
                { value: "", label: "전체" },
                { value: "shirt", label: "상의" },
                { value: "pants", label: "하의" },
                { value: "skirt", label: "용품" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-14 text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryFilter === opt.value}
                    onChange={() => setCategoryFilter(categoryFilter === opt.value ? "" : opt.value)}
                    className="w-4 h-4 accent-gray-500"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 검색/초기화 버튼 */}
        <div className="flex justify-center gap-3">
          <Button
            variant="primary"
            className="w-auto px-8 py-2.5"
            onClick={handleSearch}
          >
            검색
          </Button>
          <Button
            variant="outline"
            className="w-auto px-8 py-2.5 bg-gray-400! text-white! border-gray-400! hover:bg-gray-500!"
            onClick={handleReset}
          >
            초기화
          </Button>
        </div>

        <div className="flex-1">
          <Table
            columns={columns}
            data={loading ? [] : products}
            onRowClick={(product) => handleOpenDetailModal(product)}
            emptyMessage={loading ? "로딩 중..." : error ?? "데이터가 없습니다."}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <ProductAddModal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        onSubmit={handleAddProduct}
        onOpenSchoolModal={() => handleOpenSchoolModal()}
        selectedSchools={selectedSchools}
        onRemoveSchool={handleRemoveSchool}
        onSchoolPriceChange={handleSchoolPriceChange}
      />

      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        product={selectedProduct}
        onUpdate={handleUpdateProduct}
        onOpenSchoolModal={() => handleOpenSchoolModal()}
        selectedSchools={selectedSchools}
        onRemoveSchool={handleRemoveSchool}
        onSchoolPriceChange={handleSchoolPriceChange}
      />

      <SchoolSelectModal
        isOpen={isSchoolModalOpen}
        onClose={handleCloseSchoolModal}
        onSubmit={handleAddSchool}
        title={selectedProduct?.displayName || "학교 추가"}
      />
    </AdminLayout>
  );
};
