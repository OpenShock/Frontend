if (typeof (globalThis as { Temporal?: unknown }).Temporal === 'undefined') {
  await import('temporal-polyfill/global');
}

export {};
