import { RegisterStudent } from "@/api/student";
import Button from "@/components/ui/Button";

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
    <div className="fixed top-0 left-0 w-full h-full bg-background-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background-50 w-full p-6 rounded-xl m-6 text-center title1">
        <p>
          {student.school_name} {student.name} 학생의 <br />
          교복 사이즈 확정을 시작 하시겠습니까?
        </p>
        <div className="flex gap-4 mt-8">
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
