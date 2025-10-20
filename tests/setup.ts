/**
 * Test Setup
 * Global test configuration and mocks
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
vi.mock('@/config', () => ({
  env: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_APP_NAME: 'TourCompanion',
    VITE_APP_VERSION: '1.0.0',
    VITE_APP_ENVIRONMENT: 'test',
    VITE_ENABLE_ANALYTICS: false,
    VITE_ENABLE_DEBUG: false,
    VITE_ENABLE_PWA: false,
    VITE_API_TIMEOUT: 30000,
    VITE_MAX_FILE_SIZE: 10485760,
    VITE_DEV_SERVER_PORT: 5173,
    VITE_DEV_SERVER_HOST: 'localhost',
  },
  isDevelopment: false,
  isProduction: false,
  isStaging: false,
  features: {
    analytics: false,
    debug: false,
    pwa: false,
  },
  apiConfig: {
    timeout: 30000,
    maxFileSize: 10485760,
  },
  devConfig: {
    serverPort: 5173,
    serverHost: 'localhost',
  },
  ERROR_MESSAGES: {
    network: 'Network error',
    unauthorized: 'Unauthorized',
    forbidden: 'Forbidden',
    notFound: 'Not found',
    serverError: 'Server error',
    validation: 'Validation error',
    fileUpload: 'File upload failed',
    auth: 'Authentication failed',
    timeout: 'Request timeout',
    unknown: 'Unknown error',
  },
  SUCCESS_MESSAGES: {
    saved: 'Saved successfully',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    uploaded: 'Uploaded successfully',
    signedIn: 'Signed in successfully',
    signedOut: 'Signed out successfully',
    emailSent: 'Email sent successfully',
  },
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      getUser: vi.fn(),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      order: vi.fn().mockReturnThis(),
    })),
    rpc: vi.fn(),
  },
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock TanStack Query
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
  QueryClient: vi.fn(),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  },
  writable: true,
});

// Mock console methods in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

