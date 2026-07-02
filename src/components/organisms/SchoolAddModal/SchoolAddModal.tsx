import { Modal } from "@components/atoms";
import { Toast } from "@components/atoms/Toast";
import { useState } from "react";
import { addSupportedSchool, type UniformItem } from "@/api/school";
import { getApiErrorString } from "@/utils/errorUtils";
import {
  SchoolFormContent,
  useSchoolFormState,
  type SchoolProductItem,
  type EditableProduct,
} from "./SchoolFormContent";

export type { SchoolProductItem, EditableProduct };

export interface SchoolAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onAddNewProduct?: (
    onCreated: (item: SchoolProductItem) => void,
    addToCache: (cacheKey: string, product: { id: string; name: string; price: number }) => void,
  ) => void;
}

const toUniformItem = (
  p: EditableProduct,
  hasNameTag: boolean,
  nameTagPrice: number | "",
  nameTagAttachPrice: number | "",
  nameTagMinUnit: number | "",
): UniformItem => ({
  product_id: p.productApiId ?? "",
  contract_price: p.contractPrice,
  quantity: p.freeQuantity,
  has_name_tag: hasNameTag,
  name_tag_price: hasNameTag && nameTagPrice !== "" ? nameTagPrice : undefined,
  name_tag_attach_price: hasNameTag && nameTagAttachPrice !== "" ? nameTagAttachPrice : undefined,
  name_tag_min_unit: hasNameTag && nameTagMinUnit !== "" ? nameTagMinUnit : undefined,
});

export const SchoolAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  onAddNewProduct,
}: SchoolAddModalProps) => {
  const { state, onChange, reset } = useSchoolFormState();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    try {
      const { schoolName, years, winterProducts, summerProducts, hasNameTag, nameTagPrice, nameTagAttachPrice, nameTagMinUnit } = state;
      const y = years[0];
      const winter = winterProducts
        .filter((p) => p.productApiId)
        .map((p) => toUniformItem(p, hasNameTag, nameTagPrice, nameTagAttachPrice, nameTagMinUnit));
      const summer = summerProducts
        .filter((p) => p.productApiId)
        .map((p) => toUniformItem(p, hasNameTag, nameTagPrice, nameTagAttachPrice, nameTagMinUnit));

      await addSupportedSchool({
        school_name: schoolName,
        year: y ? Number(y.year) : new Date().getFullYear(),
        expected_student_count: y?.expected_student_count || undefined,
        measurement_start_date: y?.measurement_start_date || undefined,
        measurement_end_date: y?.measurement_end_date || undefined,
        uniforms:
          winter.length > 0 || summer.length > 0
            ? { winter: winter.length > 0 ? winter : undefined, summer: summer.length > 0 ? summer : undefined }
            : undefined,
      });

      onSubmit();
      handleClose();
    } catch (error) {
      setToast({ message: getApiErrorString(error, "학교 추가 중 오류가 발생했습니다."), variant: "error" });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="학교추가"
        width={950}
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
        <SchoolFormContent
          mode="add"
          state={state}
          onChange={onChange}
          onAddNewProduct={onAddNewProduct}
        />
      </Modal>
      {toast && (
        <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />
      )}
    </>
  );
};
