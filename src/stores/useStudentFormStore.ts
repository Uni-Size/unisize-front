import { create } from 'zustand';
import { getTargetYear } from '@/utils/schoolUtils';

interface BodyMeasurements {
  height: number;
  weight: number;
  shoulder: number;
  waist: number;
}

interface FormData {
  previousSchool: string;
  admissionYear: number;
  admissionGrade: number;
  admissionSchool: string;
  name: string;
  studentPhone: string;
  guardianPhone: string;
  birthDate: string;
  gender: 'F' | 'M';
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
  previousSchool: '',
  admissionYear: getTargetYear(),
  admissionGrade: 1,
  admissionSchool: '',
  name: '',
  studentPhone: '',
  guardianPhone: '',
  birthDate: '',
  gender: 'F',
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

export const useStudentFormStore = create<FormStore>((set) => ({
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
}));
