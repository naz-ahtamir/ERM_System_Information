'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationContext';

interface Notification {
  id: string;
  type: string;
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
  } | null;
}

// Map subElementId → URL halaman asal
const SUB_ELEMENT_URL: Record<string, string> = {
  'ap-safety-inspection-non-conformity':  '/accident-prevention/safety-inspection/non-conformity',
  'ap-safety-inspection-general':         '/accident-prevention/safety-inspection/general-workplace',
  'ap-safety-inspection-electrical':      '/accident-prevention/safety-inspection/electrical-safety',
  'ap-safety-inspection-fire':            '/accident-prevention/safety-inspection/fire-safety',
  'ap-safety-inspection-heavy-equipment': '/accident-prevention/safety-inspection/heavy-equipment',
  'ap-incident':                          '/accident-prevention/incident-near-miss',
  'ap-equipment-safety':                  '/accident-prevention/equipment-safety',
  'ap-hazard-identification':             '/accident-prevention/hazard-identification',
  'ap-risk-control':                      '/accident-prevention/risk-control',
  'ap-emergency':                         '/accident-prevention/emergency-preparedness',
  'ap-emergency-drill':                   '/accident-prevention/emergency-preparedness/emergency-drill',
  'ap-loto':                              '/accident-prevention/loto',
  'ap-ppe-management':                    '/accident-prevention/ppe-management',
  'ap-work-permit':                       '/accident-prevention/work-permit',
  'ap-safety-observation':                '/accident-prevention/safety-observation',
  'ap-chemical-safety':                   '/accident-prevention/chemical-safety',
  'ap-workplace-monitoring':              '/accident-prevention/workplace-monitoring',
  'scomp-license':                        '/safety-competency/license-certification',
  'scomp-induction':                      '/safety-competency/safety-induction',
  'scomp-safety-training':                '/safety-competency/safety-training',
  'scomp-training-mgmt':                  '/safety-competency/training-management',
  'scomp-tna':                            '/safety-competency/training-needs-analysis',
  'scomp-safety-briefing':                '/safety-competency/safety-briefing',
  'scomp-safety-culture':                 '/safety-competency/safety-culture',
  'scomp-refreshment':                    '/safety-competency/refreshment-training',
  'scomp-competency-mgmt':                '/safety-competency/competency-management',
  'scomp-job-competency':                 '/safety-competency/job-competency',
  'sc-k3-policy':                         '/safety-compliance/k3-policy',
  'sc-master-list-documents':             '/safety-compliance/documentation-records/master-list-documents',
  'sc-safety-activities':                 '/safety-compliance/documentation-records/safety-activities',
  'sc-legal-compliance':                  '/safety-compliance/legal-compliance',
  'sc-k3-planning':                       '/safety-compliance/k3-planning',
  'sc-org-responsibility':                '/safety-compliance/organization-responsibility',
  'sc-procurement':                       '/safety-compliance/procurement-contractor',
  'sc-worker-consultation':               '/safety-compliance/worker-consultation',
  'sc-occupational-health':               '/safety-compliance/occupational-health',
  'sc-design-change':                     '/safety-compliance/design-change-management',
  'sc-documentation':                     '/safety-compliance/documentation-records',
};

function getNotificationUrl(notification: Notification): string {
  const { findingId, finding, objekK3Id } = notification;
  // ObjekK3 notifikasi → equipment-safety dengan ?id=
  if (objekK3Id) {
    return `/accident-prevention/equipment-safety?id=${objekK3Id}`;
  }
  // Finding notifikasi → halaman asal berdasarkan subElementId
  if (!findingId) return '/notifications';
  const subElementId = finding?.subElementId;
  const basePath = subElementId ? (SUB_ELEMENT_URL[subElementId] ?? '/notifications') : '/notifications';
  return `${basePath}?id=${findingId}`;
}

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
}

/** Ambil token dari localStorage secara aman */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'finding_submitted':
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
        </div>
      );

    case 'approval_required':
      return (
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      );

    case 'finding_approved':
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );

    case 'finding_rejected':
      return (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );

    case 'deadline_reminder':
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      );

    case 'license_expiring_soon':
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );

    case 'license_expired':
      return (
        <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );

    default:
      return (
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      );
  }
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'baru saja';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
  if (diffInSeconds < 86400 * 2) return 'kemarin';
  if (diffInSeconds < 86400 * 7) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

export function NotificationDropdown({
  notifications,
  unreadCount,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { markAsRead, markAllAsRead, refreshNotifications } = useNotifications();

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh notifikasi setiap kali dropdown dibuka
  useEffect(() => {
    if (isOpen) refreshNotifications();
  }, [isOpen, refreshNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        const token = getToken();
        const response = await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (response.ok) {
          markAsRead(notification.id);
        }
      } catch {
        // Optimistic update meski request gagal
        markAsRead(notification.id);
      }
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = getToken();
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (response.ok) markAllAsRead();
    } catch {
      markAllAsRead();
    }
  };

  // Tampilkan maksimal 5 di dropdown
  const displayed = notifications.slice(0, 5);

  return (
    <div ref={dropdownRef} className="relative">
      {/* ── Bell Icon Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
        className="relative p-2 text-[#a09a96] hover:text-[#f15a22] focus:outline-none focus:ring-2 focus:ring-[#f15a22] rounded-full transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge unread count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifikasi</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-[#f15a22] text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-[#f15a22] hover:text-[#d14a12] font-medium transition-colors"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {displayed.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-700">Tidak ada notifikasi</p>
                <p className="text-xs text-gray-400 mt-1">Notifikasi baru akan muncul di sini</p>
              </div>
            ) : (
              displayed.map((notification) => (
                <Link
                  key={notification.id}
                  href={getNotificationUrl(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50 hover:bg-blue-50/80' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${
                        !notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[11px] text-gray-400">{getRelativeTime(notification.createdAt)}</p>
                        {/* Label tipe notifikasi */}
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                          notification.type === 'license_expired'
                            ? 'bg-red-100 text-red-700'
                            : notification.type === 'license_expiring_soon'
                            ? 'bg-amber-100 text-amber-700'
                            : notification.type === 'approval_required' || notification.type === 'finding_submitted'
                            ? 'bg-orange-100 text-orange-700'
                            : notification.type === 'deadline_reminder'
                            ? 'bg-yellow-100 text-yellow-700'
                            : notification.type === 'finding_approved'
                            ? 'bg-green-100 text-green-700'
                            : notification.type === 'finding_rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {notification.type === 'finding_submitted' && '→ Review'}
                          {notification.type === 'approval_required' && '→ Approval'}
                          {notification.type === 'finding_approved' && '→ Finding'}
                          {notification.type === 'finding_rejected' && '→ Finding'}
                          {notification.type === 'deadline_reminder' && '→ Finding'}
                          {notification.type === 'license_expiring_soon' && '→ Objek K3'}
                          {notification.type === 'license_expired' && '→ Objek K3'}
                        </span>
                      </div>
                    </div>

                    {/* Titik biru untuk unread */}
                    {!notification.isRead && (
                      <span className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-[#f15a22] hover:text-[#d14a12] font-medium transition-colors"
            >
              Lihat semua notifikasi
              {notifications.length > 5 && (
                <span className="text-gray-400 font-normal"> ({notifications.length - 5} lainnya)</span>
              )}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
