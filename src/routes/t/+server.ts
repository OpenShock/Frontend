import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
	const redirectUrl = url.origin + '/settings/api-tokens/new?' + url.searchParams.toString();
	return new Response(String('Redirecting...'), {
		status: 308,
		headers: {
			'Location': redirectUrl
		}
	});
};

