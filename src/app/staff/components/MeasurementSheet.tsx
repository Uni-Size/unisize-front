"use client";

import type { MeasurementSheetProps } from "./MeasurementSheetTypes";
import NewMeasurementSheet from "./NewMeasurementSheet";
import EditOrderSheet from "./EditOrderSheet";

export default function MeasurementSheet(props: MeasurementSheetProps) {
  // mode에 따라 적절한 컴포넌트 렌더링
  if (props.mode === "edit" && "orderId" in props) {
    return <EditOrderSheet {...props} />;
  }

  // 기본값: 신규 측정 모드
  return <NewMeasurementSheet {...props} mode="new" />;
}
