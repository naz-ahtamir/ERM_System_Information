'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useNotifications } from '@/contexts/NotificationContext';

type FilterType = 'all' | 'unread' | 'read';
type NotifType = 'all' | 'finding_submitted' | 'approval_required' | 'finding_approved' | 'finding_rejected' | 'license_expiring_soon' | 'license_expired';

// Map subElementId → URL halaman asal finding
const SUB_ELEMENT_URL: Record<string, string> = {
  // Accident Prevention
  'ap-safety-inspection-non-conformity': '/accident-prevention/safety-inspection/non-conformity',
  'ap-safety-inspection-general':        '/accident-prevention/safety-inspection/general-workplace',
  'ap-safety-inspection-electrical':     '/accident-prevention/safety-inspection/electrical-safety',
  'ap-safety-inspection-fire':           '/accident-prevention/safety-inspection/fire-safety',
  'ap-safety-inspection-heavy-equipment':'/accident-prevention/safety-inspection/heavy-equipment',
  'ap-incident':                         '/accident-prevention/incident-near-miss',
  'ap-equipment-safety':                 '/accident-prevention/equipment-safety',
  'ap-hazard-identification':            '/accident-prevention/hazard-identification',
  'ap-risk-control':                     '/accident-prevention/risk-control',
  'ap-emergency':                        '/accident-prevention/emergency-preparedness',
  'ap-emergency-drill':                  '/accident-prevention/emergency-preparedness/emergency-drill',
  'ap-loto':                             '/accident-prevention/loto',
  'ap-ppe-management':                   '/accident-prevention/ppe-management',
  'ap-work-permit':                      '/accident-prevention/work-permit',
  'ap-safety-observation':               '/accident-prevention/safety-observation',
  'ap-chemical-safety':                  '/accident-prevention/chemical-safety',
  'ap-workplace-monitoring':             '/accident-prevention/workplace-monitoring',
  // Safety Competency
  'scomp-license':                       '/safety-competency/license-certification',
  'scomp-induction':                     '/safety-competency/safety-induction',
  'scomp-safety-training':               '/safety-competency/safety-training',
  'scomp-training-mgmt':                 '/safety-competency/training-management',
  'scomp-tna':                           '/safety-competency/training-needs-analysis',
  'scomp-safety-briefing':               '/safety-competency/safety-briefing',
  'scomp-safety-culture':                '/safety-competency/safety-culture',
  'scomp-refreshment':                   '/safety-competency/refreshment-training',
  'scomp-competency-mgmt':               '/safety-competency/competency-management',
  'scomp-job-competency':                '/safety-competency/job-competency',
  // Safety Compliance
  'sc-k3-policy':                        '/safety-compliance/k3-policy',
  'sc-master-list-documents':            '/safety-compliance/documentation-records/master-list-documents',
  'sc-safety-activities':                '/safety-compliance/documentation-records/safety-activities',
  'sc-legal-compliance':                 '/safety-compliance/legal-compliance',
  'sc-k3-planning':                      '/safety-compliance/k3-planning',
  'sc-org-responsibility':               '/safety-compliance/organization-responsibility',
  'sc-procurement':                      '/safety-compliance/procurement-contractor',
  'sc-worker-consultation':              '/safety-compliance/worker-consultation',
  'sc-occupational-health':              '/safety-compliance/occupational-health',
  'sc-design-change':                    '/safety-compliance/design-change-management',
  'sc-documentation':                    '/safety-compliance/documentation-records',
};

function getFindingUrl(notification: { findingId?: string | null; objekK3Id?: string | null; finding?: { subElementId?: string } | null }): string {
  // ObjekK3 → equipment-safety dengan ?id=
  if (notification.objekK3Id) {
    return `/accident-prevention/equipment-safety?id=${notification.objekK3Id}`;
  }
  if (!notification.findingId) return '#';
  const subElementId = notification.finding?.subElementId;
  const basePath = subElementId ? (SUB_ELEMENT_URL[subElementId] ?? '/findings') : '/findings';
  return `${basePath}?id=${notification.findingId}`;
}

const TYPE_LABELS: Record<string, string> = {
  finding_submitted: 'Temuan Baru',
  approval_required: 'Perlu Persetujuan',
  finding_approved: 'Disetujui',
  finding_rejected: 'Ditolak',
  deadline_reminder: 'Deadline',
  license_expiring_soon: 'Lisensi Segera Habis',
  license_expired: 'Lisensi Kedaluwarsa',
};

