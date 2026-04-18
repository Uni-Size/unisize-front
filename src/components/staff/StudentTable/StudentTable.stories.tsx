import type { Meta, StoryObj } from '@storybook/react';
import { StudentTable } from './StudentTable';
import type { RegisterStudent } from '../../../api/student';

const meta: Meta<typeof StudentTable> = {
  title: 'Staff/StudentTable',
  component: StudentTable,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleStudents: RegisterStudent[] = [
  {
    id: 1,
    name: '김인철',
    gender: 'M',
    birth_date: '2010-03-15',
    student_phone: '010-1234-5678',
    guardian_phone: '010-8765-4321',
    previous_school: '솔밭중학교',
    admission_year: new Date().getFullYear(),
    admission_grade: 1,
    admission_school: '청주고등학교',
    school_name: '청주고등학교',
    class_name: '1',
    student_number: '1',
    address: '충청북도 청주시',
    privacy_consent: true,
    delivery: false,
    student_type: '',
    checked_in_at: `${new Date().getFullYear()}년 04월 12일 09:30:00`,
    created_at: '',
    updated_at: '',
  },
  {
    id: 2,
    name: '이영희',
    gender: 'F',
    birth_date: '2009-07-22',
    student_phone: '010-2222-3333',
    guardian_phone: '010-4444-5555',
    previous_school: '세광중학교',
    admission_year: new Date().getFullYear() - 1,
    admission_grade: 2,
    admission_school: '세광고등학교',
    school_name: '세광고등학교',
    class_name: '2',
    student_number: '5',
    address: '충청북도 청주시',
    privacy_consent: true,
    delivery: true,
    student_type: '',
    checked_in_at: `${new Date().getFullYear()}년 04월 12일 10:15:00`,
    created_at: '',
    updated_at: '',
  },
];

export const Default: Story = {
  args: {
    students: sampleStudents,
    total: sampleStudents.length,
    isLoading: false,
    error: null,
    isFetchingMore: false,
    onDetailClick: (student) => alert(`${student.name} 상세 클릭`),
  },
};

export const Loading: Story = {
  args: {
    students: [],
    total: 0,
    isLoading: true,
    error: null,
    onDetailClick: () => {},
  },
};

export const Empty: Story = {
  args: {
    students: [],
    total: 0,
    isLoading: false,
    error: null,
    onDetailClick: () => {},
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    students: [],
    total: 0,
    isLoading: false,
    error: null,
    onDetailClick: () => {},
    emptyMessage: '모든 학교 사이즈 측정이 완료 되었습니다.\n수고 하셨습니다.',
  },
};

export const WithError: Story = {
  args: {
    students: [],
    total: 0,
    isLoading: false,
    error: '서버 연결에 실패했습니다.',
    onDetailClick: () => {},
  },
};
