import { describe, expect, it } from 'vitest';
import {
  resolveNamedSelectableGroups,
  resolveSelectableGroups,
  type NamedSelectableItem,
} from './selectableGroups';

interface Item extends NamedSelectableItem {
  product_name: string;
  selectable_with?: string[];
  gender?: string;
  is_selected?: boolean;
  label: string; // 테스트에서 결과를 식별하기 쉽게 하기 위한 표식
}

const item = (overrides: Partial<Item> & { product_name: string }): Item => ({
  label: overrides.product_name,
  ...overrides,
});

describe('resolveNamedSelectableGroups', () => {
  it('selectable_with가 없는 품목은 대안 없이 단독 그룹이 된다', () => {
    const items = [item({ product_name: '자켓' }), item({ product_name: '조끼' })];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups).toHaveLength(2);
    expect(groups[0].canonical.product_name).toBe('자켓');
    expect(groups[0].alternatives).toEqual([]);
    expect(groups[1].canonical.product_name).toBe('조끼');
  });

  it('교체 가능한 두 품목을 하나의 그룹으로 묶는다', () => {
    const items = [
      item({ product_name: '치마', selectable_with: ['바지'] }),
      item({ product_name: '바지', selectable_with: ['치마'] }),
    ];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].alternatives).toHaveLength(1);
  });

  it('대표 선택 1순위는 is_selected다 (성별 불일치여도 우선)', () => {
    const items = [
      item({ product_name: '치마', selectable_with: ['바지'], gender: 'F' }),
      item({ product_name: '바지', selectable_with: ['치마'], gender: 'M', is_selected: true }),
    ];
    const groups = resolveNamedSelectableGroups(items, 'F');
    expect(groups[0].canonical.product_name).toBe('바지');
    expect(groups[0].alternatives.map((a) => a.product_name)).toEqual(['치마']);
  });

  it('is_selected가 없으면 preferredGenderCode와 일치하는 품목을 대표로 고른다', () => {
    const items = [
      item({ product_name: '치마', selectable_with: ['바지'], gender: 'F' }),
      item({ product_name: '바지', selectable_with: ['치마'], gender: 'M' }),
    ];
    const groups = resolveNamedSelectableGroups(items, 'M');
    expect(groups[0].canonical.product_name).toBe('바지');
  });

  it('일치하는 성별이 없으면 그룹의 첫 품목을 대표로 고른다', () => {
    const items = [
      item({ product_name: '치마', selectable_with: ['바지'], gender: 'F' }),
      item({ product_name: '바지', selectable_with: ['치마'], gender: 'M' }),
    ];
    const groups = resolveNamedSelectableGroups(items, 'U');
    expect(groups[0].canonical.product_name).toBe('치마');
  });

  it('preferredGenderCode가 없으면 성별 매칭을 건너뛰고 첫 품목을 대표로 고른다', () => {
    const items = [
      item({ product_name: '치마', selectable_with: ['바지'], gender: 'F' }),
      item({ product_name: '바지', selectable_with: ['치마'], gender: 'M' }),
    ];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups[0].canonical.product_name).toBe('치마');
  });

  it('한쪽에만 연결이 걸린 비대칭 selectable_with도 하나의 그룹으로 묶는다', () => {
    // A -> B 링크만 있고 B -> A 링크는 없는 경우
    const items = [
      item({ product_name: 'A', selectable_with: ['B'] }),
      item({ product_name: 'B' }),
    ];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].alternatives.map((a) => a.product_name)).toEqual(['B']);
  });

  it('3개 이상으로 묶인 그룹도 전이적 폐쇄(transitive closure)로 하나로 묶는다', () => {
    // A는 B만 알고, B는 C만 아는 체인 형태 (A-B-C 전체가 한 그룹이어야 함)
    const items = [
      item({ product_name: 'A', selectable_with: ['B'] }),
      item({ product_name: 'B', selectable_with: ['C'] }),
      item({ product_name: 'C' }),
    ];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].canonical.product_name).toBe('A');
    expect(groups[0].alternatives.map((a) => a.product_name).sort()).toEqual(['B', 'C']);
  });

  it('selectable_with가 목록에 없는 이름을 가리키면 무시한다', () => {
    const items = [item({ product_name: 'A', selectable_with: ['존재하지않음'] })];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups).toHaveLength(1);
    expect(groups[0].alternatives).toEqual([]);
  });

  it('그룹 순서는 원본 배열에서 각 그룹이 처음 등장한 순서를 따른다', () => {
    const items = [
      item({ product_name: '자켓' }),
      item({ product_name: '치마', selectable_with: ['바지'] }),
      item({ product_name: '바지', selectable_with: ['치마'] }),
      item({ product_name: '조끼' }),
    ];
    const groups = resolveNamedSelectableGroups(items);
    expect(groups.map((g) => g.canonical.product_name)).toEqual(['자켓', '치마', '조끼']);
  });
});

describe('resolveSelectableGroups (저수준 엔진, id 기반 어댑터)', () => {
  interface IdItem {
    id: string;
    name: string;
    links?: string[];
  }

  it('product_name이 아닌 임의의 키(product_id 등)로도 그룹핑할 수 있다', () => {
    const items: IdItem[] = [
      { id: '1', name: '치마', links: ['2'] },
      { id: '2', name: '바지', links: ['1'] },
    ];
    const groups = resolveSelectableGroups(items, {
      getKey: (i) => i.id,
      getLinkedKeys: (i) => i.links,
      matchesPreferred: (i) => i.name.includes('바지'),
    });
    expect(groups).toHaveLength(1);
    expect(groups[0].canonical.name).toBe('바지');
  });

  it('isSelected가 matchesPreferred보다 우선한다', () => {
    const items: IdItem[] = [
      { id: '1', name: '치마', links: ['2'] },
      { id: '2', name: '바지', links: ['1'] },
    ];
    const groups = resolveSelectableGroups(items, {
      getKey: (i) => i.id,
      getLinkedKeys: (i) => i.links,
      isSelected: (i) => i.id === '1',
      matchesPreferred: (i) => i.name.includes('바지'),
    });
    expect(groups[0].canonical.name).toBe('치마');
  });
});
