import { describe, expect, it } from 'vitest';
import { matchPreferredLocale, parseAcceptLanguage } from './preferred-locale';

describe('matchPreferredLocale', () => {
  it.each([
    [['zh-CN'], 'zh-Hans'],
    [['zh-SG'], 'zh-Hans'],
    [['zh'], 'zh-Hans'],
    [['zh-TW'], 'zh-Hant'],
    [['zh-HK'], 'zh-Hant'],
    [['zh-Hant-HK'], 'zh-Hant'],
    [['zh-Hans-HK'], 'zh-Hans'],
    [['nl-BE'], 'nl'],
    [['uk-UA'], 'uk'],
    [['ja-JP'], 'ja'],
    [['nb-NO'], 'nb'],
    [['no'], 'nb'],
    [['nn-NO'], 'nb'],
    [['DE-de'], 'de'],
    [['xx', 'de-AT'], 'de'],
    [['xx'], undefined],
  ])('maps %j to %s', (tags, expected) => {
    expect(matchPreferredLocale(tags)).toBe(expected);
  });
});

describe('parseAcceptLanguage', () => {
  it('orders by weight and drops q=0', () => {
    expect(parseAcceptLanguage('de;q=0.5, zh-TW, fr;q=0, en;q=0.8')).toEqual(['zh-TW', 'en', 'de']);
  });

  it('accepts uppercase Q and spaces around the equals sign', () => {
    expect(parseAcceptLanguage('en;Q=0.5, de; q = 0.9, *;q=0.1')).toEqual(['de', 'en']);
  });

  it('drops tags with an unreadable weight', () => {
    expect(parseAcceptLanguage('fr;q=abc, en')).toEqual(['en']);
  });

  it('resolves a parsed header to a supported locale', () => {
    expect(matchPreferredLocale(parseAcceptLanguage('nn-NO, en;q=0.8'))).toBe('nb');
  });
});
