/**
 * Error Handler Tests
 * Test error handling functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler, AppError, ErrorType, ErrorSeverity, handleError } from '@/utils/errorHandler';

describe('Error Handler', () => {
  beforeEach(() => {
    // Clear error log before each test
    errorHandler.clearErrorLog();
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('AppError', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError(
        'Test error',
        ErrorType.NETWORK,
        ErrorSeverity.HIGH,
        'TEST_CODE',
        { test: 'data' },
        'User friendly message'
      );

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.code).toBe('TEST_CODE');
      expect(error.details).toEqual({ test: 'data' });
      expect(error.userMessage).toBe('User friendly message');
      expect(error.name).toBe('AppError');
    });

    it('should create AppError with default values', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.type).toBe(ErrorType.UNKNOWN);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
      expect(error.userMessage).toBeUndefined();
    });
  });

  describe('Error Handler', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
    });

    it('should handle string errors', () => {
      const error = 'Test error string';
      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error string');
    });

    it('should handle unknown error types', () => {
      const error = { some: 'object' };
      const result = errorHandler.handleError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('should determine error type correctly', () => {
      const networkError = new Error('Network request failed');
      const authError = new Error('Authentication failed');
      const validationError = new Error('Validation error');

      const networkResult = errorHandler.handleError(networkError);
      const authResult = errorHandler.handleError(authError);
      const validationResult = errorHandler.handleError(validationError);

      expect(networkResult.type).toBe(ErrorType.NETWORK);
      expect(authResult.type).toBe(ErrorType.AUTHENTICATION);
      expect(validationResult.type).toBe(ErrorType.VALIDATION);
    });

    it('should determine error severity correctly', () => {
      const criticalError = new Error('Critical system failure');
      const authError = new Error('Authentication failed');
      const networkError = new Error('Network timeout');

      const criticalResult = errorHandler.handleError(criticalError);
      const authResult = errorHandler.handleError(authError);
      const networkResult = errorHandler.handleError(networkError);

      expect(criticalResult.severity).toBe(ErrorSeverity.CRITICAL);
      expect(authResult.severity).toBe(ErrorSeverity.HIGH);
      expect(networkResult.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should enrich error context', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
        userId: 'test-user-id',
      };

      const result = errorHandler.handleError(error, context);

      expect(result).toBeInstanceOf(AppError);
    });

    it('should log errors', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);

      expect(console.error).toHaveBeenCalled();
    });

    it('should maintain error log', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      errorHandler.handleError(error1);
      errorHandler.handleError(error2);

      const log = errorHandler.getErrorLog();
      expect(log).toHaveLength(2);
    });

    it('should clear error log', () => {
      const error = new Error('Test error');
      errorHandler.handleError(error);

      expect(errorHandler.getErrorLog()).toHaveLength(1);

      errorHandler.clearErrorLog();
      expect(errorHandler.getErrorLog()).toHaveLength(0);
    });
  });

  describe('Convenience Functions', () => {
    it('should handle error with convenience function', () => {
      const error = new Error('Test error');
      const result = handleError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
    });
  });
});

