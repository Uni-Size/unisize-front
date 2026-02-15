import { useState, useEffect, useCallback } from 'react';
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
}: SchoolSelectModalProps) => {
  const [year, setYear] = useState(String(currentYear));
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [price, setPrice] = useState('');
  const [schoolList, setSchoolList] = useState<ApiSchool[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchools = useCallback(async (y: string) => {
    setLoading(true);
    try {
      const schools = await getSupportedSchoolsByYear(Number(y));
      setSchoolList(schools);
    } catch (error) {
      console.error('학교 목록 조회 실패:', error);
      setSchoolList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchSchools(year);
    }
  }, [isOpen, year, fetchSchools]);

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
    setSchoolList([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      width={580}
      actions={
        <>
          <button
            className="px-6 py-2.5 bg-[#6c757d] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleClose}
          >
            취소
          </button>
          <button
            className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90"
            onClick={handleSubmit}
            disabled={!selectedSchoolId}
          >
            추가
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-135">
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
            <div className="flex flex-col gap-1">
              <span className="px-2 text-base text-bg-800">계약금액</span>
              <div className="flex items-center h-12.5 px-4 border border-[#c6c6c6] rounded-lg bg-white">
                <input
                  type="number"
                  placeholder=""
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 border-none bg-transparent text-[15px] text-[#4c4c4c] text-right outline-none placeholder:text-bg-400"
                />
                <span className="text-[15px] text-[#4c4c4c] ml-1">원</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
