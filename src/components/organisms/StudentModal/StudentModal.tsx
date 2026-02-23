import { useState, useEffect } from 'react';
import { Modal, Input, Select } from '@components/atoms';

// ============================================================================
// 타입 정의
// ============================================================================

export interface UniformItem {
  id: string;
  name: string;
  size: string;
  supportedQuantity: number;
  additionalQuantity: number;
  repair: string;
  reservation: boolean;
  nameTag: number | null;
  isDeleted?: boolean;
}

export interface SupplyItem {
  id: string;
  category: string;
  name: string;
  size: string;
  quantity: number;
}

export interface NameTagInfo {
  orderQuantity: number;
  attachQuantity: number;
}

export interface StudentDetailData {
  id: string;
  admissionSchool: string;
  previousSchool: string;
  classNumber: string;
  name: string;
  gender: string;
  studentPhone: string;
  guardianPhone: string;
  registeredDate?: string;
  modifiedDate?: string;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  supplies: SupplyItem[];
  nameTag: NameTagInfo;
}

export interface StudentFormInput {
  admissionSchool: string;
  previousSchool: string;
  classNumber: string;
  name: string;
  gender: string;
  studentPhone: string;
  guardianPhone: string;
  winterUniforms: UniformItem[];
  summerUniforms: UniformItem[];
  supplies: SupplyItem[];
  nameTag: NameTagInfo;
}

export interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  student?: StudentDetailData | null;
  onSubmit: (data: StudentFormInput) => void;
}

// ============================================================================
// 옵션 데이터
// ============================================================================

const genderOptions = [
  { value: 'M', label: '남자(M)' },
  { value: 'F', label: '여자(F)' },
];

const sizeOptions = [
  { value: '77', label: '77' },
  { value: '80', label: '80' },
  { value: '85', label: '85' },
  { value: '90', label: '90' },
  { value: '95', label: '95' },
  { value: '100', label: '100' },
  { value: '105', label: '105' },
  { value: '110', label: '110' },
];

const supplySizeOptions = [
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: 'XXL', label: 'XXL' },
];

const defaultSupplies: SupplyItem[] = [
  { id: 'supply-1', category: '교복 먼티', name: '검정 교복 먼티', size: '', quantity: 0 },
  { id: 'supply-2', category: '교복 먼티', name: '흰색 교복 먼티', size: '', quantity: 0 },
  { id: 'supply-3', category: '스타킹', name: '살색', size: '', quantity: 0 },
  { id: 'supply-4', category: '스타킹', name: '유발', size: '', quantity: 0 },
  { id: 'supply-5', category: '스타킹', name: '무발', size: '', quantity: 0 },
  { id: 'supply-6', category: '스타킹', name: '기모', size: '', quantity: 0 },
  { id: 'supply-7', category: '', name: '속바지', size: '', quantity: 0 },
];

// ============================================================================
// 컴포넌트
// ============================================================================

