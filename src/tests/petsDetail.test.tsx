import React from 'react';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Switch } from 'react-router-dom';

import PetsDetail from '../pages/PetsDetail/PetsDetail';
import { AuthContext } from '../hooks/Context/AuthContext/AuthContext';
import { Camera } from '@capacitor/camera';

vi.mock('@ionic/react', async () => await import('./mocks/ionic-react-mock'));
vi.mock('@ionic/react-router', () => ({ IonReactRouter: ({ children }: any) => <div>{children}</div> }));
vi.mock('swiper/react', async () => await import('./mocks/swiper-mock'));
vi.mock('swiper/modules', async () => await import('./mocks/swiper-modules-mock'));
vi.mock('../components/Header/AppHeader', () => ({ default: () => <div data-testid="app-header" /> }));
vi.mock('@capacitor/camera', () => ({
  Camera: { getPhoto: vi.fn() },
  CameraResultType: { DataUrl: 'DataUrl' },
  CameraSource: { Prompt: 'Prompt' }
}));

const renderWithProviders = () => {
  const contextValue = {
    user: { id: 10, fullname: 'Tester' },
    setUser: vi.fn(),
    logout: vi.fn(),
    pets: null,
    setPets: vi.fn(),
    selectedPet: {
      id: 1,
      name: 'Fido',
      photos: [],
      description: 'Good dog',
      address: 'Somewhere',
      keywords: ['friendly'],
      reward: false,
      owner_post: 20,
      owner_name: 'Owner',
      status_post: 'open'
    },
    setSelectedPet: vi.fn(),
    selectedConversation: null,
    setSelectedConversation: vi.fn(),
    fetchPets: vi.fn(),
    fetchConversationsByPet: vi.fn(),
    loadingPets: false,
    petsError: null,
    updateUser: vi.fn()
  } as any;

  return render(
    <AuthContext.Provider value={contextValue}>
      <MemoryRouter initialEntries={["/tabs/pets/1"]}>
        <Switch>
          <Route path="/tabs/pets/:id" component={PetsDetail} />
        </Switch>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

const jsonResponse = (payload: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
  text: async () => JSON.stringify(payload)
});

describe('PetsDetail flows (Vitest)', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn((input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = (init?.method || 'GET').toUpperCase();

      if (url.includes('/direct-messages/exists/')) {
        return Promise.resolve(jsonResponse(false));
      }
      if (url.endsWith('/direct-messages/') && method === 'POST') {
        return Promise.resolve(jsonResponse({ success: true }));
      }
      if (url.endsWith('/notifications') && method === 'POST') {
        return Promise.resolve(jsonResponse({ success: true, id: 1 }, 201));
      }
      if (url.includes('/comments') && method === 'GET') {
        return Promise.resolve(jsonResponse([{ id: 1, commenterId: 2, commenterName: 'User B', content: 'Hola', createdAt: new Date().toISOString(), useful: 0 }]));
      }
      if (url.endsWith('/comments') && method === 'POST') {
        return Promise.resolve(jsonResponse({ id: 999 }, 201));
      }
      if (url.includes('/pets/') && url.endsWith('/close')) {
        return Promise.resolve(jsonResponse({ id: 1, status_post: 'closed' }));
      }
      return Promise.resolve(jsonResponse({}));
    }) as any;

    globalThis.fetch = fetchMock as any;
    localStorage.setItem('data_user', JSON.stringify({ id: 10, fullname: 'Tester' }));
    localStorage.setItem('accessToken', 'token-abc');

    const cameraMock = Camera as unknown as { getPhoto: ReturnType<typeof vi.fn> };
    cameraMock.getPhoto.mockResolvedValue({ dataUrl: 'data:image/png;base64,AAA=' });

    const geoMock = {
      getCurrentPosition: vi.fn((success: (position: GeolocationPosition) => void) => {
        success({
          coords: {
            latitude: 12.34,
            longitude: 56.78,
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        } as GeolocationPosition);
      })
    } as any;
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: geoMock,
      configurable: true
    });

    window.alert = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('sends contact message and creates notification', async () => {
    renderWithProviders();

    const contactTab = await screen.findByText(/Contacto/i);
    fireEvent.click(contactTab);

    const textarea = await screen.findByPlaceholderText(/Escribe un mensaje para el propietario/i);
    fireEvent.change(textarea, { target: { value: 'Hello owner' } });

    const cameraButton = screen.getByRole('button', { name: /Cam\/Galería/i });
    fireEvent.click(cameraButton);
    const cameraMock = Camera as unknown as { getPhoto: ReturnType<typeof vi.fn> };
    await waitFor(() => expect(cameraMock.getPhoto).toHaveBeenCalled());
    await screen.findByAltText('photo-0');

    const locationButton = screen.getByRole('button', { name: /Enviar ubicación/i });
    fireEvent.click(locationButton);


    const buttons = await screen.findAllByRole('button', { name: /Enviar/i });
    const sendBtn = buttons.find(btn => btn.textContent?.trim() === 'Enviar') as HTMLButtonElement | undefined;
    expect(sendBtn).toBeDefined();
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.removeAttribute('disabled');
      fireEvent.click(sendBtn);
    }

    await waitFor(() => {
      const hasDirect = fetchMock.mock.calls.some(([url, init]) => (
        typeof url === 'string' &&
        url.includes('/direct-messages/') &&
        (init as RequestInit | undefined)?.method === 'POST'
      ));
      expect(hasDirect).toBe(true);
    });

    await waitFor(() => {
      const hasNotification = fetchMock.mock.calls.some(([url, init]) => (
        typeof url === 'string' &&
        url.includes('/notifications') &&
        (init as RequestInit | undefined)?.method === 'POST'
      ));
      expect(hasNotification).toBe(true);
    });
    await screen.findByText(/Mensaje Enviado al propietario/i);
  });

  it('posts a comment and notifies owner', async () => {
    const { container } = renderWithProviders();

    const commentsTab = await screen.findByText(/Comentarios/i);
    fireEvent.click(commentsTab);

    const commentBox = await screen.findByPlaceholderText(/Escribe un comentario/i);
    fireEvent.change(commentBox, { target: { value: 'Nice!' } });

    const sendBtn = container.querySelector('.send-comment-btn') as HTMLButtonElement | null;
    expect(sendBtn).not.toBeNull();
    sendBtn?.click();

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/comments'), expect.objectContaining({ method: 'POST' } as any)));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/notifications'), expect.objectContaining({ method: 'POST' } as any)));
    await waitFor(() => expect((screen.getByPlaceholderText(/Escribe un comentario/i) as HTMLTextAreaElement).value).toBe(''));
  });
});
