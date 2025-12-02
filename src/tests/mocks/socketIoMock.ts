import { vi } from 'vitest';

// Simple mock for socket.io-client used by tests
const listeners: Record<string, Function[]> = {};

const mockSocket = {
  on: (event: string, cb: Function) => {
    listeners[event] = listeners[event] || [];
    listeners[event].push(cb);
  },
  emit: vi.fn((event: string, payload?: any) => {
    (listeners[event] || []).forEach(cb => cb(payload));
  }),
  disconnect: vi.fn()
};

export const io = vi.fn(() => mockSocket as any);
export default io;
