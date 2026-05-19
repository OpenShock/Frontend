import { driver, type Driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';
import { isOnboardingDisabled, markTourCompleted } from './onboarding-state';

export {
  hasCompletedTour,
  hasSeenWelcome,
  isOnboardingDisabled,
  markWelcomed,
  shouldShowWelcome,
} from './onboarding-state';

const SIDEBAR_TOGGLE_SEL = 'button[title="Toggle Sidebar"]';
const SIDEBAR_ROOT_SEL = '[data-slot="sidebar"]';
const SIDEBAR_LINK = (href: string) => `[data-slot="sidebar"] a[href$="${href}"]`;
const USER_MENU_SEL = 'header button:has(> img.rounded-full)';
const TOUR = (tag: string) => `[data-tour="${tag}"]`;

type SidebarState = 'desktop-expanded' | 'desktop-collapsed' | 'mobile-open' | 'mobile-closed';

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
}

function readSidebarState(): SidebarState {
  if (isMobileViewport()) {
    return document.querySelector('[data-slot="sidebar"][data-mobile="true"]')
      ? 'mobile-open'
      : 'mobile-closed';
  }
  return document.querySelector('[data-slot="sidebar"][data-state="expanded"]')
    ? 'desktop-expanded'
    : 'desktop-collapsed';
}

function waitForElement(selector: string, timeoutMs = 5000): Promise<Element | null> {
  const existing = document.querySelector(selector);
  if (existing) return Promise.resolve(existing);
  return new Promise((resolve) => {
    const obs = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        obs.disconnect();
        clearTimeout(timer);
        resolve(el);
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      obs.disconnect();
      resolve(document.querySelector(selector));
    }, timeoutMs);
  });
}

interface TourStep {
  // `action` advances on a real click of `element` (no Next button shown).
  // `info` advances on the Next button.
  kind: 'info' | 'action';
  element?: string;
  title: string;
  description: string;
  side?: DriveStep['popover'] extends infer P ? (P extends { side?: infer S } ? S : never) : never;
  // If set, the step is skipped when the predicate returns true at tour-start.
  skipIf?: () => boolean;
}

function sidebarOverviewSteps(): TourStep[] {
  return [
    {
      kind: 'info',
      element: SIDEBAR_LINK('/home'),
      title: 'Home',
      description: 'Your dashboard, with quick access to the shockers you control most often.',
      side: 'right',
    },
    {
      kind: 'info',
      element: SIDEBAR_LINK('/hubs'),
      title: 'Hubs',
      description: 'Your hubs live here. Pair new ones and check their status from this page.',
      side: 'right',
    },
    {
      kind: 'info',
      element: SIDEBAR_LINK('/shares/public'),
      title: 'Public shares',
      description: 'Generate links anyone can use, with limits and expiry you set.',
      side: 'right',
    },
  ];
}

function shockersDeepDive(): TourStep[] {
  return [
    {
      kind: 'action',
      element: SIDEBAR_LINK('/shockers/own'),
      title: 'Your shockers',
      description: 'This is where your own shockers live. Click to open the page.',
      side: 'right',
    },
    {
      kind: 'info',
      element: TOUR('shockers-add'),
      title: 'Add a shocker',
      description:
        'Pair a new shocker to one of your hubs. You can set its RF protocol, name, and limits when you add it.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('shockers-viewmode'),
      title: 'Pick a control layout',
      description:
        'Classic, Rich, or Simple. Switch between layouts depending on how you like to trigger shockers.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('shockers-layout'),
      title: 'Group & layout options',
      description: 'Group cards by hub and tweak how the grid is organised.',
      side: 'bottom',
    },
  ];
}

function userSharesDeepDive(): TourStep[] {
  return [
    {
      kind: 'action',
      element: SIDEBAR_LINK('/shares/user'),
      title: 'User shares',
      description: 'Permanent shares between you and another OpenShock user. Click to take a look.',
      side: 'right',
    },
    {
      kind: 'info',
      element: TOUR('user-shares-tabs'),
      title: 'Three tabs',
      description:
        'The tabs let you navigate between shares you give out, shares you receive, and pending invites.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('user-shares-tab-outgoing'),
      title: 'Shares — outgoing',
      description:
        'Everything you have shared with others. Each entry shows which shockers you granted and the permissions you set.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('user-shares-tab-incoming'),
      title: 'Shared with Me',
      description:
        'Shockers other users have granted you access to. They appear here once the owner accepts your request or sends you a share link.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('user-shares-tab-invites'),
      title: 'Invites',
      description:
        'Pending share requests waiting for the other party to accept. Once accepted they move to the Shares or Shared with Me tab.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('user-shares-new'),
      title: 'Create a share',
      description:
        'Pick a user, choose which shockers, and configure exactly what they can do: shock, vibrate, sound, intensity caps, durations.',
      side: 'bottom',
    },
    {
      kind: 'info',
      element: TOUR('user-shares-redeem'),
      title: 'Redeem a code',
      description:
        "Got a share code from someone else? Paste it here to accept the shockers they've shared with you.",
      side: 'bottom',
    },
  ];
}

function connectionsDeepDive(): TourStep[] {
  return [
    {
      kind: 'action',
      element: SIDEBAR_LINK('/settings/connections'),
      title: 'Connections',
      description:
        'Link third-party accounts so you can sign in faster next time. Click to open it.',
      side: 'right',
    },
    {
      kind: 'info',
      element: TOUR('connections-link'),
      title: 'OAuth connections',
      description:
        "Link a Discord, GitHub, or other supported account and you'll be able to sign in with one click. No password needed.",
      side: 'bottom',
    },
  ];
}

