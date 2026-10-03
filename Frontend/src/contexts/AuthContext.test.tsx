/**
 * Authentication Context Tests
 * Validates user state management, login/logout functions, and token handling
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as apiModule from '@/lib/api';

// Mock the API module
jest.mock('@/lib/api');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/test',
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    it('should initialize with null user and isLoading=false when no token exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should initialize user from valid stored token', async () => {
      // Mock a valid JWT token
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtaWQiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicm9sZSI6InVzZXIiLCJkZXBhcnRtZW50IjoiVGVzdCBEZXB0In0.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';
      localStorage.setItem('smk3_token', mockToken);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).not.toBeNull();
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.user?.name).toBe('Test User');
      expect(result.current.user?.role).toBe('user');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear invalid token on initialization', async () => {
      localStorage.setItem('smk3_token', 'invalid.token.format');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('smk3_token')).toBeNull();
    });

    it('should handle login successfully', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'supervisor' as const,
          department: 'Safety',
        },
        token: 'mock-jwt-token',
      };

      (apiModule.authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      (apiModule.storeToken as jest.Mock).mockImplementation((token: string) => {
        localStorage.setItem('smk3_token', token);
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockResponse.user);
      expect(result.current.isAuthenticated).toBe(true);
      expect(apiModule.storeToken).toHaveBeenCalledWith(mockResponse.token);
    });

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials');
      (apiModule.authApi.login as jest.Mock).mockRejectedValue(mockError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong-password');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle logout successfully', async () => {
      // First, set a logged-in state
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'user' as const,
        },
        token: 'mock-jwt-token',
      };

      (apiModule.authApi.login as jest.Mock).mockResolvedValue(mockResponse);
      (apiModule.storeToken as jest.Mock).mockImplementation((token: string) => {
        localStorage.setItem('smk3_token', token);
      });
      (apiModule.clearToken as jest.Mock).mockImplementation(() => {
        localStorage.removeItem('smk3_token');
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(apiModule.clearToken).toHaveBeenCalled();
    });

    it('should set user manually', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const testUser = {
        id: 'user-456',
        email: 'manual@example.com',
        name: 'Manual User',
        role: 'admin' as const,
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.user).toEqual(testUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user when setUser is called with null', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const testUser = {
        id: 'user-456',
        email: 'manual@example.com',
        name: 'Manual User',
        role: 'admin' as const,
      };

      act(() => {
        result.current.setUser(testUser);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
