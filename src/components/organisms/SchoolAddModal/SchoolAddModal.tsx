import { useState } from "react";
import { Modal, Select, Input } from "@components/atoms";
import "./SchoolAddModal.css";

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
  onSubmit: (data: SchoolAddData) => void;
  onOpenProductModal: (season: "winter" | "summer") => void;
  winterProducts: SchoolProductItem[];
  summerProducts: SchoolProductItem[];
  onRemoveProduct: (season: "winter" | "summer", productId: string) => void;
  onProductChange: (
    season: "winter" | "summer",
    productId: string,
    field: keyof SchoolProductItem,
    value: string | number,
  ) => void;
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
  { value: "top", label: "상의" },
  { value: "bottom", label: "하의" },
  { value: "hood", label: "후드" },
  { value: "outer", label: "아우터" },
];

const genderOptions = [
  { value: "male", label: "남" },
  { value: "female", label: "여" },
  { value: "unisex", label: "공용" },
];

export const SchoolAddModal = ({
  isOpen,
  onClose,
  onSubmit,
  onOpenProductModal,
  winterProducts,
  summerProducts,
  onRemoveProduct,
  onProductChange,
}: SchoolAddModalProps) => {
  const [schoolName, setSchoolName] = useState("");
  const [purchaseStatus, setPurchaseStatus] = useState("");
  const [purchaseYear, setPurchaseYear] = useState(String(currentYear));
  const [expectedStudents, setExpectedStudents] = useState("");
  const [measurementStartDate, setMeasurementStartDate] = useState("");
  const [measurementEndDate, setMeasurementEndDate] = useState("");

  const handleSubmit = () => {
    onSubmit({
      schoolName,
      purchaseStatus,
      purchaseYear,
      expectedStudents: Number(expectedStudents),
      measurementStartDate,
      measurementEndDate,
      winterProducts,
      summerProducts,
    });
    handleClose();
  };

  const handleClose = () => {
    setSchoolName("");
    setPurchaseStatus("");
    setPurchaseYear(String(currentYear));
    setExpectedStudents("");
    setMeasurementStartDate("");
    setMeasurementEndDate("");
    onClose();
  };

  const renderProductRow = (
    product: SchoolProductItem,
    season: "winter" | "summer",
  ) => (
    <div key={product.id} className="school-add-modal__product-row">
      <div className="school-add-modal__product-field school-add-modal__product-field--category">
        <Select
          placeholder="카테고리"
          options={categoryOptions}
          value={product.category}
          onChange={(value) =>
            onProductChange(season, product.id, "category", value)
          }
          fullWidth
        />
      </div>
      <div className="school-add-modal__product-field school-add-modal__product-field--gender">
        <Select
          placeholder="성별"
          options={genderOptions}
          value={product.gender}
          onChange={(value) =>
            onProductChange(season, product.id, "gender", value)
          }
          fullWidth
        />
      </div>
      <div className="school-add-modal__product-field school-add-modal__product-field--name">
        <Input
          placeholder="표시명"
          value={product.displayName}
          onChange={(e) =>
            onProductChange(season, product.id, "displayName", e.target.value)
          }
          fullWidth
        />
      </div>
      <div className="school-add-modal__product-field school-add-modal__product-field--price">
        <div className="school-add-modal__price-input-wrapper">
          <input
            type="number"
            className="school-add-modal__price-input-field"
            placeholder=""
            value={product.contractPrice || ""}
            onChange={(e) =>
              onProductChange(
                season,
                product.id,
                "contractPrice",
                Number(e.target.value),
              )
            }
          />
          <span className="school-add-modal__price-unit">원</span>
        </div>
      </div>
      <div className="school-add-modal__product-field school-add-modal__product-field--quantity">
        <Input
          placeholder=""
          type="number"
          value={String(product.freeQuantity || "")}
          onChange={(e) =>
            onProductChange(
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="학교추가"
      width={850}
      actions={
        <>
          <button
            className="modal__btn modal__btn--cancel"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="modal__btn modal__btn--primary"
            onClick={handleSubmit}
          >
            추가
          </button>
        </>
      }
    >
      <div className="school-add-modal__form">
        <div className="school-add-modal__row">
          <div className="school-add-modal__field">
            <Input
              label="학교명"
              placeholder="학교명"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="school-add-modal__row">
          <div className="school-add-modal__field school-add-modal__field--small">
            <Select
              label="주관구매"
              placeholder="주관구매 진행"
              options={purchaseStatusOptions}
              value={purchaseStatus}
              onChange={setPurchaseStatus}
              fullWidth
            />
          </div>
          <div className="school-add-modal__field school-add-modal__field--small">
            <Select
              label="진행년도"
              placeholder="년도"
              options={yearOptions}
              value={purchaseYear}
              onChange={setPurchaseYear}
              fullWidth
            />
          </div>
          <div className="school-add-modal__field school-add-modal__field--small">
            <Input
              label="예상인원"
              placeholder="100"
              type="number"
              value={expectedStudents}
              onChange={(e) => setExpectedStudents(e.target.value)}
              fullWidth
            />
          </div>
          <div className="school-add-modal__field">
            <Input
              label="측정기간"
              placeholder="2025.01.01"
              value={measurementStartDate}
              onChange={(e) => setMeasurementStartDate(e.target.value)}
              fullWidth
            />
          </div>
          <span className="school-add-modal__date-separator">~</span>
          <div className="school-add-modal__field school-add-modal__field--medium">
            <Input
              label=" "
              placeholder="2025.01.10"
              value={measurementEndDate}
              onChange={(e) => setMeasurementEndDate(e.target.value)}
              fullWidth
            />
          </div>
        </div>

        <div className="school-add-modal__section">
          <div className="school-add-modal__section-header">
            <span className="school-add-modal__section-title">교복</span>
            <button
              className="modal__btn modal__btn--primary modal__btn--small"
              onClick={() => onOpenProductModal("winter")}
            >
              신규 품목 추가
            </button>
          </div>

          <div className="school-add-modal__season-group">
            <span className="school-add-modal__season-title">동복</span>
            {winterProducts.length > 0 && (
              <div className="school-add-modal__product-row">
                <div className="school-add-modal__product-field school-add-modal__product-field--category">
                  <span className="school-add-modal__price-input-label">
                    카테고리
                  </span>
                </div>
                <div className="school-add-modal__product-field school-add-modal__product-field--gender">
                  <span className="school-add-modal__price-input-label">
                    성별
                  </span>
                </div>
                <div className="school-add-modal__product-field school-add-modal__product-field--name">
                  <span className="school-add-modal__price-input-label">
                    표시명
                  </span>
                </div>
                <div className="school-add-modal__product-field school-add-modal__product-field--price">
                  <span className="school-add-modal__price-input-label">
                    계약가격
                  </span>
                </div>
                <div className="school-add-modal__product-field school-add-modal__product-field--quantity">
                  <span className="school-add-modal__price-input-label">
                    무상개수
                  </span>
                </div>
              </div>
            )}
            <div className="school-add-modal__product-list">
              {winterProducts.map((product) =>
                renderProductRow(product, "winter"),
              )}
            </div>
            <button
              className="school-add-modal__add-product-btn"
              onClick={() => onOpenProductModal("winter")}
            >
              동복 품목 추가
            </button>
          </div>

          <div className="school-add-modal__season-group">
            <span className="school-add-modal__season-title">하복</span>
            {summerProducts.length === 0 ? (
              <p className="school-add-modal__empty-message">
                하복이 구성되지 않았습니다
              </p>
            ) : (
              <>
                <div className="school-add-modal__product-row">
                  <div className="school-add-modal__product-field school-add-modal__product-field--category">
                    <span className="school-add-modal__price-input-label">
                      카테고리
                    </span>
                  </div>
                  <div className="school-add-modal__product-field school-add-modal__product-field--gender">
                    <span className="school-add-modal__price-input-label">
                      성별
                    </span>
                  </div>
                  <div className="school-add-modal__product-field school-add-modal__product-field--name">
                    <span className="school-add-modal__price-input-label">
                      표시명
                    </span>
                  </div>
                  <div className="school-add-modal__product-field school-add-modal__product-field--price">
                    <span className="school-add-modal__price-input-label">
                      계약가격
                    </span>
                  </div>
                  <div className="school-add-modal__product-field school-add-modal__product-field--quantity">
                    <span className="school-add-modal__price-input-label">
                      무상개수
                    </span>
                  </div>
                </div>
                <div className="school-add-modal__product-list">
                  {summerProducts.map((product) =>
                    renderProductRow(product, "summer"),
                  )}
                </div>
              </>
            )}
            <button
              className="school-add-modal__add-product-btn"
              onClick={() => onOpenProductModal("summer")}
            >
              하복 품목 추가
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
