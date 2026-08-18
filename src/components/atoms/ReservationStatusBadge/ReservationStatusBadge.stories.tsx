import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReservationStatusBadge } from './ReservationStatusBadge';

const meta: Meta<typeof ReservationStatusBadge> = {
  title: 'Atoms/ReservationStatusBadge',
  component: ReservationStatusBadge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['in_stock', 'reserved', 'out_of_stock'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InStock: Story = {
  args: {
    status: 'in_stock',
  },
};

export const Reserved: Story = {
  args: {
    status: 'reserved',
  },
};

export const OutOfStock: Story = {
  args: {
    status: 'out_of_stock',
  },
};

export const Small: Story = {
  args: {
    status: 'reserved',
    size: 'small',
  },
};

export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <ReservationStatusBadge status="in_stock" />
      <ReservationStatusBadge status="reserved" />
      <ReservationStatusBadge status="out_of_stock" />
    </div>
  ),
};
