import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MeasurementConfirmModal } from './MeasurementConfirmModal';
import { Button } from '../../atoms/Button';
import type { RegisterStudent } from '../../../api/student';

const meta: Meta<typeof MeasurementConfirmModal> = {
  title: 'Staff/MeasurementConfirmModal',
  component: MeasurementConfirmModal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStudent: RegisterStudent = {
  id: 1,
  name: '한기선',
  gender: 'M',
  birth_date: '2010-01-01',
  student_phone: '111-1111-1111',
  guardian_phone: '222-2222-2222',
  previous_school: '세광중',
  admission_year: new Date().getFullYear(),
  admission_grade: 1,
  admission_school: '세광고',
  school_name: '세광고',
  class_name: '1',
  student_number: '1',
  address: '',
  privacy_consent: true,
  delivery: false,
  student_type: '',
  checked_in_at: `${new Date().getFullYear()}년 04월 12일 20:25:02`,
  created_at: '',
  updated_at: '',
};

export const Default: Story = {
  args: {
    student: sampleStudent,
    onCancel: () => alert('취소'),
    onConfirm: () => alert('측정 시작'),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          측정 시작 모달 열기
        </Button>
        {isOpen && (
          <MeasurementConfirmModal
            student={sampleStudent}
            onCancel={() => setIsOpen(false)}
            onConfirm={() => {
              alert('측정 시작!');
              setIsOpen(false);
            }}
          />
        )}
      </div>
    );
  },
};
