'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
} from 'react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  type:
    | 'finding_submitted'
    | 'approval_required'
    | 'finding_approved'
    | 'finding_rejected'
    | 'deadline_reminder'
    | 'license_expiring_soon'
    | 'license_expired';
  title: string;
  message: string;
  findingId?: string | null;
  objekK3Id?: string | null;
  isRead: boolean;
  createdAt: string;
  finding?: {
    id: string;
    title: string;
    subElementId: string;
    findingStatus: string;
  } | null;
  objekK3?: {
    id: string;
    namaAlat: string;
    noSeri: string;
    tanggalBerlaku: string;
    statusRiksaUji: string;
  } | null;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  toasts: Toast[];

  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;

  addToast: (type: Toast['type'], message: string, duration?: number) => string;
  removeToast: (id: string) => void;

  showSuccess: (message: string, duration?: number) => string;
  showError: (message: string, duration?: number) => string;
  showInfo: (message: string, duration?: number) => string;
  showWarning: (message: string, duration?: number) => string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const POLL_INTERVAL_MS = 30_000; // 30 detik
const DEADLINE_INTERVAL_MS = 5 * 60_000; // 5 menit

// ── Helpers ───────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

/** Decode JWT payload tanpa verify signature */
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/** Cek apakah token sudah expired (dengan buffer 30 detik) */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now() + 30_000;
}

/**
 * Ambil token valid: coba localStorage dulu, lalu fallback ke NextAuth session.
 * Jika dapat token baru dari session, simpan ke localStorage agar polling
 * berikutnya tidak perlu hit /api/auth/token lagi.
 */
async function getValidToken(): Promise<string | null> {
  const stored = getToken();

  // ── Debug diagnostik ─────────────────────────────────────────────────────
  if (stored) {
    const payload = decodeJWT(stored);
    const expMs = payload?.exp ? payload.exp * 1000 : null;
    const expired = isTokenExpired(stored);
    console.debug(
      `[NotifCtx] getValidToken: stored token ada, exp=${expMs ? new Date(expMs).toISOString() : 'N/A'}, expired=${expired}, payload keys=${payload ? Object.keys(payload).join(',') : 'null'}`
    );
  } else {
    console.debug('[NotifCtx] getValidToken: tidak ada token di localStorage');
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (stored && !isTokenExpired(stored)) {
    return stored;
  }

  // Token expired atau tidak ada
  if (stored) {
    console.warn('[NotifCtx] getValidToken: token expired, perlu login ulang');
  } else {
    console.debug('[NotifCtx] getValidToken: tidak ada token sama sekali');
  }

  return null;
}

/**
 * Fetch notifikasi via Next.js proxy (/api/notifications).
 *
 * Proxy dipakai karena:
 * 1. Menghindari CORS — browser tidak boleh langsung fetch ke localhost:3001
 * 2. Proxy forward Authorization header dari client ke backend
 *
 * Saat proxy return 401: silent fail — TIDAK dispatch auth:unauthorized.
 * Notification endpoint gagal tidak cukup alasan untuk paksa logout user.
 */
async function fetchNotifications(): Promise<Notification[] | null> {
  const token = await getValidToken();
  if (!token) {
    console.debug('[NotifCtx] fetchNotifications: tidak ada token');
    return null;
  }

  try {
    const res = await fetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      console.debug(`[NotifCtx] fetchNotifications: ${Array.isArray(data) ? data.length : 'non-array'} notif`);
      return Array.isArray(data) ? data : null;
    }

    if (res.status === 401) {
      console.warn('[NotifCtx] fetchNotifications: 401, silent fail');
      return null;
    }

    console.warn(`[NotifCtx] fetchNotifications gagal (${res.status})`);
  } catch (err) {
    console.error('[NotifCtx] fetchNotifications error:', err);
  }

  return null;
}

