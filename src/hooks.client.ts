import { BrowserTracing, Replay } from '@sentry/browser';
import { captureException as SentryCaptureException, init as SentryInit } from '@sentry/svelte';
import type { HandleServerError } from '@sveltejs/kit';
import {
  PUBLIC_SENTRY_DSN,
  PUBLIC_SENTRY_ENABLED,
  PUBLIC_SENTRY_REPLAYS_ONERROR_SAMPLERATE,
  PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLERATE,
  PUBLIC_SENTRY_TRACES_SAMPLERATE,
} from '$env/static/public';

const sentryEnabled = PUBLIC_SENTRY_ENABLED === 'true';

let errorHandler: HandleServerError;
if (sentryEnabled) {
  // Initialize Sentry for error and performance monitoring
  SentryInit({
    dsn: PUBLIC_SENTRY_DSN,
    tracesSampleRate: parseFloat(PUBLIC_SENTRY_TRACES_SAMPLERATE),

    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: parseFloat(PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLERATE),

    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: parseFloat(PUBLIC_SENTRY_REPLAYS_ONERROR_SAMPLERATE),

    // If you don't want to use Session Replay, just remove the line below:
    integrations: [new BrowserTracing(), new Replay()],
  });
  errorHandler = ({ error, event }) => {
    const eventId = SentryCaptureException(error, { extra: { event } });

    return {
      message: 'An error occurred',
      eventId,
    };
  };
} else {
  console.log('Sentry disabled in dev mode');
  errorHandler = (e) => {
    console.error(e);
  };
}

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = errorHandler;
