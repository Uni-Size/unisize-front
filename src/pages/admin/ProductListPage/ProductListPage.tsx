import { useState, useEffect, useCallback } from "react";
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
  createProduct,
  updateProduct,
  deleteProduct,
  type Product as ApiProduct,
} from "@/api/product";
import { getApiErrorMessage } from "@/utils/errorUtils";

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
}

const seasonLabel: Record<string, string> = {
  S: "하복",
  W: "동복",
  A: "사계절",
};

const categoryLabel: Record<string, string> = {
  shirt: "셔츠",
  pants: "바지",
  skirt: "치마",
};

const genderLabel: Record<string, string> = {
  M: "남",
  F: "여",
  U: "공용",
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}/${mm}/${dd}`;
};

const toProductRow = (
  item: ApiProduct,
  index: number,
  page: number,
  limit: number,
): ProductRow => ({
  id: String(item.id),
  no: (page - 1) * limit + index + 1,
  season: seasonLabel[item.season ?? ""] ?? item.season ?? "",
  category: categoryLabel[item.category] ?? item.category,
  gender: genderLabel[item.gender] ?? item.gender,
  productName: item.name,
  price: item.price,
  isRepair: item.is_repair,
  isRepairRequired: item.is_repair_required,
  rawSeason: item.season ?? "",
  rawCategory: item.category,
  rawGender: item.gender,
  createdDate: formatDate(item.created_at),
  modifiedDate: formatDate(item.updated_at),
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
  const [error, setError] = useState<string | null>(null);
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

  const handleAddProduct = async (data: ProductAddData) => {
    try {
      await createProduct({
        category: data.category,
        gender: data.gender,
        is_repair: data.isRepairable === "yes",
        is_repair_required: data.isRepairRequired === "required",
        name: data.displayName,
        price: data.originalPrice,
        season: data.season,
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

  const handleOpenDetailModal = (product: ProductRow) => {
    const detailData: ProductDetailData = {
      id: product.id,
      season: product.rawSeason,
      category: product.rawCategory,
      gender: product.rawGender,
      displayName: product.productName,
      originalPrice: product.price,
      isRepairable: product.isRepair ? "yes" : "no",
      isRepairRequired: product.isRepairRequired ? "required" : "optional",
      sizeUnit: "5",
      schools: [],
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

  const handleUpdateProduct = async (data: ProductDetailData) => {
    try {
      await updateProduct(Number(data.id), {
        category: data.category,
        gender: data.gender,
        is_repair: data.isRepairable === "yes",
        is_repair_required: data.isRepairRequired === "required",
        name: data.displayName,
        price: data.originalPrice,
        season: data.season,
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

  const columns: Column<ProductRow>[] = [
    { key: "no", header: "No.", width: "40px", align: "center" },
    { key: "season", header: "시즌", width: "60px", align: "center" },
    { key: "category", header: "카테고리", width: "80px", align: "center" },
    { key: "gender", header: "성별", width: "40px", align: "center" },
    { key: "productName", header: "상품명", align: "center" },
    {
      key: "price",
      header: "가격",
      width: "100px",
      align: "center",
      render: (product) => <span>{product.price.toLocaleString()}원</span>,
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
            className="px-3 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#e5e7eb] text-[#374151]"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDetailModal(product);
            }}
          >
            수정
          </button>
          <button
            className="px-3 py-1 border-none rounded text-xs cursor-pointer hover:opacity-80 bg-[#fecaca] text-[#991b1b]"
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
        />

        <div className="border-y border-gray-200 overflow-hidden">
          {/* 검색어 */}
          <div className="flex items-stretch border-b border-gray-200">
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
              검색어
            </div>
            <div className="flex items-center gap-3 flex-1 px-4 py-3 bg-white">
              <select
                className="h-9 px-3 py-1.5 border border-gray-200 rounded text-[14px] text-gray-700 bg-white"
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
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
              시즌
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white border-r border-gray-200">
              {[
                { value: "", label: "전체" },
                { value: "W", label: "동복(W)" },
                { value: "S", label: "하복(S)" },
                { value: "A", label: "사계절(A)" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer">
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
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
              성별
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {[
                { value: "", label: "전체" },
                { value: "F", label: "여자(F)" },
                { value: "M", label: "남자(M)" },
                { value: "U", label: "공용(U)" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer">
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
            <div className="flex items-center justify-center min-w-25 px-4 py-3 bg-gray-100 text-[14px] font-medium text-gray-700 border-r border-gray-200">
              카테고리
            </div>
            <div className="flex items-center gap-4 flex-1 px-4 py-3 bg-white">
              {[
                { value: "", label: "전체" },
                { value: "shirt", label: "상의" },
                { value: "pants", label: "하의" },
                { value: "skirt", label: "용품" },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-1.5 text-[14px] text-gray-700 cursor-pointer">
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
