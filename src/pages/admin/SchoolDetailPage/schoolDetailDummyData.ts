import type { SchoolDetailData } from '@components/organisms/SchoolDetailModal';

// TODO: 학교 디테일 조회 API 연동 시 이 더미 데이터를 교체
export const DUMMY_SCHOOL_DETAIL: SchoolDetailData = {
  id: '1',
  schoolName: '용성중학교',
  registeredDate: '2026.01.09 15:23',
  lastModifiedDate: '2026.01.10 15:23',
  purchases: [
    {
      id: 'purchase-2026',
      purchaseStatus: 'in-progress',
      purchaseYear: '2026',
      expectedStudents: 183,
      measurementStartDate: '2026.01.09',
      measurementEndDate: '2026.01.15',
    },
    {
      id: 'purchase-2024',
      purchaseStatus: 'completed',
      purchaseYear: '2024',
      expectedStudents: 183,
      measurementStartDate: '2024.01.09',
      measurementEndDate: '2024.01.15',
    },
  ],
  winterProducts: [
    {
      id: 'winter-1',
      category: '후드',
      gender: 'U',
      displayName: '용성중 후드집업',
      contractPrice: 78000,
      freeQuantity: 1,
    },
    {
      id: 'winter-2',
      category: '상의',
      gender: 'U',
      displayName: '용성중 셔츠',
      contractPrice: 46000,
      freeQuantity: 1,
    },
    {
      id: 'winter-3',
      category: '하의',
      gender: 'U',
      displayName: '용성중 온고무줄 바지',
      contractPrice: 76000,
      freeQuantity: 1,
    },
  ],
  summerProducts: [
    {
      id: 'summer-1',
      category: '상의',
      gender: 'U',
      displayName: '용성중 카라반팔티',
      contractPrice: 54000,
      freeQuantity: 1,
    },
    {
      id: 'summer-2',
      category: '하의',
      gender: 'U',
      displayName: '용성중 반바지',
      contractPrice: 44000,
      freeQuantity: 1,
    },
  ],
};
