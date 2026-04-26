import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => redirect(303, resolve(`/terminal`));