const TYPE_COLORS: Record<string, string> = {
  finding_submitted: 'bg-blue-100 text-blue-700',
  approval_required: 'bg-orange-100 text-orange-700',
  finding_approved: 'bg-green-100 text-green-700',
  finding_rejected: 'bg-red-100 text-red-700',
  deadline_reminder: 'bg-yellow-100 text-yellow-800',
  license_expiring_soon: 'bg-amber-100 text-amber-700',
  license_expired: 'bg-red-100 text-red-800',
};

function getNotificationIcon(type: string) {
  switch (type) {
    case 'approval_required':
      return (
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'finding_approved':
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'finding_rejected':
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'finding_submitted':
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        </div>
      );
    case 'deadline_reminder':
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'license_expiring_soon':
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    case 'license_expired':
      return (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-red-700" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('smk3_token');
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const [filterRead, setFilterRead] = useState<FilterType>('all');
  const [filterType, setFilterType] = useState<NotifType>('all');

  // ── Filter notifikasi ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const readMatch =
        filterRead === 'all' ||
        (filterRead === 'unread' && !n.isRead) ||
        (filterRead === 'read' && n.isRead);

      const typeMatch = filterType === 'all' || n.type === filterType;

      return readMatch && typeMatch;
    });
  }, [notifications, filterRead, filterType]);

  const handleNotificationClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      try {
        const token = getToken();
        const res = await fetch(`/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) markAsRead(id);
      } catch {
        markAsRead(id);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) markAllAsRead();
    } catch {
      markAllAsRead();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifikasi</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : 'Semua notifikasi sudah dibaca'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={refreshNotifications}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh notifikasi"
          >
            <svg
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {/* Tandai semua dibaca */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-3 py-1.5 text-sm text-[#f15a22] border border-[#f15a22] rounded-lg hover:bg-[#f15a22] hover:text-white transition-colors font-medium"
            >
              Tandai semua dibaca
            </button>
          )}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Filter baca/belum */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          {(['all', 'unread', 'read'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilterRead(f)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filterRead === f
                  ? 'bg-[#f15a22] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'unread' ? 'Belum dibaca' : 'Sudah dibaca'}
            </button>
          ))}
        </div>

        {/* Filter type */}
        <div className="flex flex-wrap rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua Tipe
          </button>
          {(
            [
              'finding_submitted',
              'approval_required',
              'finding_approved',
              'finding_rejected',
              'license_expiring_soon',
              'license_expired',
            ] as NotifType[]
          ).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filterType === t
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {notifications.length > 0 && (
        <p className="text-xs text-gray-400 mb-3">
          Menampilkan {filtered.length} dari {notifications.length} notifikasi
        </p>
      )}

      {/* ── Notifications List ── */}
      <div className="space-y-2">
        {isLoading && notifications.length === 0 ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-700">
              {filterRead !== 'all' || filterType !== 'all'
                ? 'Tidak ada notifikasi yang sesuai filter'
                : 'Belum ada notifikasi'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filterRead !== 'all' || filterType !== 'all'
                ? 'Coba ubah filter untuk melihat notifikasi lainnya'
                : 'Notifikasi baru akan muncul di sini'}
            </p>
            {(filterRead !== 'all' || filterType !== 'all') && (
              <button
                onClick={() => { setFilterRead('all'); setFilterType('all'); }}
                className="mt-3 text-sm text-[#f15a22] hover:underline"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          filtered.map((notification) => (
            <Link
              key={notification.id}
              href={getFindingUrl(notification)}
              onClick={() =>
                handleNotificationClick(notification.id, notification.isRead)
              }
              className={`block bg-white rounded-xl p-4 hover:shadow-md transition-all border ${
                !notification.isRead
                  ? 'border-blue-100 bg-blue-50/40 hover:bg-blue-50/60'
                  : 'border-transparent hover:border-gray-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm leading-tight ${
                        !notification.isRead
                          ? 'font-semibold text-gray-900'
                          : 'font-medium text-gray-700'
                      }`}
                    >
                      {notification.title}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        TYPE_COLORS[notification.type] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {TYPE_LABELS[notification.type] || notification.type}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {notification.message}
                  </p>

                  <p className="text-xs text-gray-400 mt-1.5">
                    {getRelativeTime(notification.createdAt)}
                  </p>
                </div>

                {/* Titik biru untuk unread */}
                {!notification.isRead && (
                  <span className="flex-shrink-0 mt-2 w-2.5 h-2.5 rounded-full bg-blue-500" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
