import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../Button/Button';
import { Modal } from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Atoms/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    width: { control: { type: 'number', min: 300, max: 1200 } },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="기본 모달"
        >
          <p>모달 내용입니다.</p>
        </Modal>
      </>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="확인 모달"
          actions={
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
              <Button onClick={() => setIsOpen(false)}>확인</Button>
            </>
          }
        >
          <p>정말로 이 작업을 수행하시겠습니까?</p>
        </Modal>
      </>
    );
  },
};

export const WithTitleExtra: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="제목 추가 정보"
          titleExtra={<span style={{ fontSize: '12px', color: '#6b7280' }}>부가 정보</span>}
        >
          <p>타이틀 옆에 추가 요소가 있는 모달입니다.</p>
        </Modal>
      </>
    );
  },
};

export const Narrow: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setIsOpen(true)}>좁은 모달 열기</Button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="좁은 모달"
          width={400}
          actions={<Button onClick={() => setIsOpen(false)}>닫기</Button>}
        >
          <p>width 400px 모달입니다.</p>
        </Modal>
      </>
    );
  },
};