export const StudentModal = ({
  isOpen,
  onClose,
  mode,
  student,
  onSubmit,
}: StudentModalProps) => {
  // 학생 정보 폼 state
  const [admissionSchool, setAdmissionSchool] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [classNumber, setClassNumber] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');

  // 교복 state
  const [winterUniforms, setWinterUniforms] = useState<UniformItem[]>([]);
  const [summerUniforms, setSummerUniforms] = useState<UniformItem[]>([]);

  // 용품 state
  const [supplies, setSupplies] = useState<SupplyItem[]>(defaultSupplies);

  // 명찰 state
  const [nameTag, setNameTag] = useState<NameTagInfo>({ orderQuantity: 0, attachQuantity: 0 });

  // edit 모드에서 기존 데이터로 초기화
  useEffect(() => {
    if (mode === 'edit' && student) {
      setAdmissionSchool(student.admissionSchool);
      setPreviousSchool(student.previousSchool);
      setClassNumber(student.classNumber);
      setName(student.name);
      setGender(student.gender);
      setStudentPhone(student.studentPhone);
      setGuardianPhone(student.guardianPhone);
      setWinterUniforms(student.winterUniforms);
      setSummerUniforms(student.summerUniforms);
      setSupplies(student.supplies.length > 0 ? student.supplies : defaultSupplies);
      setNameTag(student.nameTag);
    }
  }, [mode, student]);

  const resetForm = () => {
    setAdmissionSchool('');
    setPreviousSchool('');
    setClassNumber('');
    setName('');
    setGender('');
    setStudentPhone('');
    setGuardianPhone('');
    setWinterUniforms([]);
    setSummerUniforms([]);
    setSupplies(defaultSupplies.map((s) => ({ ...s, size: '', quantity: 0 })));
    setNameTag({ orderQuantity: 0, attachQuantity: 0 });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({
      admissionSchool,
      previousSchool,
      classNumber,
      name,
      gender,
      studentPhone,
      guardianPhone,
      winterUniforms,
      summerUniforms,
      supplies,
      nameTag,
    });
    handleClose();
  };

  // 교복 아이템 변경
  const handleUniformChange = (
    season: 'winter' | 'summer',
    itemId: string,
    field: keyof UniformItem,
    value: string | number | boolean,
  ) => {
    const setter = season === 'winter' ? setWinterUniforms : setSummerUniforms;
    setter((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  };

  // 교복 아이템 삭제 (삭제 표시)
  const handleUniformDelete = (season: 'winter' | 'summer', itemId: string) => {
    const setter = season === 'winter' ? setWinterUniforms : setSummerUniforms;
    setter((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isDeleted: !item.isDeleted } : item,
      ),
    );
  };

  // 용품 변경
  const handleSupplyChange = (
    itemId: string,
    field: keyof SupplyItem,
    value: string | number,
  ) => {
    setSupplies((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  };

  const hasSchool = admissionSchool.trim() !== '';

  // ============================================================================
  // 교복 테이블 렌더링
  // ============================================================================

  const renderUniformTable = (
    title: string,
    items: UniformItem[],
    season: 'winter' | 'summer',
  ) => (
    <div>
      <table className="w-full border-collapse border border-[#c6c6c6] text-sm">
        <thead>
          <tr>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[130px]">{title}</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[100px]">사이즈</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[70px]">지원수량</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[70px]">추가수량</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[80px]">수선</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[60px]">예약</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[60px]">명찰</th>
          </tr>
        </thead>
        <tbody>
          {!hasSchool && mode === 'add' ? (
            <tr>
              <td colSpan={7} className="text-center p-5 text-sm text-[#959595]">
                학교를 먼저 선택해주세요
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center p-5 text-sm text-[#959595]">
                학교를 먼저 선택해주세요
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={item.isDeleted ? 'bg-[#fee2e2] [&_td]:text-[#9b4d4d]' : ''}
              >
                <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle relative">
                  {item.isDeleted && (
                    <button
                      className="inline-flex items-center justify-center px-2.5 py-1 bg-[#ef4444] border-none rounded text-xs font-medium text-white cursor-pointer mr-2 hover:bg-[#dc2626]"
                      onClick={() => handleUniformDelete(season, item.id)}
                    >
                      삭제
                    </button>
                  )}
                  {!item.isDeleted && mode === 'edit' && (
                    <button
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-transparent border border-[#c6c6c6] rounded text-sm text-[#9b4d4d] cursor-pointer p-0 hover:bg-[#fee2e2] hover:border-[#9b4d4d]"
                      onClick={() => handleUniformDelete(season, item.id)}
                      title="삭제"
                    >
                      ×
                    </button>
                  )}
                  {item.name}
                </td>
                <td className="p-1 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                  <Select
                    options={sizeOptions}
                    value={item.size}
                    onChange={(value) => handleUniformChange(season, item.id, 'size', value)}
                    fullWidth
                  />
                </td>
                <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                  {item.supportedQuantity}
                </td>
                <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                  <input
                    type="number"
                    className="w-[50px] px-2 py-1 border border-[#c6c6c6] rounded text-sm text-center text-[#4c4c4c] bg-white outline-none focus:border-[#1f234f] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={item.additionalQuantity}
                    onChange={(e) =>
                      handleUniformChange(season, item.id, 'additionalQuantity', Number(e.target.value))
                    }
                    min={0}
                  />
                </td>
                <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                  {item.repair}
                </td>
                <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                  <input
                    type="checkbox"
                    className="w-[18px] h-[18px] accent-[#1f234f] cursor-pointer"
                    checked={item.reservation}
                    onChange={(e) =>
                      handleUniformChange(season, item.id, 'reservation', e.target.checked)
                    }
                  />
                </td>
                <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                  {item.nameTag !== null ? item.nameTag : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  // ============================================================================
  // 용품 테이블 렌더링
  // ============================================================================

  const renderSupplyTable = () => {
    // 카테고리별 그룹핑
    const grouped: { category: string; items: SupplyItem[] }[] = [];
    supplies.forEach((item) => {
      const existing = grouped.find((g) => g.category === item.category);
      if (existing) {
        existing.items.push(item);
      } else {
        grouped.push({ category: item.category, items: [item] });
      }
    });

    return (
      <div className="flex-1">
        <table className="w-full border-collapse border border-[#c6c6c6] text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap" colSpan={2}>용품</th>
              <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[100px]">사이즈</th>
              <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[70px]">수량</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) =>
              group.items.map((item, idx) => (
                <tr key={item.id}>
                  {idx === 0 && group.category && (
                    <td
                      className="p-2 border border-[#c6c6c6] text-center align-middle bg-[#f9fafb] font-medium text-[#4c4c4c]"
                      rowSpan={group.items.length}
                    >
                      {group.category}
                    </td>
                  )}
                  <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                    {item.name}
                  </td>
                  <td className="p-1 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                    {item.category === '스타킹' ? (
                      <span>-</span>
                    ) : (
                      <Select
                        options={supplySizeOptions}
                        value={item.size}
                        onChange={(value) => handleSupplyChange(item.id, 'size', value)}
                        placeholder="-"
                        fullWidth
                      />
                    )}
                  </td>
                  <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
                    <input
                      type="number"
                      className="w-[50px] px-2 py-1 border border-[#c6c6c6] rounded text-sm text-center text-[#4c4c4c] bg-white outline-none focus:border-[#1f234f] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={item.quantity}
                      onChange={(e) =>
                        handleSupplyChange(item.id, 'quantity', Number(e.target.value))
                      }
                      min={0}
                    />
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // ============================================================================
  // 명찰 테이블 렌더링
  // ============================================================================

  const renderNameTagTable = () => (
    <div className="flex-none">
      <table className="w-full border-collapse border border-[#c6c6c6] text-sm">
        <thead>
          <tr>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap">명찰</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[70px]">주문수량</th>
            <th className="px-2 py-2.5 font-medium text-[#393939] bg-[#f9fafb] border border-[#c6c6c6] text-center whitespace-nowrap w-[70px]">부착수량</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">명찰</td>
            <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
              <input
                type="number"
                className="w-[50px] px-2 py-1 border border-[#c6c6c6] rounded text-sm text-center text-[#4c4c4c] bg-white outline-none focus:border-[#1f234f] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={nameTag.orderQuantity}
                onChange={(e) =>
                  setNameTag((prev) => ({ ...prev, orderQuantity: Number(e.target.value) }))
                }
                min={0}
              />
            </td>
            <td className="p-2 border border-[#c6c6c6] text-center text-[#4c4c4c] align-middle">
              <input
                type="number"
                className="w-[50px] px-2 py-1 border border-[#c6c6c6] rounded text-sm text-center text-[#4c4c4c] bg-white outline-none focus:border-[#1f234f] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={nameTag.attachQuantity}
                onChange={(e) =>
                  setNameTag((prev) => ({ ...prev, attachQuantity: Number(e.target.value) }))
                }
                min={0}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  // ============================================================================
  // 렌더링
  // ============================================================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'add' ? '학생추가' : '학생수정'}
      width={850}
      actions={
        <>
          <button className="px-6 py-2.5 bg-[#6c757d] text-white text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90" onClick={handleClose}>
            취소
          </button>
          <button className="px-6 py-2.5 bg-primary-900 text-[#f9fafb] text-sm font-medium rounded-lg border-none cursor-pointer hover:opacity-90" onClick={handleSubmit}>
            {mode === 'add' ? '추가' : '저장'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4 w-[810px]">
        {/* 학생 정보 */}
        <div className="flex flex-col border border-[#c6c6c6] rounded-lg overflow-hidden [&_.input-wrapper]:flex-row [&_.input-wrapper]:items-center [&_.input-wrapper]:w-full [&_.input-wrapper]:gap-0 [&_.input-label]:flex-[0_0_100px] [&_.input-label]:px-4 [&_.input-label]:py-3 [&_.input-label]:text-[15px] [&_.input-label]:font-medium [&_.input-label]:text-[#393939] [&_.input-label]:bg-[#f9fafb] [&_.input-label]:border-r [&_.input-label]:border-[#c6c6c6] [&_.input-label]:mb-0 [&_.input-label]:h-full [&_.input-label]:flex [&_.input-label]:items-center [&_.input]:border-none [&_.input]:rounded-none [&_.input]:h-12 [&_.input:focus]:shadow-none [&_.input:focus]:border-none [&_.select-wrapper]:flex-row [&_.select-wrapper]:items-center [&_.select-wrapper]:w-full [&_.select-wrapper]:gap-0 [&_.select-label]:flex-[0_0_100px] [&_.select-label]:px-4 [&_.select-label]:py-3 [&_.select-label]:text-[15px] [&_.select-label]:font-medium [&_.select-label]:text-[#393939] [&_.select-label]:bg-[#f9fafb] [&_.select-label]:border-r [&_.select-label]:border-[#c6c6c6] [&_.select-label]:mb-0 [&_.select-label]:h-full [&_.select-label]:flex [&_.select-label]:items-center [&_.select]:border-none [&_.select]:rounded-none [&_.select]:h-12">
          <div className="flex items-stretch border-b border-[#c6c6c6]">
            <div className="flex-1 min-w-0 flex items-center border-r border-[#c6c6c6]">
              <Input
                label="입학학교"
                placeholder="입학 학교"
                value={admissionSchool}
                onChange={(e) => setAdmissionSchool(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center border-r border-[#c6c6c6]">
              <Input
                label="출신학교"
                placeholder="출신 학교"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex-[0_0_80px] flex items-center">
              <Input
                placeholder="반"
                label=" "
                value={classNumber}
                onChange={(e) => setClassNumber(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="flex items-stretch border-b border-[#c6c6c6]">
            <div className="flex-1 min-w-0 flex items-center border-r border-[#c6c6c6]">
              <Input
                label="이름"
                placeholder="학생이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex-1 min-w-0 flex items-center">
              <Select
                label="성별"
                placeholder="성별"
                options={genderOptions}
                value={gender}
                onChange={setGender}
                fullWidth
              />
            </div>
          </div>

          <div className="flex items-stretch border-b border-[#c6c6c6]">
            <div className="flex-1 min-w-0 flex items-center">
              <Input
                label="학생 연락처"
                placeholder="학생연락처"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                fullWidth
              />
            </div>
          </div>

          <div className="flex items-stretch">
            <div className="flex-1 min-w-0 flex items-center">
              <Input
                label="보호자 연락처"
                placeholder="보호자연락처"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                fullWidth
              />
            </div>
          </div>
        </div>

        {/* 날짜 정보 (edit 모드) */}
        {mode === 'edit' && student?.registeredDate && (
          <div className="flex gap-4 items-center">
            <span className="text-sm text-[#393939]">{student.registeredDate}</span>
            {student.modifiedDate && (
              <span className="text-sm text-[#959595]">
                {student.modifiedDate}
              </span>
            )}
          </div>
        )}

        {/* 다른 사이즈 추가 버튼 (edit 모드) */}
        {mode === 'edit' && (
          <div className="flex justify-end">
            <button className="flex items-center justify-center px-5 py-2 bg-[#1f234f] border border-[#1f234f] rounded-lg text-sm text-[#f9fafb] cursor-pointer transition-opacity duration-200 hover:opacity-80">
              다른 사이즈 추가
            </button>
          </div>
        )}

        {/* 동복 테이블 */}
        {renderUniformTable('동복', winterUniforms, 'winter')}

        {/* 하복 테이블 */}
        {renderUniformTable('하복', summerUniforms, 'summer')}

        {/* 용품 & 명찰 */}
        <div className="flex gap-4 items-start">
          {renderSupplyTable()}
          {renderNameTagTable()}
        </div>
      </div>
    </Modal>
  );
};
