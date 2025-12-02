import { http, HttpResponse } from 'msw';
import { api_endpoint } from '../../config/api';


// Minimal handlers for key endpoints used in the app
export const handlers = [
  // direct messages post
  http.post(`${api_endpoint}/direct-messages/`, () => {
    return HttpResponse.json({ success: true, id: 123 }, { status: 201 });
  }),

  // notifications create
  http.post(`${api_endpoint}/notifications`, () => {
    return HttpResponse.json({ success: true, id: 1 }, { status: 201 });
  }),

  // comments list
  http.get(`${api_endpoint}/comments`, ({ request }) => {
    const url = new URL(request.url);
    const petId = url.searchParams.get('petId');
    return HttpResponse.json([{ id: 1, petId, commenterId: 2, commenterName: 'User B', content: 'Hola' }], { status: 200 });
  }),

  // comments post
  http.post(`${api_endpoint}/comments`, () => {
    return HttpResponse.json({ id: 999 }, { status: 201 });
  }),

  // comments update
  http.put(`${api_endpoint}/comments/update`, () => {
    return HttpResponse.json({ success: true }, { status: 200 });
  }),

  // direct-messages exists
  http.get(`${api_endpoint}/direct-messages/exists/:petId/:userId`, () => {
    return HttpResponse.json(true, { status: 200 });
  }),

  // live-location start
  http.post(`${api_endpoint}/live-location/start`, () => {
    const link = '/live-location/test123';
    const expiresAt = new Date(Date.now() + (5 * 60000)).toISOString();
    return HttpResponse.json({ link, shareToken: 'token123', expiresAt }, { status: 200 });
  }),

  // pets close
  http.post(`${api_endpoint}/pets/:id/close`, ({ params }) => {
    return HttpResponse.json({ id: params.id, status_post: 'closed' }, { status: 200 });
  }),

  // notifications by user
  http.get(`${api_endpoint}/notifications/user/:id`, ({ params }) => {
    return HttpResponse.json([{ id: 1, userId: params.id, title: 'Test' }], { status: 200 });
  })
];
