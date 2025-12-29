import type { StudentMeasurementData, StartMeasurementResponse, RegisterStudent } from "@/api/studentApi";

export interface UniformProductItem {
  id: string;
  name: string;
  recommendedSize: string;
  availableSizes: number[];
  price: number;
  provided: number;
  quantity: number;
  selectableWith?: string[];
  gender: "male" | "female" | "unisex";
  isCustomizationRequired?: boolean;
  customization?: string;
}

export interface MeasurementSheetCommonProps {
  setIsMeasurementSheetOpen: (open: boolean) => void;
  studentId: number;
  measurementData?: StartMeasurementResponse;
  selectedStudent?: RegisterStudent;
  onSuccess?: () => void;
  schoolDeadline?: string;
}

export interface NewMeasurementSheetProps extends MeasurementSheetCommonProps {
  mode?: "new";
}

export interface EditOrderSheetProps extends MeasurementSheetCommonProps {
  mode: "edit";
  orderId: number;
}

export interface ReadonlySheetProps extends MeasurementSheetCommonProps {
  mode: "readonly";
}

export type MeasurementSheetProps = NewMeasurementSheetProps | EditOrderSheetProps | ReadonlySheetProps;
