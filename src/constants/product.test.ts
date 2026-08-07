import { describe, it, expect } from 'vitest';
import { compareSizes, sortSizes } from './product';

describe('13-grade alpha sort', () => {
  it('full 13 grades in canonical spelling', () => {
    expect(sortSizes(['L','5XL','M','XXS','S','3XS','XL','5XS','XS','XXL','4XL','4XS','3XL']))
      .toEqual(['5XS','4XS','3XS','XXS','XS','S','M','L','XL','XXL','3XL','4XL','5XL']);
  });
  it('alias spellings fold to the same grade order', () => {
    expect(sortSizes(['XXXL','2XL','L','XXXXXS','2XS','XXXXL']))
      .toEqual(['XXXXXS','2XS','L','2XL','XXXL','XXXXL']);
  });
  it('case and whitespace insensitive', () => {
    expect(sortSizes([' xxl ','m','3xl','s'])).toEqual(['s','m',' xxl ','3xl']);
  });
  it('regression: old 7-grade behaviour preserved', () => {
    expect(sortSizes(['L','M','S','XL','XS','XXL'])).toEqual(['XS','S','M','L','XL','XXL']);
  });
  it('regression: numeric ascending', () => {
    expect(sortSizes(['100','85','110','95','77'])).toEqual(['77','85','95','100','110']);
  });
  it('objects sort via comparator', () => {
    const objs = [{size:'3XL'},{size:'M'},{size:'5XS'},{size:'XL'}];
    expect(objs.slice().sort((a,b)=>compareSizes(a.size,b.size)).map(o=>o.size))
      .toEqual(['5XS','M','XL','3XL']);
  });
  it('FREE and unknown labels do not crash', () => {
    expect(sortSizes(['FREE'])).toEqual(['FREE']);
    expect(sortSizes(['M','FREE','L'])).toBeTruthy();
    expect(sortSizes(['__proto__','constructor','M'])).toBeTruthy();
  });
});
