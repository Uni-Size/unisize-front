import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    error: {
      control: 'text',
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'TEXT',
  },
};

export const WithLabel: Story = {
  args: {
    label: '라벨',
    placeholder: 'TEXT',
  },
};

export const WithValue: Story = {
  args: {
    placeholder: 'TEXT',
    defaultValue: 'TEXT',
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'TEXT',
    error: '에러 메시지',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'TEXT',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    placeholder: 'TEXT',
    fullWidth: true,
  },
};
