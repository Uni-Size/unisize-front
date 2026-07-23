import { useState, useCallback } from "react";
import type { SchoolFormState } from "./SchoolFormContent";

export function makeEmptyFormState(): SchoolFormState {
  const currentYr = new Date().getFullYear();
  return {
    schoolName: "",
    schoolId: null,
    hasNameTag: false,
    nameTagPrice: "",
    nameTagAttachPrice: "",
    nameTagMinUnit: "",
    years: [
      {
        _id: `sy-init`,
        year: currentYr,
        measurement_start_date: "",
        measurement_end_date: "",
        expected_student_count: undefined,
      },
    ],
    winterProducts: [],
    summerProducts: [],
    productsCache: {},
    allWinterProducts: [],
    allSummerProducts: [],
  };
}

export function useSchoolFormState(initial?: Partial<SchoolFormState>) {
  const [state, setState] = useState<SchoolFormState>({ ...makeEmptyFormState(), ...initial });
  const onChange = useCallback((patch: Partial<SchoolFormState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);
  const reset = useCallback(() => setState(makeEmptyFormState()), []);
  return { state, onChange, reset };
}
