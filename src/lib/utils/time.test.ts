import { elapsedToString } from "./time";
import { describe, expect, it } from 'vitest';

describe('time utils validator test', () => {
  it('convert 0 to 0 seconds', () => {
    const result = elapsedToString(0);
    expect(result).toEqual('0 seconds');
  });
  it('convert 1000 to 1 second', () => {
    const result = elapsedToString(1000);
    expect(result).toEqual('1 second');
  });
  it('convert 600000 to 1 minute', () => {
    const result = elapsedToString(60000);
    expect(result).toEqual('1 minute');
  });
  it('convert 3600000 to 1 hour', () => {
    const result = elapsedToString(3600000);
    expect(result).toEqual('1 hour');
  });
  it('convert 86400000 to 1 day', () => {
    const result = elapsedToString(86400000);
    expect(result).toEqual('1 day');
  });
  it('convert 2592000000 to 1 month', () => {
    const result = elapsedToString(2592000000);
    expect(result).toEqual('1 month');
  });
  it('convert 31536000000 to 1 year', () => {
    const result = elapsedToString(31536000000);
    expect(result).toEqual('1 year');
  });
});
