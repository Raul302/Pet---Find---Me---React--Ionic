import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Provide TextEncoder/TextDecoder for some libs (safe even if already present)
import { TextEncoder, TextDecoder } from 'util';
(global as any).TextEncoder = (global as any).TextEncoder || TextEncoder;
(global as any).TextDecoder = (global as any).TextDecoder || TextDecoder;

// Lightweight global fetch mock that returns predictable responses for our tests.
// This avoids MSW and ESM transform problems in the test environment.
const jsonResponse = (obj: any, status = 200) => {
	return Promise.resolve({
		ok: status >= 200 && status < 300,
		status,
		json: async () => obj,
		text: async () => JSON.stringify(obj)
	});
};

// Simple handler mapping similar to src/tests/msw/handlers.ts
(global as any).fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
	const url = String(input);
	const method = (init && init.method) ? init.method.toUpperCase() : 'GET';

	// direct messages POST
	if (url.endsWith('/direct-messages/') && method === 'POST') {
		return jsonResponse({ success: true, id: 123 }, 201);
	}

	// notifications POST
	if (url.endsWith('/notifications') && method === 'POST') {
		return jsonResponse({ success: true, id: 1 }, 201);
	}

	// comments list
	if (url.includes('/comments') && method === 'GET') {
		return jsonResponse([{ id: 1, petId: 1, commenterId: 2, commenterName: 'User B', content: 'Hola' }], 200);
	}

	// comments POST
	if (url.endsWith('/comments') && method === 'POST') {
		return jsonResponse({ id: 999 }, 201);
	}

	// comments update
	if (url.endsWith('/comments/update') && (method === 'PUT' || method === 'POST')) {
		return jsonResponse({ success: true }, 200);
	}

	// direct-messages exists
	if (url.includes('/direct-messages/exists/')) {
		return jsonResponse(true, 200);
	}

	// live-location start
	if (url.endsWith('/live-location/start') && method === 'POST') {
		const link = '/live-location/test123';
		const expiresAt = new Date(Date.now() + (5 * 60000)).toISOString();
		return jsonResponse({ link, shareToken: 'token123', expiresAt }, 200);
	}

	// pets close
	if (url.match(/\/pets\/\d+\/close/) && method === 'POST') {
		const idMatch = url.match(/\/pets\/(\d+)\/close/);
		const id = idMatch ? idMatch[1] : null;
		return jsonResponse({ id, status_post: 'closed' }, 200);
	}

	// notifications by user
	if (url.includes('/notifications/user/')) {
		return jsonResponse([{ id: 1, userId: 1, title: 'Test' }], 200);
	}

	// Default fallback: return an empty successful response
	return jsonResponse({}, 200);
});
