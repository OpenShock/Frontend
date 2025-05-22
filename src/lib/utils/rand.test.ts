import { describe, expect, it } from 'vitest';
import { randStr } from './rand';

describe('rand utils validator test', () => {
  it('generate random string with length 0 should return empty string', () => {
    const result = randStr(0);
    expect(result).toEqual('');
  });
  it('generate random string with length 10 should return string with length 10', () => {
    const result = randStr(10);
    expect(result.length).toEqual(10);
  });
});
