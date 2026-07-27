import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTargetYear } from '@/utils/schoolUtils';

interface BodyMeasurements {
  height: number;
  weight: number;
  shoulder: number;
  waist: number;
}

interface FormData {
  studentType: 'new' | 'transfer' | 'existing' | '';
  previousSchool: string;
  admissionYear: number;
  admissionGrade: number;
  admissionSchool: string;
  name: string;
  studentPhone: string;
  guardianPhone: string;
  birthDate: string;
  gender: 'F' | 'M' | '';
  privacyConsent: boolean;
  body: BodyMeasurements;
  address: string;
  delivery: boolean;
}

interface FormStore {
  formData: FormData;
  setFormData: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  setBodyMeasurements: <K extends keyof BodyMeasurements>(
    field: K,
    value: BodyMeasurements[K]
  ) => void;
  resetFormData: () => void;
}

const initialFormData: FormData = {
  studentType: '',
  previousSchool: '',
  admissionYear: getTargetYear(),
  admissionGrade: 1,
  admissionSchool: '',
  name: '',
  studentPhone: '',
  guardianPhone: '',
  birthDate: '',
  gender: '',
  privacyConsent: false,
  body: {
    height: 0,
    weight: 0,
    shoulder: 0,
    waist: 0,
  },
  address: '',
  delivery: false,
};

export const useStudentFormStore = create<FormStore>()(
  persist(
    (set) => ({
      formData: initialFormData,

      setFormData: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),

      setBodyMeasurements: (field, value) =>
        set((state) => ({
          formData: {
            ...state.formData,
            body: { ...state.formData.body, [field]: value },
          },
        })),

      resetFormData: () => set({ formData: initialFormData }),
    }),
    {
      name: 'student-form-storage',
      // v1: gender 초기값이 'F'로 하드코딩되어 있던 버그(성별 미선택이 '여자'로 통과됨) 수정.
      // 이전 버전에서 저장된 gender: 'F'는 사용자가 실제로 선택한 값인지 버그로 인한
      // 기본값인지 구분할 수 없으므로, 안전하게 미선택 상태로 되돌려 재선택을 강제한다.
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as { formData?: FormData };
        if (version < 1 && state?.formData?.gender === 'F') {
          return {
            ...state,
            formData: { ...state.formData, gender: '' },
          };
        }
        return state as FormStore;
      },
    }
  )
);
