import type { Meta, StoryObj } from '@storybook/react';
import { AdminSidebar } from './AdminSidebar';

const meta: Meta<typeof AdminSidebar> = {
  title: 'Organisms/AdminSidebar',
  component: AdminSidebar,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currentPath: '/admin/orders',
  },
};

export const SchoolActive: Story = {
  args: {
    currentPath: '/admin/schools',
  },
};
