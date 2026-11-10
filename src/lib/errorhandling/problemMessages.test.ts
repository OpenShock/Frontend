import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { problemMessageKey } from './problemMessageKey';
import { ProblemMessages } from './problemMessages';

type ProblemCopyMessages = { title?: () => string; description?: () => string };
import { type ProblemCopy, type ProblemType, ProblemTypes } from './problemTypes';

const messagesDir = path.resolve(__dirname, '../../../messages');
const locales = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json'));
const read = (file: string): Record<string, unknown> =>
  JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf-8'));

// Every field the registry fills, as [message key, English text].
const fields = Object.entries(ProblemTypes as Record<ProblemType, ProblemCopy>).flatMap(
  ([type, copy]) => {
    const key = problemMessageKey(type as ProblemType);
    const out: [string, string][] = [];
    if (copy.title) out.push([`${key}_title`, copy.title]);
    if (copy.description) out.push([`${key}_desc`, copy.description]);
    return out;
  }
);

describe('problem type messages', () => {
  it('matches the registry text in English', () => {
    const en = read('en.json');
    const mismatched = fields.filter(([key, text]) => en[key] !== text).map(([key]) => key);
    expect(mismatched).toEqual([]);
  });

  it('maps every registry field to the message with its English text', () => {
    const mismatched = Object.entries(ProblemTypes as Record<ProblemType, ProblemCopy>).flatMap(
      ([type, copy]) => {
        const messages: ProblemCopyMessages = ProblemMessages[type as ProblemType];
        return (['title', 'description'] as const)
          .filter((field) => messages[field]?.() !== copy[field])
          .map((field) => `${type}.${field}`);
      }
    );
    expect(mismatched).toEqual([]);
  });

  it.each(locales)('has every problem message in %s', (file) => {
    const messages = read(file);
    const missing = fields.filter(([key]) => !(key in messages)).map(([key]) => key);
    expect(missing).toEqual([]);
  });
});
