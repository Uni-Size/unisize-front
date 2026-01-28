import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AddStudentResponse } from '@/api/student';

interface StudentResponseStore {
  studentData: AddStudentResponse | null;
  setStudentData: (data: AddStudentResponse) => void;
  clearStudentData: () => void;
}

export const useStudentResponseStore = create<StudentResponseStore>()(
  persist(
    (set) => ({
      studentData: null,

      setStudentData: (data) => set({ studentData: data }),

      clearStudentData: () => set({ studentData: null }),
    }),
    {
      name: 'student-response-storage',
    }
  )
);
