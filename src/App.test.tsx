import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './App';
import { AuthContext } from './hooks/Context/AuthContext/AuthContext';

vi.mock('@ionic/react', async () => await import('./tests/mocks/ionic-react-mock'));
vi.mock('@ionic/react-router', () => ({ IonReactRouter: ({ children }: any) => <MemoryRouter>{children}</MemoryRouter> }));
vi.mock('./components/Header/AppHeader', () => ({ default: () => <div data-testid="app-header" /> }));
vi.mock('./Routers/PrivateRouter', () => ({ default: ({ children }: any) => <>{children}</> }));
vi.mock('./pages/Tab1', () => ({ default: () => <div>Tab1</div> }));
vi.mock('./pages/Tab2', () => ({ default: () => <div>Tab2</div> }));
vi.mock('./pages/Tab3', () => ({ default: () => <div>Tab3</div> }));
vi.mock('./pages/Login/Login', () => ({ default: () => <div>Login</div> }));
vi.mock('./pages/Register/Register', () => ({ default: () => <div>Register</div> }));
vi.mock('./pages/Board/Board', () => ({ default: () => <div>Board</div> }));
vi.mock('./pages/pet-missing/PetMissing', () => ({ default: () => <div>PetMissing</div> }));
vi.mock('./pages/ReportsPanel/ReportsPanel', () => ({ default: () => <div>ReportsPanel</div> }));
vi.mock('./pages/Messages/Messages', () => ({ default: () => <div>Messages</div> }));
vi.mock('./pages/Messages/Conversation', () => ({ default: () => <div>Conversation</div> }));
vi.mock('./pages/PetsDetail/PetsDetail', () => ({ default: () => <div>PetsDetail</div> }));
vi.mock('./hooks/SharingLocation/MapToLookRealLocation', () => ({ LiveLocationViewer: () => <div>LiveLocationViewer</div> }));
vi.mock('./pages/Place/QuestionPlace', () => ({ default: () => <div>QuestionPlace</div> }));

describe('App component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const contextValue = {
      user: null,
      setUser: vi.fn(),
      logout: vi.fn(),
      pets: null,
      setPets: vi.fn(),
      selectedPet: null,
      setSelectedPet: vi.fn(),
      selectedConversation: null,
      setSelectedConversation: vi.fn(),
      fetchPets: vi.fn(),
      fetchConversationsByPet: vi.fn(),
      loadingPets: false,
      petsError: null,
      updateUser: vi.fn()
    } as any;

    const { baseElement } = render(
      <AuthContext.Provider value={contextValue}>
        <App />
      </AuthContext.Provider>
    );

    expect(baseElement).toBeDefined();
  });
});
