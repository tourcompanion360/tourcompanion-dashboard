/**
 * Configuration Tests
 * Test environment configuration and constants
 */

import { describe, it, expect, vi } from 'vitest';
import { env, config, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/config';

describe('Configuration', () => {
  describe('Environment Variables', () => {
    it('should have required environment variables', () => {
      expect(env.VITE_SUPABASE_URL).toBeDefined();
      expect(env.VITE_SUPABASE_ANON_KEY).toBeDefined();
      expect(env.VITE_APP_NAME).toBeDefined();
      expect(env.VITE_APP_VERSION).toBeDefined();
    });

    it('should have correct app information', () => {
      expect(env.VITE_APP_NAME).toBe('TourCompanion');
      expect(env.VITE_APP_VERSION).toBe('1.0.0');
    });

    it('should have feature flags', () => {
      expect(typeof env.VITE_ENABLE_ANALYTICS).toBe('boolean');
      expect(typeof env.VITE_ENABLE_DEBUG).toBe('boolean');
      expect(typeof env.VITE_ENABLE_PWA).toBe('boolean');
    });
  });

  describe('Configuration Object', () => {
    it('should have all required configuration sections', () => {
      expect(config.app).toBeDefined();
      expect(config.api).toBeDefined();
      expect(config.database).toBeDefined();
      expect(config.auth).toBeDefined();
      expect(config.ui).toBeDefined();
      expect(config.features).toBeDefined();
      expect(config.routes).toBeDefined();
      expect(config.storage).toBeDefined();
      expect(config.errors).toBeDefined();
      expect(config.success).toBeDefined();
    });

    it('should have correct app configuration', () => {
      expect(config.app.name).toBe('TourCompanion');
      expect(config.app.version).toBe('1.0.0');
      expect(typeof config.app.isDevelopment).toBe('boolean');
      expect(typeof config.app.isProduction).toBe('boolean');
    });
  });

  describe('Error Messages', () => {
    it('should have all required error messages', () => {
      expect(ERROR_MESSAGES.network).toBeDefined();
      expect(ERROR_MESSAGES.unauthorized).toBeDefined();
      expect(ERROR_MESSAGES.forbidden).toBeDefined();
      expect(ERROR_MESSAGES.notFound).toBeDefined();
      expect(ERROR_MESSAGES.serverError).toBeDefined();
      expect(ERROR_MESSAGES.validation).toBeDefined();
      expect(ERROR_MESSAGES.auth).toBeDefined();
      expect(ERROR_MESSAGES.unknown).toBeDefined();
    });

    it('should have non-empty error messages', () => {
      Object.values(ERROR_MESSAGES).forEach(message => {
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      });
    });
  });

  describe('Success Messages', () => {
    it('should have all required success messages', () => {
      expect(SUCCESS_MESSAGES.saved).toBeDefined();
      expect(SUCCESS_MESSAGES.created).toBeDefined();
      expect(SUCCESS_MESSAGES.updated).toBeDefined();
      expect(SUCCESS_MESSAGES.deleted).toBeDefined();
      expect(SUCCESS_MESSAGES.uploaded).toBeDefined();
      expect(SUCCESS_MESSAGES.signedIn).toBeDefined();
      expect(SUCCESS_MESSAGES.signedOut).toBeDefined();
    });

    it('should have non-empty success messages', () => {
      Object.values(SUCCESS_MESSAGES).forEach(message => {
        expect(message).toBeTruthy();
        expect(typeof message).toBe('string');
      });
    });
  });
});

