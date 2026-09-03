import type { Meta, StoryObj } from '@storybook/react-vite';
import type { UnregisteredProduct } from '@/api/order';
import { UnregisteredOrderNotice } from './UnregisteredOrderNotice';

const meta: Meta<typeof UnregisteredOrderNotice> = {
  title: 'Organisms/UnregisteredOrderNotice',
  component: UnregisteredOrderNotice,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '학교 품목(school_uniforms)으로 등록되지 않은 품목에 걸린 주문을 알리는 경고 섹션. ' +
          '재고 부족(예약) 주문이 아니라 학교-품목 매핑 누락이므로, 재고 표(OrderSizeTable)와 ' +
          '다른 경고 톤을 쓰고 재고/잔여/예약 칸을 그리지 않는다. 기본 접힘 상태.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const shirt: UnregisteredProduct = {
  product_id: 'p-shirt',
  product_name: '하복 셔츠',
  display_name: '하복 셔츠',
  category: 'shirt',
  gender: 'female',
  season: 'S',
  sizes: [
    {
      size: '160',
      orders: [
        { name: '박학생', quantity: 1, status: 'reserved' },
        { name: '최학생', quantity: 2, status: 'reserved' },
      ],
    },
    { size: '155', orders: [{ name: '김학생', quantity: 1, status: 'pending' }] },
  ],
};

const pants: UnregisteredProduct = {
  product_id: 'p-pants',
  product_name: '동복 조절기긴바지',
  display_name: '동복 조절기긴바지',
  category: 'pants_adjuster',
  gender: 'male',
  season: 'W',
  sizes: [
    { size: '100', orders: [{ name: '이학생', quantity: 1, status: 'reserved' }] },
    { size: '90', orders: [{ name: '정학생', quantity: 1, status: 'reserved' }] },
  ],
};

const vest: UnregisteredProduct = {
  product_id: 'p-vest',
  product_name: '니트조끼',
  display_name: '니트조끼',
  category: 'knit_vest',
  gender: 'unisex',
  sizes: [{ size: 'L', orders: [{ name: '한학생', quantity: 3, status: 'out_of_stock' }] }],
};

/**
 * 미등록 주문이 하나도 없는 정상 상태. 섹션 자체가 렌더링되지 않는다(컴포넌트가 null 반환).
 * 캔버스가 비어 보이는 것이 정상 동작이다.
 */
export const Empty: Story = {
  args: { products: [] },
};

/** 미등록 품목 1개. 헤더 건수는 주문 라인 수(사이즈 그룹의 orders 합계) 기준이라 3건. */
export const SingleProduct: Story = {
  args: { products: [shirt] },
};

/** 미등록 품목 여러 개. 품목 → 사이즈 → 학생 3단 구조를 확인한다. */
export const MultipleProducts: Story = {
  args: { products: [shirt, pants, vest] },
};
