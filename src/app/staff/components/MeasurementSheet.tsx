"use client";

import type { MeasurementSheetProps } from "./MeasurementSheetTypes";
import NewMeasurementSheet from "./NewMeasurementSheet";
import EditOrderSheet from "./EditOrderSheet";

export default function MeasurementSheet(props: MeasurementSheetProps) {
  // mode에 따라 적절한 컴포넌트 렌더링
  if (props.mode === "edit" && "orderId" in props) {
    return <EditOrderSheet {...props} />;
  }

  if (props.mode === "readonly") {
    // readonly 모드는 아직 구현하지 않음 (필요시 추가)
    return (
      <>
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => props.setIsMeasurementSheetOpen(false)}
        />
        <div className="fixed bottom-0 left-0 bg-white w-full rounded-t-md h-5/6 overflow-y-auto flex items-center justify-center z-50">
          <p className="text-gray-600">읽기 전용 모드는 아직 구현되지 않았습니다.</p>
        </div>
      </>
    );
  }

  // 기본값: 신규 측정 모드
  return <NewMeasurementSheet {...props} mode="new" />;
}
