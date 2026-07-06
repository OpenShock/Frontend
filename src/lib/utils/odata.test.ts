import { describe, expect, it } from 'vitest';
import { odataAnd, odataContains, odataEq, odataILike, odataLiteral } from './odata';

describe('odataLiteral', () => {
  it('always wraps in single quotes', () => {
    expect(odataLiteral('failed')).toBe("'failed'");
    expect(odataLiteral('foo@example.com')).toBe("'foo@example.com'");
  });

  it('escapes embedded quotes and backslashes', () => {
    expect(odataLiteral("O'Brien")).toBe("'O\\'Brien'");
    expect(odataLiteral('a\\b')).toBe("'a\\\\b'");
  });
});

describe('odataEq / odataILike / odataContains', () => {
  it('builds quoted clauses', () => {
    expect(odataEq('status', 'Failed')).toBe("status eq 'Failed'");
    expect(odataILike('recipient', '%@example.com')).toBe("recipient ilike '%@example.com'");
    expect(odataContains('recipient', 'foo')).toBe("recipient ilike '%foo%'");
  });
});

describe('odataAnd', () => {
  it('joins present clauses with and', () => {
    expect(odataAnd(odataEq('status', 'Failed'), odataContains('recipient', 'foo'))).toBe(
      "status eq 'Failed' and recipient ilike '%foo%'"
    );
  });

  it('drops empty clauses and returns undefined when nothing remains', () => {
    expect(odataAnd(undefined, false, '')).toBeUndefined();
    expect(odataAnd(odataEq('status', 'Sent'), undefined)).toBe("status eq 'Sent'");
  });
});
