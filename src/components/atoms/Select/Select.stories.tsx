import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Select } from './Select';

const meta: Meta<typeof Select> = {
  title: 'Atoms/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleOptions = [
  { value: 'apple', label: '사과' },
  { value: 'banana', label: '바나나' },
  { value: 'orange', label: '오렌지' },
  { value: 'grape', label: '포도' },
];

const sampleGroups = [
  {
    label: '과일',
    options: [
      { value: 'apple', label: '사과' },
      { value: 'banana', label: '바나나' },
    ],
  },
  {
    label: '채소',
    options: [
      { value: 'carrot', label: '당근' },
      { value: 'broccoli', label: '브로콜리' },
    ],
  },
];

export const Default: Story = {
  args: {
    options: sampleOptions,
    placeholder: '선택하세요',
  },
};

export const WithLabel: Story = {
  args: {
    label: '카테고리',
    options: sampleOptions,
    placeholder: '선택하세요',
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState('banana');
    return (
      <Select
        label="과일 선택"
        options={sampleOptions}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const WithGroups: Story = {
  render: () => {
    const [value, setValue] = useState('');
    return (
      <Select
        label="식재료"
        groups={sampleGroups}
        options={[]}
        value={value}
        onChange={setValue}
        placeholder="선택하세요"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    label: '비활성',
    options: sampleOptions,
    placeholder: '선택 불가',
    disabled: true,
  },
};

export const FullWidth: Story = {
  args: {
    label: '전체 너비',
    options: sampleOptions,
    placeholder: '선택하세요',
    fullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};
