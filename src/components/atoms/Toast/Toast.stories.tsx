import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Toast } from './Toast';
import { Button } from '@components/atoms/Button';

const meta: Meta<typeof Toast> = {
  title: 'Atoms/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['success', 'error', 'info'],
    },
    duration: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  args: {
    message: '승인이 완료되었습니다.',
    variant: 'success',
    onClose: () => {},
  },
};

export const Error: Story = {
  args: {
    message: '승인에 실패했습니다.',
    variant: 'error',
    onClose: () => {},
  },
};

export const Info: Story = {
  args: {
    message: '처리 중입니다.',
    variant: 'info',
    onClose: () => {},
  },
};

export const Interactive: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <Button variant="primary" onClick={() => setVisible(true)}>
          승인
        </Button>
        {visible && (
          <Toast
            message="승인이 완료되었습니다."
            variant="success"
            onClose={() => setVisible(false)}
          />
        )}
      </div>
    );
  },
};
