import { Badge, type BadgeProps } from '../Badge';

export type ReservationStatus = 'reserved' | 'out_of_stock' | 'in_stock';

export interface ReservationStatusBadgeProps {
  status: ReservationStatus;
  size?: BadgeProps['size'];
}

// 측정 기간 중 예약은 정상 처리 결과이므로 경고/오류색이 아닌 info로 표시한다.
const statusStyles: Record<
  ReservationStatus,
  { label: string; variant: BadgeProps['variant'] }
> = {
  in_stock: { label: '재고 있음', variant: 'success' },
  reserved: { label: '예약', variant: 'info' },
  out_of_stock: { label: '재고 부족', variant: 'error' },
};

export const ReservationStatusBadge = ({
  status,
  size = 'medium',
}: ReservationStatusBadgeProps) => {
  const { label, variant } = statusStyles[status];

  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};
