import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../Badge/Badge';
import { Table } from './Table';

interface SampleUser {
  id: number;
  name: string;
  email: string;
  status: string;
}

const meta: Meta<typeof Table<SampleUser>> = {
  title: 'Atoms/Table',
  component: Table,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleColumns = [
  { key: 'id', header: 'ID', width: '60px', align: 'center' as const },
  { key: 'name', header: '이름' },
  { key: 'email', header: '이메일' },
  {
    key: 'status',
    header: '상태',
    render: (item: SampleUser) => (
      <Badge variant={item.status === '활성' ? 'success' : 'default'}>{item.status}</Badge>
    ),
  },
];

const sampleData: SampleUser[] = [
  { id: 1, name: '홍길동', email: 'hong@example.com', status: '활성' },
  { id: 2, name: '김철수', email: 'kim@example.com', status: '비활성' },
  { id: 3, name: '이영희', email: 'lee@example.com', status: '활성' },
];

export const Default: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
  },
};

export const WithRowClick: Story = {
  args: {
    columns: sampleColumns,
    data: sampleData,
    onRowClick: (item: SampleUser) => alert(`선택: ${item.name}`),
  },
};

export const Empty: Story = {
  args: {
    columns: sampleColumns,
    data: [],
  },
};

export const CustomEmptyMessage: Story = {
  args: {
    columns: sampleColumns,
    data: [],
    emptyMessage: '검색 결과가 없습니다.',
  },
};
