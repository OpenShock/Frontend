import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractBackendProblemTypes } from '../../../scripts/check-problem-types.js';
import { ProblemTypes } from './problemTypes';

// Types that never reach a browser through the REST client, so backend copy is acceptable.
const SERVER_ONLY_PREFIXES = ['Websocket.', 'AssignLcg.', 'ControlStats.MissingCapability'];

const apiDir = process.env.OPENSHOCK_API_DIR ?? path.resolve(__dirname, '../../../../API');
const hasApiCheckout = fs.existsSync(apiDir);

describe('ProblemTypes registry', () => {
  it('has a title for every user-reachable type', () => {
    const missing = Object.entries(ProblemTypes)
      .filter(([type]) => !SERVER_ONLY_PREFIXES.some((p) => type.startsWith(p)))
      .filter(([, copy]) => !('title' in copy) || !copy.title)
      .map(([type]) => type);
    expect(missing).toEqual([]);
  });

  it.skipIf(!hasApiCheckout)('matches the problem types defined in the API source', () => {
    const backend = extractBackendProblemTypes(apiDir);
    // Built inline in controllers rather than in an error class.
    backend.add('InternalServerError');
    const registry = new Set(Object.keys(ProblemTypes));

    const missingFromRegistry = [...backend].filter((t) => !registry.has(t)).sort();
    const missingFromBackend = [...registry].filter((t) => !backend.has(t)).sort();

    expect(missingFromRegistry).toEqual([]);
    expect(missingFromBackend).toEqual([]);
  });
});
