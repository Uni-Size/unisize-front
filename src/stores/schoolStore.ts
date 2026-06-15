import { create } from 'zustand';
import { getSchoolList } from '@/api/school';
import type { SchoolListItem } from '@/api/school';

interface SchoolStore {
  schools: SchoolListItem[];
  fetchedYear: number | null;
  loading: boolean;
  fetchSchools: (year: number) => Promise<void>;
}

export const useSchoolStore = create<SchoolStore>((set, get) => ({
  schools: [],
  fetchedYear: null,
  loading: false,

  fetchSchools: async (year: number) => {
    if (get().fetchedYear === year || get().loading) return;
    set({ loading: true });
    try {
      const { schools } = await getSchoolList({ year });
      set({ schools, fetchedYear: year });
    } catch (err) {
      console.error('학교 목록 조회 실패:', err);
    } finally {
      set({ loading: false });
    }
  },
}));
