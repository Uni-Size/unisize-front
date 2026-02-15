import type { RegisterStudent } from '../../../../api/student';
import { Button } from '../../../../components/atoms/Button';

interface ConfirmModalProps {
  student: RegisterStudent;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmModal({
  student,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-50 w-[calc(100%-48px)] max-w-100 p-6 rounded-xl text-center">
        <p className="text-lg font-semibold leading-relaxed text-gray-800">
          {student.school_name} {student.name} 학생의 <br />
          교복 사이즈 확정을 시작 하시겠습니까?
        </p>
        <div className="flex gap-4 mt-8 [&>button]:flex-1">
          <Button variant="secondary" onClick={onCancel}>
            취소
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            측정 시작하기
          </Button>
        </div>
      </div>
    </div>
  );
}
