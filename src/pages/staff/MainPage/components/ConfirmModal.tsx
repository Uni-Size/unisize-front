import type { RegisterStudent } from '../../../../api/student';
import { Button } from '../../../../components/atoms/Button';
import './ConfirmModal.css';

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
    <div className="confirm-modal__overlay">
      <div className="confirm-modal__content">
        <p className="confirm-modal__text">
          {student.school_name} {student.name} 학생의 <br />
          교복 사이즈 확정을 시작 하시겠습니까?
        </p>
        <div className="confirm-modal__actions">
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
