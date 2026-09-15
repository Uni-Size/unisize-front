import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal, Select } from '@components/atoms';
import { getSupportedSchoolsByYear, type School as ApiSchool } from '@/api/school';

export interface School {
  id: string;
  name: string;
}

export interface SchoolSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schoolId: string, schoolName: string, price: number, year: string) => void;
  schools?: School[];
  title?: string;
  zIndex?: number;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear + i),
  label: String(currentYear + i),
}));

export const SchoolSelectModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = '학교 추가',
  zIndex,
}: SchoolSelectModalProps) => {
  const [year, setYear] = useState(String(currentYear));
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [price, setPrice] = useState('');
  // 모달이 열려 있을 때만 조회한다 (기존 effect의 if (isOpen) 가드와 동일).
  // 연도를 바꾸면 queryKey가 달라져 자동으로 다시 가져온다.
  const { data, isFetching } = useQuery({
    queryKey: ['schools', 'supported', 'by-year', year] as const,
    enabled: isOpen,
    queryFn: () =>
      getSupportedSchoolsByYear(Number(year)).catch((error) => {
        console.error('학교 목록 조회 실패:', error);
        throw error;
      }),
  });

  // 기존 동작: 조회에 실패하면 에러를 표시하지 않고 빈 목록으로 둔다.
  // 쿼리가 실패하면 data가 undefined이므로 그대로 빈 배열이 된다.
  const schoolList: ApiSchool[] = data ?? [];
  const loading = isFetching;

  const schoolOptions = schoolList.map((school) => ({
    value: String(school.id),
    label: school.name,
  }));

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    setSelectedSchoolId('');
  };

  const handleSubmit = () => {
    const selectedSchool = schoolList.find((s) => String(s.id) === selectedSchoolId);
    if (selectedSchool) {
      onSubmit(String(selectedSchool.id), selectedSchool.name, Number(price), year);
      handleClose();
    }
  };

  const handleClose = () => {
    setYear(String(currentYear));
    setSelectedSchoolId('');
    setPrice('');
    // 목록은 쿼리 캐시가 들고 있고 모달이 닫히면 enabled: false가 되므로
    // 여기서 비울 필요가 없다(다시 열면 캐시를 즉시 보여주고 뒤에서 갱신한다).
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      width={580}
      zIndex={zIndex}
      actions={
        <>
          <button
            className="px-6 py-2.5 bg-neutral-500 text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-bg-050 text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleSubmit}
            disabled={!selectedSchoolId}
          >
            추가
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-2 items-start">
          <div className="flex-none w-25 min-w-0">
            <Select
              label="년도"
              placeholder="년도"
              options={yearOptions}
              value={year}
              onChange={handleYearChange}
              fullWidth
            />
          </div>
          <div className="flex-2 min-w-0">
            <Select
              label="학교"
              placeholder={loading ? '로딩 중...' : '학교명'}
              options={schoolOptions}
              value={selectedSchoolId}
              onChange={setSelectedSchoolId}
              fullWidth
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-2">
              <span className="text-15 font-normal text-gray-700">계약금액</span>
              <div className="flex items-center h-12.5 px-4 border border-gray-200 rounded-lg bg-white gap-1">
                <input
                  type="number"
                  placeholder=""
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="min-w-0 flex-1 border-none bg-transparent text-15 text-gray-700 text-right outline-none placeholder:text-bg-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-15 text-gray-700 shrink-0">원</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