/** Fetch ke backend langsung — untuk endpoint non-notifikasi (deadline reminders, dll) */
async function backendFetch<T>(endpoint: string): Promise<T | null> {
  const token = await getValidToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shownDeadlines = useRef<Set<string>>(new Set());
  // Persistent flag — local variable akan reset setiap pemanggilan checkAuth
  const isLoggedInRef = useRef(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ── Core fetch ───────────────────────────────────────────────────────────

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
        console.debug(`[NotifCtx] refreshNotifications: set ${data.length} notif`);
      } else {
        console.warn('[NotifCtx] refreshNotifications: data bukan array, tidak update state');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Deadline toast check ─────────────────────────────────────────────────

  const showWarningRef = useRef<(msg: string, duration?: number) => string>(
    () => ''
  );

  const checkDeadlines = useCallback(async () => {
    const reminders = await backendFetch<any[]>(
      '/smk3-data/deadline-reminders?daysAhead=3'
    );
    if (!reminders) return;

    for (const r of reminders) {
      if (shownDeadlines.current.has(r.id)) continue;
      shownDeadlines.current.add(r.id);

      if (r.isOverdue) {
        showWarningRef.current(
          `⚠️ DEADLINE LEWAT: "${r.title}" sudah melewati batas ${Math.abs(r.daysLeft)} hari lalu!`,
          8000
        );
      } else if (r.isSoon) {
        showWarningRef.current(
          `🕐 DEADLINE MENDEKAT: "${r.title}" — sisa ${r.daysLeft} hari.`,
          6000
        );
      }
    }
  }, []);

  // ── Polling: mulai/stop berdasarkan ada tidaknya token ──────────────────
  // Cek ketersediaan auth setiap 5 detik.
  // isLoggedInRef dipakai agar flag tidak reset setiap kali checkAuth dipanggil.

  useEffect(() => {
    const startPolling = () => {
      if (pollingRef.current) return;

      refreshNotifications();
      pollingRef.current = setInterval(refreshNotifications, POLL_INTERVAL_MS);

      setTimeout(() => {
        checkDeadlines();
        deadlineRef.current = setInterval(checkDeadlines, DEADLINE_INTERVAL_MS);
      }, 5000);
    };

    const stopPolling = () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (deadlineRef.current) {
        clearInterval(deadlineRef.current);
        deadlineRef.current = null;
      }
    };

    // Handler untuk auth:unauthorized — dipanggil saat token tidak valid
    // (dari fetchNotifications atau dari api.ts pada endpoint lain)
    const handleUnauthorized = () => {
      if (isLoggedInRef.current) {
        console.debug('[NotifCtx] auth:unauthorized — stop polling, clear notifications');
        isLoggedInRef.current = false;
        stopPolling();
        setNotifications([]);
        shownDeadlines.current.clear();
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const checkAuth = () => {
      const token = getToken();
      if (token) {
        // Ada token di localStorage — anggap logged in, mulai polling jika belum
        if (!isLoggedInRef.current) {
          isLoggedInRef.current = true;
          startPolling();
        }
        return;
      }

      // Tidak ada token — stop polling jika sedang berjalan
      if (isLoggedInRef.current) {
        isLoggedInRef.current = false;
        stopPolling();
        setNotifications([]);
        shownDeadlines.current.clear();
      }
    };

    // Cek segera saat mount
    checkAuth();

    // Watch setiap 5 detik
    const watcher = setInterval(checkAuth, 5000);

    return () => {
      clearInterval(watcher);
      stopPolling();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [refreshNotifications, checkDeadlines]);

  // ── Notification state methods ────────────────────────────────────────────

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Toast methods ─────────────────────────────────────────────────────────

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: Toast['type'], message: string, duration = 4000): string => {
      const id = Math.random().toString(36).substr(2, 9);
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
      return id;
    },
    []
  );

  const showSuccess = useCallback(
    (msg: string, duration?: number) => addToast('success', msg, duration),
    [addToast]
  );
  const showError = useCallback(
    (msg: string, duration?: number) => addToast('error', msg, duration ?? 5000),
    [addToast]
  );
  const showInfo = useCallback(
    (msg: string, duration?: number) => addToast('info', msg, duration),
    [addToast]
  );
  const showWarning = useCallback(
    (msg: string, duration?: number) => addToast('warning', msg, duration ?? 5000),
    [addToast]
  );

  // Sync showWarning ke ref agar checkDeadlines bisa pakai versi terbaru
  useEffect(() => {
    showWarningRef.current = showWarning;
  }, [showWarning]);

  // ── Value ─────────────────────────────────────────────────────────────────

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    toasts,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refreshNotifications,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
