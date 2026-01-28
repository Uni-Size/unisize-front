import type { Meta, StoryObj } from '@storybook/react';
import { AdminHeader } from './AdminHeader';

const meta: Meta<typeof AdminHeader> = {
  title: 'Organisms/AdminHeader',
  component: AdminHeader,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '주관구매 - 중',
  },
};

export const WithButton: Story = {
  args: {
    title: '학생 관리',
    buttonLabel: '추가',
    onButtonClick: () => alert('Button clicked'),
  },
};
