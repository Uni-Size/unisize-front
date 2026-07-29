import { useState, useEffect } from "react";
import { Modal } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import { updateProductSelectable } from "@/api/product";
import type { SchoolListItem, SupportedYear, UpdateUniformItem } from "@/api/school";
import { getSchoolDetailById } from "@/api/school";
import { getApiErrorString } from "@/utils/errorUtils";
import {
  SchoolFormContent,
  type EditableProduct,
  type EditableYear,
} from "../SchoolAddModal/SchoolFormContent";
import { useSchoolFormState } from "../SchoolAddModal/useSchoolFormState";

export interface SchoolDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolListItem | null;
  onUpdate: () => void;
  onSubmit: (
    schoolId: string,
    data: {
      school_name: string;
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
  onAddNewProduct?: (
    onCreated: (item: import("../SchoolAddModal/SchoolFormContent").SchoolProductItem) => void,
    addToCache: (cacheKey: string, product: { id: string; name: string; price: number }) => void,
  ) => void;
}

const toUpdateUniform = (p: EditableProduct): UpdateUniformItem => ({
  product_id: p.productApiId ?? "",
  display_name: p.displayName,
  contract_price: p.contractPrice,
  free_support_count: p.freeQuantity ?? 0,
  is_selectable: p.is_selectable ?? false,
  selectable_with: (p.selectable_with ?? []).map((s) => s.product_id),
});

export const SchoolDetailModal = ({
  isOpen,
  onClose,
  school,
  onUpdate,
  onSubmit,
  onAddNewProduct,
}: SchoolDetailModalProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectableSaving, setSelectableSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const { state, onChange } = useSchoolFormState();

  useEffect(() => {
    if (!school) return;
    onChange({
      schoolName: school.school_name,
      schoolId: school.school_id,
      years: school.supported_years.map((sy: SupportedYear) => ({
        _id: `sy-${sy.year}`,
        year: sy.year,
        measurement_start_date: sy.measurement_start_date,
        measurement_end_date: sy.measurement_end_date,
      })),
      winterProducts: [],
      summerProducts: [],
      productsCache: {},
    });

    getSchoolDetailById(school.school_id)
      .then((detail) => {
        const toEditable = (u: (typeof detail.uniforms.winter)[number]): EditableProduct => ({
          id: `uniform-${u.id}`,
          category: u.category,
          gender: u.gender,
          displayName: u.display_name,
          contractPrice: u.contract_price,
          freeQuantity: u.free_support_count,
          productApiId: u.product_id,
          uniformApiId: u.id,
          is_selectable: u.is_selectable,
          selectable_with: u.selectable_with.map((s) => ({
            product_id: s.product_id,
            display_name: s.display_name,
          })),
        });


        // 기존 품목 데이터로 제품 검색 캐시 구성 (API 재조회 없이 드롭다운 표시)
        const buildCache = (uniforms: (typeof detail.uniforms.winter), seasonCode: string) => {
          const cache: Record<string, { id: string; name: string; price: number }[]> = {};
          for (const u of uniforms) {
            const key = `${seasonCode}:${u.category}:${u.gender}`;
            if (!cache[key]) cache[key] = [];
            if (!cache[key].some((p) => p.id === u.product_id)) {
              cache[key].push({ id: u.product_id, name: u.display_name, price: u.contract_price });
            }
          }
          return cache;
        };
        const productsCache = {
          ...buildCache(detail.uniforms.winter, "W"),
          ...buildCache(detail.uniforms.summer, "S"),
        };

        onChange({
          hasNameTag: detail.has_name_tag ?? false,
          nameTagPrice: detail.name_tag_price ?? "",
          nameTagAttachPrice: detail.name_tag_attach_price ?? "",
          nameTagMinUnit: detail.name_tag_min_unit ?? "",
          years: detail.years.map(
            (y): EditableYear => ({
              _id: `sy-${y.id}`,
              year: y.year,
              measurement_start_date: y.measurement_start_date ?? null,
              measurement_end_date: y.measurement_end_date ?? null,
              expected_student_count: y.expected_student_count,
            }),
          ),
          winterProducts: detail.uniforms.winter.map(toEditable),
          summerProducts: detail.uniforms.summer.map(toEditable),
          productsCache,
        });
      })
      .catch((err) => console.error("학교 상세 조회 실패:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school]);

  const handleClose = () => {
    setIsEditMode(false);
    onClose();
  };

  const handleEnterEditMode = () => {
    setIsEditMode(true);
    // allWinterProducts/allSummerProducts: 교체 가능 후보 목록 — 현재 편집 중인 품목에서 파생
    onChange({
      allWinterProducts: state.winterProducts
        .filter((p) => p.productApiId)
        .map((p) => ({ id: p.productApiId!, name: p.displayName, price: p.contractPrice, category: p.category, gender: p.gender, season: "W", is_repair: false, is_repair_required: false, created_at: "", updated_at: "" })),
      allSummerProducts: state.summerProducts
        .filter((p) => p.productApiId)
        .map((p) => ({ id: p.productApiId!, name: p.displayName, price: p.contractPrice, category: p.category, gender: p.gender, season: "S", is_repair: false, is_repair_required: false, created_at: "", updated_at: "" })),
    });
  };

const handleSelectableSave = async (product: EditableProduct) => {
    if (!product.productApiId || !school) return;
    setSelectableSaving(true);
    try {
      const myProductId = product.productApiId;
      const siblingIds = (product.selectable_with ?? []).map((s) => s.product_id);

      await updateProductSelectable(myProductId, school.school_name, {
        is_selectable: product.is_selectable ?? false,
        selectable_with: siblingIds,
      });
      await Promise.all(
        siblingIds.map((sibId) =>
          updateProductSelectable(sibId, school.school_name, {
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

  const handleSave = async () => {
    if (!school) return;
    const { schoolName, hasNameTag, nameTagPrice, nameTagAttachPrice, nameTagMinUnit, years, winterProducts, summerProducts } = state;

    const winter = winterProducts.filter((p) => p.productApiId).map(toUpdateUniform);
    const summer = summerProducts.filter((p) => p.productApiId).map(toUpdateUniform);

    try {
      await onSubmit(school.school_id, {
        school_name: schoolName,
        has_name_tag: hasNameTag,
        name_tag_price: hasNameTag && nameTagPrice !== "" ? nameTagPrice : null,
        name_tag_attach_price: hasNameTag && nameTagAttachPrice !== "" ? nameTagAttachPrice : null,
        name_tag_min_unit: hasNameTag && nameTagMinUnit !== "" ? nameTagMinUnit : null,
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
      setToast({ message: "저장되었습니다.", variant: "success" });
    } catch (err) {
      setToast({ message: getApiErrorString(err, "저장 중 오류가 발생했습니다."), variant: "error" });
    }
  };

  if (!school) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={school.school_name}
        width={950}
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
        <SchoolFormContent
          mode={isEditMode ? "edit" : "view"}
          state={state}
          onChange={onChange}
          onAddNewProduct={onAddNewProduct}
          onSelectableSave={handleSelectableSave}
          selectableSaving={selectableSaving}
          schoolNameForDisplay={school.school_name}
          createdAt={school.created_at}
          updatedAt={school.updated_at}
        />
      </Modal>
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
      )}
    </>
  );
};
