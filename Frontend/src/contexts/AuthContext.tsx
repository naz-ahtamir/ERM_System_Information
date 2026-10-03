'use client';

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { authApi, storeToken, getStoredToken, clearToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export interface User {
  id: string;
  idKaryawan: string;
  nama: string;
  role: 'admin' | 'supervisor' | 'user';
  departemen?: string;
  email?: string; // Optional, karena backend tidak pakai email
  name?: string;  // Alias untuk nama
  department?: string; // Alias untuk departemen
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (idKaryawan: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decodes JWT token payload
 * JWT format: header.payload.signature
 */
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  // Convert exp (seconds) to milliseconds and compare with current time
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from stored token
  useEffect(() => {
    const initializeAuth = () => {
      const token = getStoredToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        clearToken();
        setIsLoading(false);
        return;
      }

      // Decode and set user from token
      try {
        const decoded = decodeJWT(token);
        if (decoded) {
          setUser({
            id: decoded.id || decoded.sub,
            idKaryawan: decoded.idKaryawan,
            nama: decoded.nama,
            name: decoded.nama, // Alias for compatibility
            email: decoded.email || `${decoded.idKaryawan}@smk3.local`, // Fallback email
            role: decoded.role,
            departemen: decoded.departemen,
            department: decoded.departemen, // Alias for compatibility
          });
        } else {
          clearToken();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        clearToken();
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Listen for auth:unauthorized event dispatched by:
  // - api.ts handleUnauthorized() saat endpoint data return 401
  // - NotificationContext fetchNotifications() saat notification endpoint return 401
  useEffect(() => {
    const handleUnauthorizedEvent = () => {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = path === '/login' || path === '/';

      // Jangan proses jika sudah di halaman login — cegah redirect loop
      if (isAuthPage) {
        console.debug('[AuthContext] auth:unauthorized diabaikan — sudah di halaman auth');
        return;
      }

      console.warn('[AuthContext] auth:unauthorized event diterima, logout user');
      // Clear token (idempotent — aman dipanggil meski sudah di-clear sebelumnya)
      clearToken();
      // Clear user state
      setUser(null);
      // Tampilkan toast notifikasi sesi habis
      toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
        id: 'session-expired', // Deduplicate: cegah toast muncul berkali-kali
        duration: 4000,
        icon: '🔒',
      });
      // Redirect ke login setelah delay agar toast sempat muncul
      setTimeout(() => { router.push('/login'); }, 1500);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorizedEvent);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorizedEvent);
    };
  }, [router]);

  const login = useCallback(async (idKaryawan: string, password: string) => {
    console.log('🔵 AuthContext.login() START');
    setIsLoading(true);
    try {
      const response = await authApi.login(idKaryawan, password);
      console.log('🔵 AuthContext: API response received:', { userId: response.user.id, role: response.user.role });
      console.log('🔵 AuthContext: token type:', typeof response.token, '| token value (first 30 chars):', String(response.token).substring(0, 30));
      
      // Guard: pastikan token ada dan bukan string "undefined"
      if (!response.token || response.token === 'undefined') {
        console.error('❌ AuthContext: token tidak valid dari backend:', response);
        throw new Error('Token tidak diterima dari server');
      }
      
      storeToken(response.token);
      console.log('🔵 AuthContext: Token stored, verify from storage:', getStoredToken()?.substring(0, 30));
      
      // Map backend user to frontend User interface
      const mappedUser: User = {
        id: response.user.id,
        idKaryawan: response.user.idKaryawan,
        nama: response.user.nama,
        name: response.user.nama, // Alias
        role: response.user.role,
        departemen: response.user.departemen,
        department: response.user.departemen, // Alias
        email: response.user.email || `${response.user.idKaryawan}@smk3.local`, // Fallback
      };
      
      console.log('🔵 AuthContext: About to setUser()');
      setUser(mappedUser);
      
      // Set loading false AFTER user is set
      setIsLoading(false);
      
      console.log('✅ Login successful - user and isLoading updated');
    } catch (error) {
      console.error('❌ Login failed:', error);
      setIsLoading(false);
      throw error; // Re-throw untuk di-catch di login page
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // Call logout API
      await authApi.logout();
      // Clear local state
      setUser(null);
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state and redirect
      setUser(null);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
