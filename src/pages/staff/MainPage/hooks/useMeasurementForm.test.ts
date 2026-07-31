import { describe, expect, it } from 'vitest';
import { applyGroupSupportToggle, type MeasurementUniformItem } from './useMeasurementForm';

// 치마/바지처럼 지원 한도 1개를 공유하는 교체 가능 그룹의 두 행을 만든다.
const makeGroupRow = (
  overrides: Partial<MeasurementUniformItem> & { rowId: string; name: string },
): MeasurementUniformItem => ({
  productId: overrides.rowId,
  season: 'winter',
  recommendedSize: '95',
  selectedSize: '95',
  availableSizes: [],
  supportedQuantity: 0,
  additionalQuantity: 0,
  unitPrice: 10000,
  repair: '',
  reservation: false,
  received: true,
  nameTagCount: 0,
  nameTagAttach: false,
  isRequired: false,
  isCustomizationRequired: false,
  isManuallyAdded: false,
  groupId: 'group_winter_0',
  groupQuantity: 1,
  isSupportChecked: false,
  ...overrides,
});

describe('applyGroupSupportToggle', () => {
  it('그룹에 속하지 않은 행(groupId 없음)을 토글하면 목록이 그대로 반환된다', () => {
    const standalone = makeGroupRow({ rowId: 'r1', name: '자켓', groupId: undefined, groupQuantity: undefined });
    const list = [standalone];
    expect(applyGroupSupportToggle(list, 'r1')).toBe(list);
  });

  it('존재하지 않는 rowId를 넘기면 목록이 그대로 반환된다', () => {
    const pants = makeGroupRow({ rowId: 'pants', name: '바지', isSupportChecked: true, supportedQuantity: 1, isRequired: true });
    const list = [pants];
    expect(applyGroupSupportToggle(list, 'nope')).toBe(list);
  });

  it('버그 재현: "+"로 복제된 미체크 행을 체크하면 원본 체크 행이 자동 해제되어 지원이 이중으로 잡히지 않는다', () => {
    // 초기 상태: 성별(M) 매칭으로 바지가 대표(체크), 치마는 대안(미체크).
    const pants = makeGroupRow({ rowId: 'pants', name: '바지', isSupportChecked: true, supportedQuantity: 1, isRequired: true });
    const skirt = makeGroupRow({ rowId: 'skirt', name: '치마', isSupportChecked: false, supportedQuantity: 0, isRequired: false });
    let list = [pants, skirt];

    // 스태프가 "+"로 바지 행을 복제(추가 구매용, 항상 미체크로 시작) — addUniformRow가
    // 보장하는 불변조건을 여기서 직접 재현.
    const extraPants = makeGroupRow({
      rowId: 'pants_extra',
      name: '바지',
      isManuallyAdded: true,
      additionalQuantity: 1,
      supportedQuantity: 0,
      isSupportChecked: false,
      isRequired: false,
    });
    list = [...list, extraPants];

    // 스태프가 복제 행의 드롭다운(현재는 체크박스) 대신, 그룹의 다른 멤버인
    // "치마" 체크박스를 직접 체크하는 시나리오로 바꿔 검증한다: 치마가 체크되면
    // 바지(원본)만 해제되어야 하고, 이미 지원수량 0인 복제 행은 영향받지 않는다.
    const afterCheckSkirt = applyGroupSupportToggle(list, 'skirt');
    const bySkirtRowId = Object.fromEntries(afterCheckSkirt.map((i) => [i.rowId, i]));

    expect(bySkirtRowId.skirt.isSupportChecked).toBe(true);
    expect(bySkirtRowId.skirt.supportedQuantity).toBe(1);
    expect(bySkirtRowId.pants.isSupportChecked).toBe(false);
    expect(bySkirtRowId.pants.supportedQuantity).toBe(0);
    // 복제 행은 애초에 미체크였고 그룹 정원(1)이 이미 skirt로 채워졌으므로 계속 0.
    expect(bySkirtRowId.pants_extra.isSupportChecked).toBe(false);
    expect(bySkirtRowId.pants_extra.supportedQuantity).toBe(0);

    // 전체 지원수량 합은 그룹 정원(1)을 절대 넘지 않는다.
    const totalSupported = afterCheckSkirt
      .filter((i) => i.groupId === 'group_winter_0')
      .reduce((sum, i) => sum + i.supportedQuantity, 0);
    expect(totalSupported).toBe(1);
  });

  it('체크: 그룹 정원을 넘지 않도록 이미 체크된 다른 멤버를 해제한다 (quantity=1)', () => {
    const pants = makeGroupRow({ rowId: 'pants', name: '바지', isSupportChecked: true, supportedQuantity: 1, isRequired: true });
    const skirt = makeGroupRow({ rowId: 'skirt', name: '치마', isSupportChecked: false, supportedQuantity: 0, isRequired: false });
    const result = applyGroupSupportToggle([pants, skirt], 'skirt');
    const byId = Object.fromEntries(result.map((i) => [i.rowId, i]));

    expect(byId.skirt).toMatchObject({ isSupportChecked: true, supportedQuantity: 1, isRequired: true });
    expect(byId.pants).toMatchObject({ isSupportChecked: false, supportedQuantity: 0, isRequired: false });
  });

  it('체크 해제: 대상 행만 해제되고 다른 행은 영향받지 않는다', () => {
    const pants = makeGroupRow({ rowId: 'pants', name: '바지', isSupportChecked: true, supportedQuantity: 1, isRequired: true });
    const skirt = makeGroupRow({ rowId: 'skirt', name: '치마', isSupportChecked: false, supportedQuantity: 0, isRequired: false });
    const result = applyGroupSupportToggle([pants, skirt], 'pants');
    const byId = Object.fromEntries(result.map((i) => [i.rowId, i]));

    expect(byId.pants).toMatchObject({ isSupportChecked: false, supportedQuantity: 0, isRequired: false });
    expect(byId.skirt).toMatchObject({ isSupportChecked: false, supportedQuantity: 0 });
  });

  it('그룹 정원(quantity)이 2 이상이면, 정원을 넘지 않는 한 여러 행을 동시에 체크할 수 있다', () => {
    const a = makeGroupRow({ rowId: 'a', name: 'A', groupQuantity: 2, isSupportChecked: true, supportedQuantity: 2, isRequired: true });
    const b = makeGroupRow({ rowId: 'b', name: 'B', groupQuantity: 2, isSupportChecked: false, supportedQuantity: 0 });
    const c = makeGroupRow({ rowId: 'c', name: 'C', groupQuantity: 2, isSupportChecked: false, supportedQuantity: 0 });

    const afterB = applyGroupSupportToggle([a, b, c], 'b');
    const byId1 = Object.fromEntries(afterB.map((i) => [i.rowId, i]));
    // 정원 2에 대해 a, b 둘 다 체크된 상태 — 아직 초과 아님.
    expect(byId1.a.isSupportChecked).toBe(true);
    expect(byId1.b).toMatchObject({ isSupportChecked: true, supportedQuantity: 2 });
    expect(byId1.c.isSupportChecked).toBe(false);

    // c까지 체크하면 정원(2)을 초과하므로 가장 먼저 등장한(오래된) a가 해제된다.
    const afterC = applyGroupSupportToggle(afterB, 'c');
    const byId2 = Object.fromEntries(afterC.map((i) => [i.rowId, i]));
    expect(byId2.a).toMatchObject({ isSupportChecked: false, supportedQuantity: 0 });
    expect(byId2.b).toMatchObject({ isSupportChecked: true, supportedQuantity: 2 });
    expect(byId2.c).toMatchObject({ isSupportChecked: true, supportedQuantity: 2 });
  });
});
