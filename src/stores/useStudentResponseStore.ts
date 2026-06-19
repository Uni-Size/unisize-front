import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AddStudentResponse, CheckinResponse } from '@/api/student';

interface StudentResponseStore {
  studentData: AddStudentResponse | null;
  checkinData: CheckinResponse | null;
  setStudentData: (data: AddStudentResponse) => void;
  setCheckinData: (data: CheckinResponse) => void;
  clearStudentData: () => void;
}

export const useStudentResponseStore = create<StudentResponseStore>()(
  persist(
    (set) => ({
      studentData: null,
      checkinData: null,

      setStudentData: (data) => set({ studentData: data }),
      setCheckinData: (data) => set({ checkinData: data }),

      clearStudentData: () => set({ studentData: null, checkinData: null }),
    }),
    {
      name: 'student-response-storage',
    }
  )
);
