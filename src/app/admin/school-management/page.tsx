"use client";

import { useState, useEffect } from "react";
import { getSupportedSchoolsByYear, addSupportedSchool, updateSupportedSchool, addSchoolProducts, type AddSchoolRequest, type UpdateSchoolRequest, type School, type SchoolProduct } from "@/api/schoolApi";

// 현재 월에 따라 조회할 연도 결정 (12월이면 내년)
const getTargetYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 0-based이므로 +1
  const currentYear = now.getFullYear();
  return currentMonth === 12 ? currentYear + 1 : currentYear;
};

export default function AddSchoolPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [selectedYear, setSelectedYear] = useState(getTargetYear());
  const [formData, setFormData] = useState<AddSchoolRequest>({
    school_name: "",
    year: getTargetYear(),
    measurement_start_date: "",
    measurement_end_date: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<SchoolProduct[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);

  const loadSchools = async () => {
    setIsLoading(true);
    try {
      const data = await getSupportedSchoolsByYear(selectedYear);
      setSchools(data);
    } catch (error) {
      console.error("Failed to load schools:", error);
      alert("학교 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 학교 목록 로드
  useEffect(() => {
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.school_name.trim()) {
      alert("학교명을 입력해주세요.");
      return;
    }

    if (!formData.year) {
      alert("연도를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 빈 값인 선택사항 필드 제거
      const submitData: UpdateSchoolRequest = {
        school_name: formData.school_name,
        year: formData.year,
      };

      if (formData.measurement_start_date) {
        submitData.measurement_start_date = formData.measurement_start_date;
      }
      if (formData.measurement_end_date) {
        submitData.measurement_end_date = formData.measurement_end_date;
      }
      if (formData.notes?.trim()) {
        submitData.notes = formData.notes;
      }

      let needsSchoolUpdate = false;

      if (editingSchool) {
        // 수정 모드 - 데이터가 변경되었는지 확인
        needsSchoolUpdate =
          editingSchool.name !== formData.school_name ||
          editingSchool.year !== formData.year ||
          (editingSchool.measurement_start_date || "") !== (formData.measurement_start_date || "") ||
          (editingSchool.measurement_end_date || "") !== (formData.measurement_end_date || "") ||
          (editingSchool.notes || "") !== (formData.notes || "");

        if (needsSchoolUpdate) {
          await updateSupportedSchool(editingSchool.id, submitData);
        }
      } else {
        // 추가 모드
        await addSupportedSchool(submitData);
        needsSchoolUpdate = true;
      }

      // 학교 정보가 변경되었거나 새로 추가된 경우에만 알림
      if (needsSchoolUpdate) {
        alert(editingSchool ? "학교 정보가 성공적으로 수정되었습니다." : "학교가 성공적으로 추가되었습니다.");
      }

      // 제품 추가 단계로 이동
      setShowProductForm(true);
    } catch (error) {
      console.error("Failed to save school:", error);
      alert(editingSchool ? "학교 수정에 실패했습니다." : "학교 추가에 실패했습니다.");
      setIsSubmitting(false);
    } finally {
      if (!showProductForm) {
        setIsSubmitting(false);
      }
    }
  };

  const handleOpenModal = () => {
    setEditingSchool(null);
    setFormData({
      school_name: "",
      year: selectedYear,
      measurement_start_date: "",
      measurement_end_date: "",
      notes: "",
    });
    setProducts([]);
    setShowProductForm(false);
    setIsModalOpen(true);
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setFormData({
      school_name: school.name,
      year: school.year,
      measurement_start_date: school.measurement_start_date || "",
      measurement_end_date: school.measurement_end_date || "",
      notes: school.notes || "",
    });
    setProducts([]);
    setShowProductForm(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchool(null);
    setProducts([]);
    setShowProductForm(false);
  };

  const handleAddProduct = () => {
    const newProduct: SchoolProduct = {
      name: "",
      category: "",
      gender: "",
      season: "",
      price: 0,
      display_name: "",
      quantity: 0,
      is_selectable: false,
      selectable_with: [],
    };
    setProducts([...products, newProduct]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, field: keyof SchoolProduct, value: string | number | boolean | number[]) => {
    const updatedProducts = [...products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      [field]: value,
    };
    setProducts(updatedProducts);
  };

  const handleSaveProducts = async () => {
    if (products.length === 0) {
      alert("제품을 추가해주세요.");
      return;
    }

    // 제품 필수 필드 검증
    for (const product of products) {
      if (!product.name.trim()) {
        alert("제품명을 입력해주세요.");
        return;
      }
      if (!product.category.trim()) {
        alert("카테고리를 입력해주세요.");
        return;
      }
      if (!product.gender.trim()) {
        alert("성별을 선택해주세요.");
        return;
      }
      if (!product.season.trim()) {
        alert("시즌을 선택해주세요.");
        return;
      }
      if (!product.display_name.trim()) {
        alert("표시명을 입력해주세요.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await addSchoolProducts({
        school_name: formData.school_name,
        year: formData.year,
        products,
      });

      alert("제품이 성공적으로 추가되었습니다.");

      // 폼 초기화 및 모달 닫기
      setFormData({
        school_name: "",
        year: new Date().getFullYear(),
        measurement_start_date: "",
        measurement_end_date: "",
        notes: "",
      });
      setProducts([]);
      setShowProductForm(false);
      setIsModalOpen(false);
      setEditingSchool(null);

      // 학교 목록 새로고침
      loadSchools();
    } catch (error) {
      console.error("Failed to add products:", error);
      alert("제품 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipProducts = () => {
    // 제품 추가를 건너뛰고 모달 닫기
    setFormData({
      school_name: "",
      year: new Date().getFullYear(),
      measurement_start_date: "",
      measurement_end_date: "",
      notes: "",
    });
    setProducts([]);
    setShowProductForm(false);
    setIsModalOpen(false);
    setEditingSchool(null);

    // 학교 목록 새로고침
    loadSchools();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 헤더 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">지원 학교 관리</h2>
            <p className="text-sm text-gray-600 mt-2">
              지원 학교 목록을 조회하고 관리합니다.
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
          >
            <span className="text-xl">+</span>
            학교 추가
          </button>
        </div>

        {/* 연도 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            조회 연도
          </label>
          <div className="flex items-center gap-3 flex-wrap">
            {Array.from({ length: 7 }, (_, i) => {
              const targetYear = getTargetYear();
              const year = targetYear - 3 + i;
              return (
                <label
                  key={year}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
                    selectedYear === year
                      ? "bg-blue-50 border-blue-500 text-blue-700"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="year"
                    value={year}
                    checked={selectedYear === year}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-4 h-4 text-blue-600 cursor-pointer"
                  />
                  <span className="font-medium">{year}년</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* 학교 목록 테이블 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">로딩 중...</div>
        ) : schools.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            등록된 학교가 없습니다. + 버튼을 눌러 학교를 추가하세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-4 py-3 text-center font-medium text-gray-700">
                    번호
                  </th>
                  <th className="border px-4 py-3 text-center font-medium text-gray-700">
                    학교명
                  </th>
                  <th className="border px-4 py-3 text-center font-medium text-gray-700">
                    연도
                  </th>
                  <th className="border px-4 py-3 text-center font-medium text-gray-700">
                    측정 기간
                  </th>
                  <th className="border px-4 py-3 text-center font-medium text-gray-700">
                    비고
                  </th>
                  <th className="border px-4 py-3 text-center font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school, index) => (
                  <tr key={school.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-3 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-3 text-center font-medium">
                      {school.name}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      {school.year}년
                    </td>
                    <td className="border px-4 py-3 text-center text-gray-600">
                      {school.measurement_start_date && school.measurement_end_date
                        ? `${school.measurement_start_date} ~ ${school.measurement_end_date}`
                        : school.measurement_start_date
                        ? `${school.measurement_start_date} ~`
                        : school.measurement_end_date
                        ? `~ ${school.measurement_end_date}`
                        : "-"}
                    </td>
                    <td className="border px-4 py-3 text-center text-gray-600">
                      {school.notes || "-"}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditSchool(school)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 학교 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="border-b px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-bold">
                {editingSchool ? "학교 수정" : "학교 추가"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            {/* 모달 바디 */}
            {!showProductForm ? (
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                {/* 학교명 (필수) */}
                <div>
                  <label
                    htmlFor="school_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    학교명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="school_name"
                    name="school_name"
                    value={formData.school_name}
                    onChange={handleChange}
                    required
                    placeholder="예: 서울고등학교"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 연도 (필수) */}
                <div>
                  <label
                    htmlFor="year"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    연도 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="year"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    min="2000"
                    max="2100"
                    placeholder="2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 측정 시작일 (선택) */}
                <div>
                  <label
                    htmlFor="measurement_start_date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    측정 시작일 <span className="text-gray-400 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="date"
                    id="measurement_start_date"
                    name="measurement_start_date"
                    value={formData.measurement_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 측정 종료일 (선택) */}
                <div>
                  <label
                    htmlFor="measurement_end_date"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    측정 종료일 <span className="text-gray-400 text-xs">(선택사항)</span>
                  </label>
                  <input
                    type="date"
                    id="measurement_end_date"
                    name="measurement_end_date"
                    value={formData.measurement_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 비고 (선택) */}
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    비고 <span className="text-gray-400 text-xs">(선택사항)</span>
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="입찰 정보 등 비고사항을 입력하세요"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* 안내 메시지 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    입력 안내
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                    <li>학교명과 연도는 필수 입력 항목입니다.</li>
                    <li>측정 시작일과 종료일은 선택사항입니다.</li>
                    <li>비고란에는 입찰 정보 등 추가 정보를 입력할 수 있습니다.</li>
                  </ul>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={isSubmitting}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "저장 중..."
                    : "다음 (제품 추가)"}
                </button>
              </div>
            </form>
            ) : (
              /* 제품 추가 폼 */
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-2">학교 정보</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm"><span className="font-medium">학교명:</span> {formData.school_name}</p>
                    <p className="text-sm"><span className="font-medium">연도:</span> {formData.year}년</p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-semibold">제품 목록</h4>
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      + 제품 추가
                    </button>
                  </div>

                  {products.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg">
                      제품을 추가해주세요
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {products.map((product, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <h5 className="font-medium">제품 {index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(index)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              삭제
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                제품명 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={product.name}
                                onChange={(e) => handleProductChange(index, "name", e.target.value)}
                                placeholder="예: 동복 상의"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                표시명 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={product.display_name}
                                onChange={(e) => handleProductChange(index, "display_name", e.target.value)}
                                placeholder="예: 동복 상의 (학교용)"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                카테고리 <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={product.category}
                                onChange={(e) => handleProductChange(index, "category", e.target.value)}
                                placeholder="예: 상의"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                성별 <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={product.gender}
                                onChange={(e) => handleProductChange(index, "gender", e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">선택</option>
                                <option value="male">남</option>
                                <option value="female">여</option>
                                <option value="unisex">공용</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                시즌 <span className="text-red-500">*</span>
                              </label>
                              <select
                                value={product.season}
                                onChange={(e) => handleProductChange(index, "season", e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">선택</option>
                                <option value="winter">동복</option>
                                <option value="summer">하복</option>
                                <option value="all">사계절</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                가격
                              </label>
                              <input
                                type="number"
                                value={product.price}
                                onChange={(e) => handleProductChange(index, "price", parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                수량
                              </label>
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                설명
                              </label>
                              <input
                                type="text"
                                value={product.description || ""}
                                onChange={(e) => handleProductChange(index, "description", e.target.value)}
                                placeholder="제품 설명"
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              />
                            </div>

                            <div className="col-span-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={product.is_selectable}
                                  onChange={(e) => handleProductChange(index, "is_selectable", e.target.checked)}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs font-medium text-gray-700">선택 가능 제품</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 제품 폼 푸터 */}
                <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleSkipProducts}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    disabled={isSubmitting}
                  >
                    건너뛰기
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProducts}
                    disabled={isSubmitting || products.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "저장 중..." : "제품 저장"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
