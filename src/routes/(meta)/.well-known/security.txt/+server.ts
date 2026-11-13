import { getSiteURL } from '#lib/utils/url.js';
import {
  PUBLIC_SECURITY_ACKNOWLEDGMENTS_URL,
  PUBLIC_SECURITY_CONTACT,
  PUBLIC_SECURITY_EXPIRES,
  PUBLIC_SECURITY_POLICY_URL,
} from '$app/env/public';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * security.txt (RFC 9116): where to report a security vulnerability in this deployment.
 *
 * Returns 404 when no contact is configured, and when the expiry date is missing or has passed,
 * because the RFC prefers no file over stale contact information.
 */
export const GET: RequestHandler = ({ setHeaders }) => {
  const contacts = PUBLIC_SECURITY_CONTACT.split(',').filter(Boolean);
  if (contacts.length === 0 || !PUBLIC_SECURITY_EXPIRES) error(404);

  const expires = new Date(PUBLIC_SECURITY_EXPIRES);
  if (expires.getTime() <= Date.now()) error(404);

  const lines = [
    ...contacts.map((contact) => `Contact: ${contact}`),
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: en',
  ];

  // The file only speaks for the origin it is served from, and RFC 9116 requires HTTPS.
  const canonical = getSiteURL('.well-known/security.txt');
  if (canonical.protocol === 'https:') lines.push(`Canonical: ${canonical.href}`);
  if (PUBLIC_SECURITY_POLICY_URL) lines.push(`Policy: ${PUBLIC_SECURITY_POLICY_URL}`);
  if (PUBLIC_SECURITY_ACKNOWLEDGMENTS_URL) {
    lines.push(`Acknowledgments: ${PUBLIC_SECURITY_ACKNOWLEDGMENTS_URL}`);
  }

  setHeaders({
    'content-type': 'text/plain; charset=utf-8',
    'cache-control': 'public, max-age=3600',
  });

  return new Response(lines.join('\n') + '\n');
};
