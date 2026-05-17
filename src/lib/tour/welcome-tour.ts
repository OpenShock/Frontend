import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_DONE_KEY = 'os.tourCompleted';

const SIDEBAR_TOGGLE_SEL = 'button[title="Toggle Sidebar"]';
const SIDEBAR_ROOT_SEL = '[data-slot="sidebar"]';
// First navigable sidebar link — used both as the "click an icon" target and
// as the "click an item" target on mobile.
const SIDEBAR_FIRST_LINK_SEL = '[data-slot="sidebar"] a[href*="/home"]';

/**
 * A step that is either:
 *   - an `info` step with a Next button, or
 *   - an `action` step that advances when the user clicks the highlighted
 *     element. The Next button is replaced with a Skip option.
 */
interface TourStep {
  kind: 'info' | 'action';
  element?: string;
  title: string;
  description: string;
  side?: DriveStep['popover'] extends infer P ? (P extends { side?: infer S } ? S : never) : never;
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
}

function desktopSteps(): TourStep[] {
  return [
    {
      kind: 'action',
      element: SIDEBAR_TOGGLE_SEL,
      title: 'Open the sidebar',
      description: 'Click the toggle to expand it.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: SIDEBAR_ROOT_SEL,
      title: 'Your navigation',
      description: 'Everything you can reach in the app lives here, grouped by what it does.',
      side: 'right',
    },
    {
      kind: 'action',
      element: SIDEBAR_TOGGLE_SEL,
      title: 'Collapse it again',
      description: 'Click the toggle once more so we can show you a trick.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: SIDEBAR_ROOT_SEL,
      title: 'Still fully navigable',
      description:
        'Collapsed, the sidebar becomes an icon rail — same destinations, less space taken.',
      side: 'right',
    },
    {
      kind: 'action',
      element: SIDEBAR_FIRST_LINK_SEL,
      title: 'Click an icon to navigate',
      description: 'Try jumping to Home from the collapsed rail.',
      side: 'right',
    },
    {
      kind: 'info',
      title: "You're all set",
      description:
        'Explore the rest of the sidebar at your own pace. Come back to this tour anytime from the help menu.',
    },
  ];
}

function mobileSteps(): TourStep[] {
  return [
    {
      kind: 'action',
      element: SIDEBAR_TOGGLE_SEL,
      title: 'Open the menu',
      description: 'Tap the menu button to slide the navigation in.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: SIDEBAR_ROOT_SEL,
      title: 'Your navigation',
      description: 'Everything you can reach in the app lives here.',
      side: 'right',
    },
    {
      kind: 'action',
      element: SIDEBAR_FIRST_LINK_SEL,
      title: 'Tap any item to navigate',
      description: 'The menu closes itself once you pick something.',
      side: 'right',
    },
    {
      kind: 'info',
      title: "You're all set",
      description: 'Explore the rest at your own pace.',
    },
  ];
}

function toDriverStep(step: TourStep): DriveStep {
  return {
    element: step.element,
    popover: {
      title: step.title,
      description: step.description,
      side: step.side ?? 'bottom',
      showButtons: step.kind === 'action' ? ['previous', 'close'] : ['next', 'previous', 'close'],
    },
  };
}

export function hasCompletedTour(): boolean {
  try {
    return localStorage.getItem(TOUR_DONE_KEY) === '1';
  } catch {
    return false;
  }
}

function markTourCompleted(): void {
  try {
    localStorage.setItem(TOUR_DONE_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * Starts an interactive welcome tour. The user is asked to actually open,
 * collapse, and use the sidebar — passive tooltips don't make anyone explore.
 *
 * Action steps replace the Next button with Skip, and advance only when the
 * user clicks the highlighted element. The driver overlay persists across
 * SvelteKit's client-side navigation because the sidebar is in a shared
 * layout, not a per-route element.
 *
 * Mobile gets a shortened branch that omits the "collapsed sidebar is still
 * navigable" sequence (it doesn't apply — mobile uses an off-canvas sheet).
 */
export function startWelcomeTour(): Promise<void> {
  const tourSteps = isMobileViewport() ? mobileSteps() : desktopSteps();
  const driverSteps = tourSteps.map(toDriverStep);

  return new Promise((resolve) => {
    let d: Driver;
    let cleanupClickListener: (() => void) | null = null;

    const wireUpActionAdvance = () => {
      cleanupClickListener?.();
      cleanupClickListener = null;

      const idx = d.getActiveIndex();
      if (idx === undefined) return;
      const step = tourSteps[idx];
      if (step?.kind !== 'action' || !step.element) return;

      const target = document.querySelector(step.element);
      if (!target) return;

      // Real click — lets SvelteKit's link handler / sidebar toggle do their
      // normal work, while we use the same event to advance the tour.
      const handler = () => {
        cleanupClickListener?.();
        cleanupClickListener = null;
        // Defer slightly so any state mutation (sidebar opening, route change)
        // is committed before driver re-measures the next highlight target.
        setTimeout(() => d.moveNext(), 50);
      };
      target.addEventListener('click', handler, { once: true });
      cleanupClickListener = () => target.removeEventListener('click', handler);
    };

    d = driver({
      showProgress: true,
      allowClose: true,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Skip',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      steps: driverSteps,
      onHighlighted: wireUpActionAdvance,
      onDeselected: () => {
        cleanupClickListener?.();
        cleanupClickListener = null;
      },
      onDestroyed: () => {
        cleanupClickListener?.();
        markTourCompleted();
        resolve();
      },
    });
    d.drive();
  });
}
