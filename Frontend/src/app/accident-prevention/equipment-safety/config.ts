/**
 * Equipment Safety page config.
 *
 * NOTE: This page uses a fully custom implementation (page.tsx)
 * instead of the generic CrudPage component.
 *
 * The feature is now "Manajemen Objek K3" — managing K3 equipment assets
 * that require periodic inspection (riksa uji) and certifications.
 */
export const config = {
  categoryId: 'ap-equipment-safety',
  title: 'Manajemen Objek K3',
  description:
    'Kelola aset K3 wajib sertifikasi: pesawat uap, alat angkat, instalasi listrik, dan lainnya. ' +
    'Pantau riksa uji berkala, dokumen kelayakan, dan riwayat pemeriksaan.',
  parentLabel: 'Accident Prevention',
  parentPath: '/accident-prevention',
};
