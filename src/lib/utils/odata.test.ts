import { describe, expect, it } from 'vitest';
import { odataAnd, odataContains, odataEq, odataILike, odataLiteral, odataSearch } from './odata';

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

describe('odataSearch', () => {
  it('uses eq for plain input', () => {
    expect(odataSearch('name', 'alice')).toBe("name eq 'alice'");
  });

  it('uses ilike when the input has a wildcard', () => {
    expect(odataSearch('name', 'ali%')).toBe("name ilike 'ali%'");
  });

  it('trims and returns undefined for blank input', () => {
    expect(odataSearch('name', '   ')).toBeUndefined();
    expect(odataSearch('name', '')).toBeUndefined();
  });
});
