interface NameTagSectionProps {
  isEditMode?: boolean;
  hasNameTag: boolean;
  nameTagPrice: number | "";
  nameTagAttachPrice: number | "";
  nameTagMinUnit: number | "";
  onHasNameTagChange: (v: boolean) => void;
  onNameTagPriceChange: (v: number | "") => void;
  onNameTagAttachPriceChange: (v: number | "") => void;
  onNameTagMinUnitChange: (v: number | "") => void;
}

export const NameTagSection = ({
  isEditMode = true,
  hasNameTag,
  nameTagPrice,
  nameTagAttachPrice,
  nameTagMinUnit,
  onHasNameTagChange,
  onNameTagPriceChange,
  onNameTagAttachPriceChange,
  onNameTagMinUnitChange,
}: NameTagSectionProps) => {
  if (!isEditMode && !hasNameTag) return null;

  const numInput = "min-w-0 border-none bg-transparent text-14 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div className="flex flex-col gap-2">
      <span className="text-base font-medium text-bg-800">명찰</span>
      <div className="flex gap-4 items-center flex-wrap">
        <label className="flex items-center gap-1.5 text-15 text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={hasNameTag}
            onChange={(e) => onHasNameTagChange(e.target.checked)}
            readOnly={!isEditMode}
            className="w-4 h-4 accent-primary-900"
          />
          명찰
        </label>

        {hasNameTag && (
          <div className="flex gap-2 items-center flex-wrap">
            {/* 제작 단가 + 개 단위 */}
            <div className="flex flex-col gap-0.5">
              <span className="px-1 text-13 text-gray-500">제작 단가</span>
              <div className="flex items-center h-10 border border-gray-200 rounded-lg bg-white overflow-hidden">
                <div className="flex items-center px-3 gap-1 flex-1">
                  {isEditMode ? (
                    <input
                      type="number"
                      className={`${numInput} w-20`}
                      placeholder="-"
                      value={nameTagPrice}
                      onChange={(e) => onNameTagPriceChange(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  ) : (
                    <span className="text-14 text-gray-700">
                      {nameTagPrice !== "" ? `${Number(nameTagPrice).toLocaleString()}` : "-"}
                    </span>
                  )}
                  <span className="text-14 text-gray-500 shrink-0">원</span>
                </div>
                <div className="w-px h-5 bg-gray-200 shrink-0" />
                <div className="flex items-center px-3 gap-1">
                  {isEditMode ? (
                    <input
                      type="number"
                      className={`${numInput} w-10`}
                      placeholder="-"
                      value={nameTagMinUnit}
                      onChange={(e) => onNameTagMinUnitChange(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  ) : (
                    <span className="text-14 text-gray-700">
                      {nameTagMinUnit !== "" ? nameTagMinUnit : "-"}
                    </span>
                  )}
                  <span className="text-14 text-gray-500 shrink-0">개 단위</span>
                </div>
              </div>
            </div>

            {/* 부착 단가 */}
            <div className="flex flex-col gap-0.5">
              <span className="px-1 text-13 text-gray-500">부착 단가</span>
              <div className="flex items-center h-10 px-3 border border-gray-200 rounded-lg bg-white gap-1">
                {isEditMode ? (
                  <input
                    type="number"
                    className={`${numInput} w-20`}
                    placeholder="-"
                    value={nameTagAttachPrice}
                    onChange={(e) => onNameTagAttachPriceChange(e.target.value === "" ? "" : Number(e.target.value))}
                  />
                ) : (
                  <span className="text-14 text-gray-700">
                    {nameTagAttachPrice !== "" ? `${Number(nameTagAttachPrice).toLocaleString()}` : "-"}
                  </span>
                )}
                <span className="text-14 text-gray-500 shrink-0">원</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
