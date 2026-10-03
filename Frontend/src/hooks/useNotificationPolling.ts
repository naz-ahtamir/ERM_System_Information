// Deprecated: logika polling notifikasi dan deadline sudah dipindahkan
// sepenuhnya ke NotificationContext (src/contexts/NotificationContext.tsx).
// File ini dipertahankan agar tidak ada import error, tapi hook di dalamnya
// sudah tidak melakukan apa-apa.

export function useNotificationPolling(_intervalMs?: number) {
  // no-op — semua polling sekarang dihandle oleh NotificationProvider
}