function desktopSteps(initial: SidebarState): TourStep[] {
  const startsExpanded = initial === 'desktop-expanded';

  const steps: TourStep[] = [];

  if (startsExpanded) {
    steps.push({
      kind: 'info',
      element: SIDEBAR_ROOT_SEL,
      title: 'Your navigation',
      description: 'Everything you can reach in the app lives in this sidebar.',
      side: 'right',
    });
    steps.push(...sidebarOverviewSteps());
    steps.push({
      kind: 'action',
      element: SIDEBAR_TOGGLE_SEL,
      title: 'Collapse it',
      description: 'Click to collapse the sidebar. Even collapsed, every icon is still navigable.',
      side: 'bottom',
    });
  } else {
    steps.push({
      kind: 'info',
      element: SIDEBAR_ROOT_SEL,
      title: 'The icon rail',
      description: 'When collapsed, the sidebar is a compact icon rail.',
      side: 'right',
    });
    steps.push({
      kind: 'action',
      element: SIDEBAR_TOGGLE_SEL,
      title: 'Expand the sidebar',
      description: 'Click to open it up so we can walk through what each section does.',
      side: 'bottom',
    });
    steps.push(...sidebarOverviewSteps());
  }

  steps.push(...shockersDeepDive());
  steps.push(...userSharesDeepDive());
  steps.push(...connectionsDeepDive());

  steps.push({
    kind: 'info',
    element: USER_MENU_SEL,
    title: 'Your account menu',
    description: 'Profile, account settings, and logout are tucked in here.',
    side: 'bottom',
    skipIf: () => !document.querySelector(USER_MENU_SEL),
  });

  steps.push({
    kind: 'info',
    title: "You're all set",
    description:
      'Explore at your own pace. If we add a major new feature later, we may show you a fresh tour the next time you visit.',
  });

  return steps;
}

function mobileSteps(initial: SidebarState): TourStep[] {
  const steps: TourStep[] = [];

  if (initial !== 'mobile-open') {
    steps.push({
      kind: 'action',
      element: SIDEBAR_TOGGLE_SEL,
      title: 'Open the menu',
      description: 'Tap the menu button to slide the navigation in.',
      side: 'bottom',
    });
  }

  steps.push({
    kind: 'info',
    element: SIDEBAR_ROOT_SEL,
    title: 'Your navigation',
    description: 'Everything you can reach in the app lives here.',
    side: 'right',
  });

  steps.push(...shockersDeepDive());
  steps.push(...userSharesDeepDive());
  steps.push(...connectionsDeepDive());

  steps.push({
    kind: 'info',
    title: "You're all set",
    description: 'Tap any item in the menu to navigate. It closes itself once you pick something.',
  });

  return steps;
}

function toDriverStep(step: TourStep): DriveStep {
  return {
    element: step.element,
    // Highlighted element is only interactive on action steps (where the user
    // is explicitly asked to click it). On info steps we don't want a stray
    // click on a sidebar link to navigate away from the tour.
    disableActiveInteraction: step.kind !== 'action',
    popover: {
      title: step.title,
      description: step.description,
      side: step.side ?? 'bottom',
      showButtons: step.kind === 'action' ? ['previous', 'close'] : ['next', 'previous', 'close'],
    },
  };
}

/**
 * Starts an interactive welcome tour. Steps adapt to the current sidebar
 * state and require the user to click into pages themselves; we wait for
 * each next highlight target to render before advancing.
 */
export function startWelcomeTour(): Promise<void> {
  if (isOnboardingDisabled()) return Promise.resolve();
  const initial = readSidebarState();
  const allSteps = isMobileViewport() ? mobileSteps(initial) : desktopSteps(initial);
  const tourSteps = allSteps.filter((s) => !s.skipIf?.());
  const driverSteps = tourSteps.map(toDriverStep);

  return new Promise((resolve) => {
    const ctx: { d: Driver | null; cleanup: (() => void) | null } = { d: null, cleanup: null };

    const wireUpActionAdvance = () => {
      ctx.cleanup?.();
      ctx.cleanup = null;

      const idx = ctx.d!.getActiveIndex();
      if (idx === undefined) return;
      const step = tourSteps[idx];
      if (step?.kind !== 'action' || !step.element) return;

      const target = document.querySelector(step.element);
      if (!target) return;

      const handler = async () => {
        ctx.cleanup?.();
        ctx.cleanup = null;
        // Wait for the next step's element to render before advancing. For
        // sidebar-toggle clicks the next target already exists and resolves
        // instantly; for sidebar-link clicks it lets the new page mount.
        const next = tourSteps[idx + 1];
        if (next?.element) {
          await waitForElement(next.element);
        } else {
          await new Promise((r) => setTimeout(r, 80));
        }
        ctx.d!.moveNext();
      };
      target.addEventListener('click', handler, { once: true });
      ctx.cleanup = () => target.removeEventListener('click', handler);
    };

    ctx.d = driver({
      showProgress: true,
      allowClose: true,
      // Clicks on the dimmed overlay shouldn't end the tour or advance it.
      // Users can still close via the X button or Esc.
      overlayClickBehavior: () => {},
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next',
      prevBtnText: 'Back',
      doneBtnText: 'Done',
      steps: driverSteps,
      onHighlighted: wireUpActionAdvance,
      onDeselected: () => {
        ctx.cleanup?.();
        ctx.cleanup = null;
      },
      onDestroyed: () => {
        ctx.cleanup?.();
        markTourCompleted();
        resolve();
      },
    });
    ctx.d.drive();
  });
}
