import { cleanup, render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { afterEach, describe, expect, it } from 'vitest';
import { breadcrumbs } from './breadcrumbs-state.svelte';
import BreadcrumbRegistrar from './__fixtures__/BreadcrumbRegistrar.svelte';

// Each render call mounts a component whose onDestroy clears its slot in _slots.
// cleanup() unmounts all rendered components, keeping state clean between tests.
afterEach(cleanup);

it('breadcrumbs.state is empty when nothing is registered', () => {
  expect(breadcrumbs.state).toEqual([]);
});

describe('registerBreadcrumbs', () => {
  it('populates state after mount', () => {
    render(BreadcrumbRegistrar, { entries: [{ label: 'Home', href: '/' }] });
    flushSync();
    expect(breadcrumbs.state).toEqual([{ label: 'Home', href: '/' }]);
  });

  it('defaults href to null when omitted', () => {
    render(BreadcrumbRegistrar, { entries: [{ label: 'Settings' }] });
    flushSync();
    expect(breadcrumbs.state).toEqual([{ label: 'Settings', href: null }]);
  });

  it('supports multiple entries in one registration', () => {
    render(BreadcrumbRegistrar, {
      entries: [
        { label: 'Home', href: '/' },
        { label: 'Settings', href: '/settings' },
      ],
    });
    flushSync();
    expect(breadcrumbs.state).toHaveLength(2);
    expect(breadcrumbs.state[0]).toEqual({ label: 'Home', href: '/' });
    expect(breadcrumbs.state[1]).toEqual({ label: 'Settings', href: '/settings' });
  });

  it('preserves explicit null href', () => {
    render(BreadcrumbRegistrar, { entries: [{ label: 'Current', href: null }] });
    flushSync();
    expect(breadcrumbs.state[0].href).toBeNull();
  });

  it('removes entries when the component is destroyed', () => {
    const { unmount } = render(BreadcrumbRegistrar, { entries: [{ label: 'Home', href: '/' }] });
    flushSync();
    expect(breadcrumbs.state).toHaveLength(1);
    unmount();
    expect(breadcrumbs.state).toHaveLength(0);
  });

  it('stacks entries from multiple independent registrations', () => {
    render(BreadcrumbRegistrar, { entries: [{ label: 'First', href: '/first' }] });
    render(BreadcrumbRegistrar, { entries: [{ label: 'Second', href: '/second' }] });
    flushSync();
    expect(breadcrumbs.state).toHaveLength(2);
  });

  it('removing one registration leaves the others intact', () => {
    render(BreadcrumbRegistrar, { entries: [{ label: 'Persistent', href: '/p' }] });
    const { unmount } = render(BreadcrumbRegistrar, { entries: [{ label: 'Transient', href: '/t' }] });
    flushSync();
    unmount();
    flushSync();
    expect(breadcrumbs.state).toHaveLength(1);
    expect(breadcrumbs.state[0].label).toBe('Persistent');
  });

  it('state is empty after all registrations are destroyed', () => {
    const { unmount: u1 } = render(BreadcrumbRegistrar, { entries: [{ label: 'A', href: '/a' }] });
    const { unmount: u2 } = render(BreadcrumbRegistrar, { entries: [{ label: 'B', href: '/b' }] });
    flushSync();
    u1();
    u2();
    expect(breadcrumbs.state).toHaveLength(0);
  });
});
