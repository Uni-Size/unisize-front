import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '기본',
    variant: 'default',
  },
};

export const Success: Story = {
  args: {
    children: '성공',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: '경고',
    variant: 'warning',
  },
};

export const Error: Story = {
  args: {
    children: '오류',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: '정보',
    variant: 'info',
  },
};

export const Small: Story = {
  args: {
    children: '작게',
    size: 'small',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Badge variant="default">기본</Badge>
      <Badge variant="success">성공</Badge>
      <Badge variant="warning">경고</Badge>
      <Badge variant="error">오류</Badge>
      <Badge variant="info">정보</Badge>
    </div>
  ),
};
