'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotifications } from '@/contexts/NotificationContext';

interface SidebarProps {
  user?: {
    name: string;
    role: string;
    email: string;
  } | null;
  onLogout?: () => void;
}

/** Level 3: sub-sub-menu — selalu punya href (ada page-nya) */
interface SubSubItem {
  label: string;
  href: string;
}

/** Level 2: submenu — bisa punya href (link) atau children */
interface SubItem {
  label: string;
  href?: string;
  /** children bisa berupa SubSubItem[] (2-level) atau SubItem[] (3-level: sub-elemen punya sub-sub-elemen) */
  children?: SubSubItem[] | SubItem[];
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ReactNode;
  subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: 'safety-compliance',
    label: 'Safety Compliance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    subItems: [
      { label: 'K3 Policy', href: '/safety-compliance/k3-policy' },
      { label: 'Organization & Responsibility', href: '/safety-compliance/organization-responsibility' },
      { label: 'Worker Consultation (P2K3)', href: '/safety-compliance/worker-consultation' },
      { label: 'K3 Planning & Risk Assessment', href: '/safety-compliance/k3-planning' },
      {
        label: 'Documentation & Records',
        children: [
          { label: 'Master List Documents', href: '/safety-compliance/documentation-records/master-list-documents' },
          { label: 'Safety Activities', href: '/safety-compliance/documentation-records/safety-activities' },
        ],
      },
      { label: 'Legal Compliance', href: '/safety-compliance/legal-compliance' },
      { label: 'Design & Change Management', href: '/safety-compliance/design-change-management' },
      { label: 'Procurement & Contractor Control', href: '/safety-compliance/procurement-contractor' },
      { label: 'Occupational Health Management', href: '/safety-compliance/occupational-health' },
    ],
  },
  {
    id: 'accident-prevention',
    label: 'Accident Prevention',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    subItems: [
      { label: 'Hazard Identification', href: '/accident-prevention/hazard-identification' },
      { label: 'Risk Control Implementation', href: '/accident-prevention/risk-control' },
      { label: 'Work Permit System', href: '/accident-prevention/work-permit' },
      { label: 'PPE Management', href: '/accident-prevention/ppe-management' },
      {
        label: 'Safety Inspection',
        children: [
          { label: 'Non-Conformity', href: '/accident-prevention/safety-inspection/non-conformity' },
          { label: 'Heavy Equipment', href: '/accident-prevention/safety-inspection/heavy-equipment' },
          { label: 'Electrical Safety', href: '/accident-prevention/safety-inspection/electrical-safety' },
          { label: 'Fire Safety', href: '/accident-prevention/safety-inspection/fire-safety' },
          { label: 'General Workplace', href: '/accident-prevention/safety-inspection/general-workplace' },
        ],
      },
      { label: 'Safety Observation', href: '/accident-prevention/safety-observation' },
      { label: 'Workplace Monitoring', href: '/accident-prevention/workplace-monitoring' },
      { label: 'Equipment Safety', href: '/accident-prevention/equipment-safety' },
      { label: 'LOTO / Tag Out', href: '/accident-prevention/loto' },
      { label: 'Chemical Safety', href: '/accident-prevention/chemical-safety' },
      {
        label: 'Emergency Preparedness',
        children: [
          { label: 'Emergency Drill', href: '/accident-prevention/emergency-preparedness/emergency-drill' },
        ],
      },
      { label: 'Incident & Near Miss', href: '/accident-prevention/incident-near-miss' },
    ],
  },
  {
    id: 'safety-competency',
    label: 'Safety Competency',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    subItems: [
      { label: 'Training Management', href: '/safety-competency/training-management' },
      { label: 'Training Needs Analysis', href: '/safety-competency/training-needs-analysis' },
      { label: 'Safety Induction', href: '/safety-competency/safety-induction' },
      { label: 'Safety Training', href: '/safety-competency/safety-training' },
      { label: 'Refreshment Training', href: '/safety-competency/refreshment-training' },
      { label: 'Competency Management', href: '/safety-competency/competency-management' },
      { label: 'License & Certification', href: '/safety-competency/license-certification' },
      { label: 'Job Competency', href: '/safety-competency/job-competency' },
      { label: 'Safety Briefing / Toolbox Talk', href: '/safety-competency/safety-briefing' },
      { label: 'Safety Culture Program', href: '/safety-competency/safety-culture' },
    ],
  },
  {
    id: 'internal-audit-smk',
    label: 'Internal Audit SMK3',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    subItems: [
      { label: 'PICA', href: '/internal-audit-smk/pica' },
    ],
  },
  {
    id: 'smk3-audit',
    label: 'Audit SMK3',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    subItems: [
      // ── Elemen 1 ──────────────────────────────────────────────────────────
      {
        label: '1. Pembangunan & Pemeliharaan Komitmen',
        children: [
          {
            label: '1.1 Kebijakan K3',
            children: [
              { label: '1.1.1 Penetapan Kebijakan K3', href: '/smk3/komitmen/1-1/1-1-1' },
              { label: '1.1.2 Konsultasi Penyusunan Kebijakan K3', href: '/smk3/komitmen/1-1/1-1-2' },
              { label: '1.1.3 Sosialisasi Kebijakan K3', href: '/smk3/komitmen/1-1/1-1-3' },
              { label: '1.1.4 Kebijakan Khusus K3', href: '/smk3/komitmen/1-1/1-1-4' },
              { label: '1.1.5 Tinjauan Berkala Kebijakan K3', href: '/smk3/komitmen/1-1/1-1-5' },
            ],
          },
          {
            label: '1.2 Tanggung Jawab & Wewenang',
            children: [
              { label: '1.2.1 Distribusi Tanggung Jawab K3', href: '/smk3/komitmen/1-2/1-2-1' },
              { label: '1.2.2 Penunjukan Personel K3', href: '/smk3/komitmen/1-2/1-2-2' },
              { label: '1.2.3 Tanggung Jawab Pimpinan Unit', href: '/smk3/komitmen/1-2/1-2-3' },
              { label: '1.2.4 Tanggung Jawab Pengurus SMK3', href: '/smk3/komitmen/1-2/1-2-4' },
              { label: '1.2.5 Personel Tanggap Darurat', href: '/smk3/komitmen/1-2/1-2-5' },
              { label: '1.2.6 Konsultasi Ahli K3', href: '/smk3/komitmen/1-2/1-2-6' },
              { label: '1.2.7 Pelaporan Kinerja K3', href: '/smk3/komitmen/1-2/1-2-7' },
            ],
          },
          {
            label: '1.3 Tinjauan Ulang & Evaluasi SMK3',
            children: [
              { label: '1.3.1 Tinjauan Penerapan SMK3', href: '/smk3/komitmen/1-3/1-3-1' },
              { label: '1.3.2 Tindak Lanjut Hasil Tinjauan', href: '/smk3/komitmen/1-3/1-3-2' },
              { label: '1.3.3 Tinjauan Berkala SMK3', href: '/smk3/komitmen/1-3/1-3-3' },
            ],
          },
          {
            label: '1.4 Keterlibatan & Konsultasi (P2K3)',
            children: [
              { label: '1.4.1 Konsultasi Tenaga Kerja', href: '/smk3/komitmen/1-4/1-4-1' },
              { label: '1.4.2 Prosedur Konsultasi Perubahan K3', href: '/smk3/komitmen/1-4/1-4-2' },
              { label: '1.4.3 Pembentukan P2K3', href: '/smk3/komitmen/1-4/1-4-3' },
              { label: '1.4.4 Penetapan Ketua P2K3', href: '/smk3/komitmen/1-4/1-4-4' },
              { label: '1.4.5 Penetapan Sekretaris P2K3', href: '/smk3/komitmen/1-4/1-4-5' },
              { label: '1.4.6 Pengembangan Kebijakan & Pengendalian Risiko P2K3', href: '/smk3/komitmen/1-4/1-4-6' },
              { label: '1.4.7 Dokumentasi Struktur P2K3', href: '/smk3/komitmen/1-4/1-4-7' },
              { label: '1.4.8 Pertemuan & Komunikasi P2K3', href: '/smk3/komitmen/1-4/1-4-8' },
              { label: '1.4.9 Pelaporan Kegiatan P2K3', href: '/smk3/komitmen/1-4/1-4-9' },
              { label: '1.4.10 Pembentukan Kelompok Kerja K3', href: '/smk3/komitmen/1-4/1-4-10' },
              { label: '1.4.11 Dokumentasi Kelompok Kerja K3', href: '/smk3/komitmen/1-4/1-4-11' },
            ],
          },
        ],
      },
      // ── Elemen 2 ──────────────────────────────────────────────────────────
      {
        label: '2. Pembuatan & Pendokumentasian Rencana K3',
        children: [
          {
            label: '2.1 Rencana Strategi K3 (HIRADC)',
            children: [
              { label: '2.1.1 Prosedur HIRADC', href: '/smk3/rencana-k3/2-1/2-1-1' },
              { label: '2.1.2 Kompetensi Pelaksana HIRADC', href: '/smk3/rencana-k3/2-1/2-1-2' },
              { label: '2.1.3 Dasar Penyusunan Strategi K3', href: '/smk3/rencana-k3/2-1/2-1-3' },
              { label: '2.1.4 Pengendalian Risiko melalui Strategi K3', href: '/smk3/rencana-k3/2-1/2-1-4' },
              { label: '2.1.5 Rencana Kerja dan Sasaran K3', href: '/smk3/rencana-k3/2-1/2-1-5' },
              { label: '2.1.6 Integrasi Rencana K3 dengan Sistem Manajemen', href: '/smk3/rencana-k3/2-1/2-1-6' },
            ],
          },
          {
            label: '2.2 Manual SMK3',
            children: [
              { label: '2.2.1 Manual SMK3', href: '/smk3/rencana-k3/2-2/2-2-1' },
              { label: '2.2.2 Manual Khusus K3', href: '/smk3/rencana-k3/2-2/2-2-2' },
              { label: '2.2.3 Aksesibilitas Manual SMK3', href: '/smk3/rencana-k3/2-2/2-2-3' },
            ],
          },
          {
            label: '2.3 Peraturan & Persyaratan Lain K3',
            children: [
              { label: '2.3.1 Identifikasi dan Pengelolaan Regulasi K3', href: '/smk3/rencana-k3/2-3/2-3-1' },
              { label: '2.3.2 Penanggung Jawab Informasi Regulasi K3', href: '/smk3/rencana-k3/2-3/2-3-2' },
              { label: '2.3.3 Integrasi Persyaratan Regulasi K3', href: '/smk3/rencana-k3/2-3/2-3-3' },
              { label: '2.3.4 Tinjauan Perubahan Regulasi K3', href: '/smk3/rencana-k3/2-3/2-3-4' },
            ],
          },
          {
            label: '2.4 Informasi K3',
            children: [
              { label: '2.4.1 Distribusi Informasi K3', href: '/smk3/rencana-k3/2-4/2-4-1' },
            ],
          },
        ],
      },
      // ── Elemen 3 ──────────────────────────────────────────────────────────
      {
        label: '3. Pengendalian Perancangan & Peninjauan Kontrak',
        children: [
          {
            label: '3.1 Pengendalian Perancangan',
            children: [
              { label: '3.1.1 HIRADC pada Perancangan dan Modifikasi', href: '/smk3/perancangan-kontrak/3-1/3-1-1' },
              { label: '3.1.2 Pengembangan Prosedur dan Instruksi Kerja K3', href: '/smk3/perancangan-kontrak/3-1/3-1-2' },
              { label: '3.1.3 Verifikasi K3 pada Perancangan', href: '/smk3/perancangan-kontrak/3-1/3-1-3' },
              { label: '3.1.4 Pengendalian Perubahan dan Modifikasi', href: '/smk3/perancangan-kontrak/3-1/3-1-4' },
            ],
          },
          {
            label: '3.2 Peninjauan Ulang Kontrak',
            children: [
              { label: '3.2.1 HIRADC pada Pengadaan Barang dan Jasa', href: '/smk3/perancangan-kontrak/3-2/3-2-1' },
              { label: '3.2.2 Tinjauan Kontrak Berbasis Risiko K3', href: '/smk3/perancangan-kontrak/3-2/3-2-2' },
              { label: '3.2.3 Evaluasi K3 Pemasok', href: '/smk3/perancangan-kontrak/3-2/3-2-3' },
              { label: '3.2.4 Dokumentasi Tinjauan Kontrak', href: '/smk3/perancangan-kontrak/3-2/3-2-4' },
            ],
          },
        ],
      },
      // ── Elemen 4 ──────────────────────────────────────────────────────────
      {
        label: '4. Pengendalian Dokumen',
        children: [
          {
            label: '4.1 Persetujuan & Pengeluaran Dokumen',
            children: [
              { label: '4.1.1 Identifikasi Dokumen K3', href: '/smk3/dokumen/4-1/4-1-1' },
              { label: '4.1.2 Distribusi Dokumen K3', href: '/smk3/dokumen/4-1/4-1-2' },
              { label: '4.1.3 Penyimpanan Dokumen K3', href: '/smk3/dokumen/4-1/4-1-3' },
              { label: '4.1.4 Pengendalian Dokumen Usang', href: '/smk3/dokumen/4-1/4-1-4' },
            ],
          },
          {
            label: '4.2 Perubahan & Modifikasi Dokumen',
            children: [
              { label: '4.2.1 Pengendalian Perubahan Dokumen', href: '/smk3/dokumen/4-2/4-2-1' },
              { label: '4.2.2 Informasi Perubahan Dokumen', href: '/smk3/dokumen/4-2/4-2-2' },
              { label: '4.2.3 Status dan Pengendalian Dokumen', href: '/smk3/dokumen/4-2/4-2-3' },
            ],
          },
        ],
      },
      // ── Elemen 5 ──────────────────────────────────────────────────────────
      {
        label: '5. Pembelian & Pengendalian Produk',
        children: [
          {
            label: '5.1 Spesifikasi Pembelian Barang/Jasa',
            children: [
              { label: '5.1.1 Verifikasi K3 pada Pembelian', href: '/smk3/pembelian/5-1/5-1-1' },
              { label: '5.1.2 Spesifikasi Pembelian Berbasis K3', href: '/smk3/pembelian/5-1/5-1-2' },
              { label: '5.1.3 Konsultasi K3 pada Pembelian', href: '/smk3/pembelian/5-1/5-1-3' },
              { label: '5.1.4 Pertimbangan K3 Sebelum Penggunaan', href: '/smk3/pembelian/5-1/5-1-4' },
              { label: '5.1.5 Evaluasi Persyaratan K3 Pemasok', href: '/smk3/pembelian/5-1/5-1-5' },
            ],
          },
          {
            label: '5.2 Verifikasi Barang/Jasa yang Dibeli',
            children: [
              { label: '5.2.1 Verifikasi Barang dan Jasa', href: '/smk3/pembelian/5-2/5-2-1' },
            ],
          },
          {
            label: '5.3 Pengendalian Barang/Jasa dari Pelanggan',
            children: [
              { label: '5.3.1 Identifikasi Risiko Barang Pasokan Pelanggan', href: '/smk3/pembelian/5-3/5-3-1' },
            ],
          },
          {
            label: '5.4 Kemampuan Telusur Produk',
            children: [
              { label: '5.4.1 Identifikasi Produk dalam Proses Produksi', href: '/smk3/pembelian/5-4/5-4-1' },
              { label: '5.4.2 Penelusuran Produk Berisiko K3', href: '/smk3/pembelian/5-4/5-4-2' },
            ],
          },
        ],
      },
      // ── Elemen 6 ──────────────────────────────────────────────────────────
      {
        label: '6. Keamanan Bekerja Berdasarkan SMK3',
        children: [
          {
            label: '6.1 Sistem Kerja (prosedur, izin kerja, APD)',
            children: [
              { label: '6.1.1 Identifikasi Bahaya dan Penilaian Risiko', href: '/smk3/keamanan-kerja/6-1/6-1-1' },
              { label: '6.1.2 Penetapan Pengendalian Risiko', href: '/smk3/keamanan-kerja/6-1/6-1-2' },
              { label: '6.1.3 Prosedur Pengendalian Risiko', href: '/smk3/keamanan-kerja/6-1/6-1-3' },
              { label: '6.1.4 Kepatuhan Regulasi pada Pengendalian Risiko', href: '/smk3/keamanan-kerja/6-1/6-1-4' },
              { label: '6.1.5 Sistem Izin Kerja', href: '/smk3/keamanan-kerja/6-1/6-1-5' },
              { label: '6.1.6 Penyediaan dan Pemeliharaan APD', href: '/smk3/keamanan-kerja/6-1/6-1-6' },
              { label: '6.1.7 Kelayakan APD', href: '/smk3/keamanan-kerja/6-1/6-1-7' },
              { label: '6.1.8 Evaluasi Pengendalian Risiko', href: '/smk3/keamanan-kerja/6-1/6-1-8' },
            ],
          },
          {
            label: '6.2 Pengawasan',
            children: [
              { label: '6.2.1 Pengawasan Pelaksanaan Pekerjaan', href: '/smk3/keamanan-kerja/6-2/6-2-1' },
              { label: '6.2.2 Pengawasan Berdasarkan Risiko dan Kompetensi', href: '/smk3/keamanan-kerja/6-2/6-2-2' },
              { label: '6.2.3 Keterlibatan Pengawas dalam HIRADC', href: '/smk3/keamanan-kerja/6-2/6-2-3' },
              { label: '6.2.4 Investigasi Kecelakaan oleh Pengawas', href: '/smk3/keamanan-kerja/6-2/6-2-4' },
              { label: '6.2.5 Keterlibatan Pengawas dalam Konsultasi', href: '/smk3/keamanan-kerja/6-2/6-2-5' },
            ],
          },
          {
            label: '6.3 Seleksi & Penempatan Personil',
            children: [
              { label: '6.3.1 Persyaratan Kesehatan dan Kompetensi Kerja', href: '/smk3/keamanan-kerja/6-3/6-3-1' },
              { label: '6.3.2 Penempatan Kerja Berdasarkan Kompetensi', href: '/smk3/keamanan-kerja/6-3/6-3-2' },
            ],
          },
          {
            label: '6.4 Area Terbatas (LOTO, rambu K3)',
            children: [
              { label: '6.4.1 Penilaian Risiko Area Terbatas', href: '/smk3/keamanan-kerja/6-4/6-4-1' },
              { label: '6.4.2 Pengendalian Akses Area Terbatas', href: '/smk3/keamanan-kerja/6-4/6-4-2' },
              { label: '6.4.3 Penyediaan Fasilitas Kerja', href: '/smk3/keamanan-kerja/6-4/6-4-3' },
              { label: '6.4.4 Pemasangan Rambu K3', href: '/smk3/keamanan-kerja/6-4/6-4-4' },
            ],
          },
          {
            label: '6.5 Pemeliharaan, Perbaikan & Perubahan Sarana',
            children: [
              { label: '6.5.1 Pemeriksaan dan Pemeliharaan Sarana Produksi', href: '/smk3/keamanan-kerja/6-5/6-5-1' },
              { label: '6.5.2 Dokumentasi Pemeliharaan Sarana Produksi', href: '/smk3/keamanan-kerja/6-5/6-5-2' },
              { label: '6.5.3 Sertifikasi Sarana dan Peralatan', href: '/smk3/keamanan-kerja/6-5/6-5-3' },
              { label: '6.5.4 Kompetensi Petugas Pemeliharaan', href: '/smk3/keamanan-kerja/6-5/6-5-4' },
              { label: '6.5.5 Pengendalian Perubahan Sarana Produksi', href: '/smk3/keamanan-kerja/6-5/6-5-5' },
              { label: '6.5.6 Permintaan Perbaikan Sarana Produksi', href: '/smk3/keamanan-kerja/6-5/6-5-6' },
              { label: '6.5.7 Sistem Tag Out', href: '/smk3/keamanan-kerja/6-5/6-5-7' },
              { label: '6.5.8 Sistem Lock Out', href: '/smk3/keamanan-kerja/6-5/6-5-8' },
              { label: '6.5.9 Keselamatan Saat Pemeliharaan', href: '/smk3/keamanan-kerja/6-5/6-5-9' },
              { label: '6.5.10 Persetujuan Penggunaan Pasca Pemeliharaan', href: '/smk3/keamanan-kerja/6-5/6-5-10' },
            ],
          },
          {
            label: '6.6 Pelayanan (kontrak jasa K3)',
            children: [
              { label: '6.6.1 Pengendalian Jasa Kontrak oleh Perusahaan', href: '/smk3/keamanan-kerja/6-6/6-6-1' },
              { label: '6.6.2 Pengendalian Jasa Kontrak dari Pihak Ketiga', href: '/smk3/keamanan-kerja/6-6/6-6-2' },
            ],
          },
          {
            label: '6.7 Kesiapan Tanggap Darurat',
            children: [
              { label: '6.7.1 Identifikasi dan Prosedur Keadaan Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-1' },
              { label: '6.7.2 Penyediaan dan Pengujian Sarana Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-2' },
              { label: '6.7.3 Pelatihan Keadaan Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-3' },
              { label: '6.7.4 Penetapan Petugas Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-4' },
              { label: '6.7.5 Komunikasi Prosedur Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-5' },
              { label: '6.7.6 Pemeriksaan Peralatan Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-6' },
              { label: '6.7.7 Penempatan dan Kecukupan Sarana Darurat', href: '/smk3/keamanan-kerja/6-7/6-7-7' },
            ],
          },
          {
            label: '6.8 Pertolongan Pertama pada Kecelakaan',
            children: [
              { label: '6.8.1 Evaluasi Sistem P3K', href: '/smk3/keamanan-kerja/6-8/6-8-1' },
              { label: '6.8.2 Penunjukan dan Pelatihan Petugas P3K', href: '/smk3/keamanan-kerja/6-8/6-8-2' },
            ],
          },
          {
            label: '6.9 Rencana Pemulihan Kondisi Darurat',
            children: [
              { label: '6.9.1 Pemulihan Pasca Kecelakaan Kerja', href: '/smk3/keamanan-kerja/6-9/6-9-1' },
            ],
          },
        ],
      },
      // ── Elemen 7 ──────────────────────────────────────────────────────────
      {
        label: '7. Standar Pemantauan',
        children: [
          {
            label: '7.1 Pemeriksaan Bahaya (Inspeksi)',
            children: [
              { label: '7.1.1 Pelaksanaan Inspeksi K3', href: '/smk3/pemantauan/7-1/7-1-1' },
              { label: '7.1.2 Kompetensi Petugas Inspeksi', href: '/smk3/pemantauan/7-1/7-1-2' },
              { label: '7.1.3 Keterlibatan Tenaga Kerja dalam Inspeksi', href: '/smk3/pemantauan/7-1/7-1-3' },
              { label: '7.1.4 Penggunaan Checklist Inspeksi', href: '/smk3/pemantauan/7-1/7-1-4' },
              { label: '7.1.5 Pelaporan Hasil Inspeksi', href: '/smk3/pemantauan/7-1/7-1-5' },
              { label: '7.1.6 Penanggung Jawab Tindak Perbaikan', href: '/smk3/pemantauan/7-1/7-1-6' },
              { label: '7.1.7 Pemantauan Tindakan Perbaikan', href: '/smk3/pemantauan/7-1/7-1-7' },
            ],
          },
          {
            label: '7.2 Pemantauan/Pengukuran Lingkungan Kerja',
            children: [
              { label: '7.2.1 Pemantauan Lingkungan Kerja', href: '/smk3/pemantauan/7-2/7-2-1' },
              { label: '7.2.2 Ruang Lingkup Pengukuran Lingkungan Kerja', href: '/smk3/pemantauan/7-2/7-2-2' },
              { label: '7.2.3 Kompetensi Petugas Pengukuran', href: '/smk3/pemantauan/7-2/7-2-3' },
            ],
          },
          {
            label: '7.3 Peralatan Pemeriksaan & Pengujian',
            children: [
              { label: '7.3.1 Pengendalian Alat Ukur dan Uji K3', href: '/smk3/pemantauan/7-3/7-3-1' },
              { label: '7.3.2 Kalibrasi dan Pemeliharaan Alat', href: '/smk3/pemantauan/7-3/7-3-2' },
            ],
          },
          {
            label: '7.4 Pemantauan Kesehatan Tenaga Kerja (MCU)',
            children: [
              { label: '7.4.1 Pemantauan Kesehatan Tenaga Kerja', href: '/smk3/pemantauan/7-4/7-4-1' },
              { label: '7.4.2 Identifikasi Kebutuhan Pemeriksaan Kesehatan', href: '/smk3/pemantauan/7-4/7-4-2' },
              { label: '7.4.3 Pemeriksaan Kesehatan oleh Dokter Penunjuk', href: '/smk3/pemantauan/7-4/7-4-3' },
              { label: '7.4.4 Pelayanan Kesehatan Kerja', href: '/smk3/pemantauan/7-4/7-4-4' },
              { label: '7.4.5 Dokumentasi Kesehatan Kerja', href: '/smk3/pemantauan/7-4/7-4-5' },
            ],
          },
        ],
      },
      // ── Elemen 8 ──────────────────────────────────────────────────────────
      {
        label: '8. Pelaporan & Perbaikan Kekurangan',
        children: [
          {
            label: '8.1 Pelaporan Bahaya',
            children: [
              { label: '8.1.1 Pelaporan Bahaya K3', href: '/smk3/pelaporan/8-1/8-1-1' },
            ],
          },
          {
            label: '8.2 Pelaporan Kecelakaan & Penyakit Akibat Kerja',
            children: [
              { label: '8.2.1 Pelaporan dan Pencatatan Insiden K3', href: '/smk3/pelaporan/8-2/8-2-1' },
            ],
          },
          {
            label: '8.3 Pemeriksaan & Pengkajian Kecelakaan',
            children: [
              { label: '8.3.1 Prosedur Investigasi Kecelakaan Kerja', href: '/smk3/pelaporan/8-3/8-3-1' },
              { label: '8.3.2 Kompetensi Investigator K3', href: '/smk3/pelaporan/8-3/8-3-2' },
              { label: '8.3.3 Pelaporan Hasil Investigasi', href: '/smk3/pelaporan/8-3/8-3-3' },
              { label: '8.3.4 Penanggung Jawab Tindak Perbaikan', href: '/smk3/pelaporan/8-3/8-3-4' },
              { label: '8.3.5 Komunikasi Hasil Perbaikan', href: '/smk3/pelaporan/8-3/8-3-5' },
              { label: '8.3.6 Pemantauan Tindakan Perbaikan', href: '/smk3/pelaporan/8-3/8-3-6' },
            ],
          },
          {
            label: '8.4 Penanganan Masalah K3',
            children: [
              { label: '8.4.1 Penanganan Permasalahan K3', href: '/smk3/pelaporan/8-4/8-4-1' },
            ],
          },
        ],
      },
      // ── Elemen 9 ──────────────────────────────────────────────────────────
      {
        label: '9. Pengelolaan Material & Perpindahannya',
        children: [
          {
            label: '9.1 Penanganan Material Manual & Mekanis',
            children: [
              { label: '9.1.1 HIRADC Penanganan Material', href: '/smk3/material/9-1/9-1-1' },
              { label: '9.1.2 Kompetensi Petugas Penanganan Material', href: '/smk3/material/9-1/9-1-2' },
              { label: '9.1.3 Pengendalian Risiko Penanganan Material', href: '/smk3/material/9-1/9-1-3' },
              { label: '9.1.4 Penanganan Tumpahan dan Kebocoran', href: '/smk3/material/9-1/9-1-4' },
            ],
          },
          {
            label: '9.2 Sistem Pengangkutan, Penyimpanan & Pembuangan',
            children: [
              { label: '9.2.1 Penyimpanan dan Pemindahan Material', href: '/smk3/material/9-2/9-2-1' },
              { label: '9.2.2 Pengendalian Material Rusak dan Kadaluarsa', href: '/smk3/material/9-2/9-2-2' },
              { label: '9.2.3 Pembuangan Material Secara Aman', href: '/smk3/material/9-2/9-2-3' },
            ],
          },
          {
            label: '9.3 Pengendalian Bahan Kimia Berbahaya (B3)',
            children: [
              { label: '9.3.1 Pengelolaan Bahan Kimia Berbahaya', href: '/smk3/material/9-3/9-3-1' },
              { label: '9.3.2 Ketersediaan MSDS', href: '/smk3/material/9-3/9-3-2' },
              { label: '9.3.3 Identifikasi dan Label BKB', href: '/smk3/material/9-3/9-3-3' },
              { label: '9.3.4 Pemasangan Rambu Bahaya BKB', href: '/smk3/material/9-3/9-3-4' },
              { label: '9.3.5 Kompetensi Penanganan BKB', href: '/smk3/material/9-3/9-3-5' },
            ],
          },
        ],
      },
      // ── Elemen 10 ─────────────────────────────────────────────────────────
      {
        label: '10. Pengumpulan & Penggunaan Data',
        children: [
          {
            label: '10.1 Pengumpulan & Pengarsipan Catatan K3',
            children: [
              { label: '10.1.1 Pengelolaan Catatan K3', href: '/smk3/data/10-1/10-1-1' },
              { label: '10.1.2 Pemeliharaan Regulasi dan Standar K3', href: '/smk3/data/10-1/10-1-2' },
              { label: '10.1.3 Kerahasiaan Catatan K3', href: '/smk3/data/10-1/10-1-3' },
              { label: '10.1.4 Catatan Kompensasi dan Rehabilitasi', href: '/smk3/data/10-1/10-1-4' },
            ],
          },
          {
            label: '10.2 Analisis Data & Laporan Kinerja K3',
            children: [
              { label: '10.2.1 Pengumpulan dan Analisis Data K3', href: '/smk3/data/10-2/10-2-1' },
              { label: '10.2.2 Pelaporan Kinerja K3', href: '/smk3/data/10-2/10-2-2' },
            ],
          },
        ],
      },
      // ── Elemen 11 ─────────────────────────────────────────────────────────
      {
        label: '11. Pemeriksaan SMK3',
        children: [
          {
            label: '11.1 Audit Internal SMK3',
            children: [
              { label: '11.1.1 Pelaksanaan Audit Internal SMK3', href: '/smk3/pemeriksaan/11-1/11-1-1' },
              { label: '11.1.2 Kompetensi Auditor Internal SMK3', href: '/smk3/pemeriksaan/11-1/11-1-2' },
              { label: '11.1.3 Pelaporan dan Tindak Lanjut Audit', href: '/smk3/pemeriksaan/11-1/11-1-3' },
            ],
          },
        ],
      },
      // ── Elemen 12 ─────────────────────────────────────────────────────────
      {
        label: '12. Pengembangan Keterampilan & Kemampuan',
        children: [
          {
            label: '12.1 Strategi Pelatihan (TNA, program)',
            children: [
              { label: '12.1.1 Analisis Kebutuhan Pelatihan K3', href: '/smk3/pelatihan/12-1/12-1-1' },
              { label: '12.1.2 Perencanaan Pelatihan K3', href: '/smk3/pelatihan/12-1/12-1-2' },
              { label: '12.1.3 Penetapan Jenis Pelatihan K3', href: '/smk3/pelatihan/12-1/12-1-3' },
              { label: '12.1.4 Kompetensi Penyedia Pelatihan', href: '/smk3/pelatihan/12-1/12-1-4' },
              { label: '12.1.5 Fasilitas dan Sumber Daya Pelatihan', href: '/smk3/pelatihan/12-1/12-1-5' },
              { label: '12.1.6 Dokumentasi Pelatihan K3', href: '/smk3/pelatihan/12-1/12-1-6' },
              { label: '12.1.7 Tinjauan Program Pelatihan', href: '/smk3/pelatihan/12-1/12-1-7' },
            ],
          },
          {
            label: '12.2 Pelatihan bagi Manajemen & Penyelia',
            children: [
              { label: '12.2.1 Pelatihan K3 untuk Manajemen', href: '/smk3/pelatihan/12-2/12-2-1' },
              { label: '12.2.2 Pelatihan K3 untuk Pengawas dan Penyelia', href: '/smk3/pelatihan/12-2/12-2-2' },
            ],
          },
          {
            label: '12.3 Pelatihan bagi Tenaga Kerja',
            children: [
              { label: '12.3.1 Pelatihan K3 Tenaga Kerja', href: '/smk3/pelatihan/12-3/12-3-1' },
              { label: '12.3.2 Pelatihan atas Perubahan Proses', href: '/smk3/pelatihan/12-3/12-3-2' },
              { label: '12.3.3 Pelatihan Penyegaran K3', href: '/smk3/pelatihan/12-3/12-3-3' },
            ],
          },
          {
            label: '12.4 Pelatihan Pengenalan (Safety Induction)',
            children: [
              { label: '12.4.1 Briefing K3 untuk Pengunjung dan Mitra Kerja', href: '/smk3/pelatihan/12-4/12-4-1' },
            ],
          },
          {
            label: '12.5 Pelatihan Keahlian Khusus (Sertifikasi)',
            children: [
              { label: '12.5.1 Pengendalian Lisensi dan Kualifikasi Kerja', href: '/smk3/pelatihan/12-5/12-5-1' },
            ],
          },
        ],
      },
    ],
  },
];

export function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Track which menus are open — default open the one matching current path
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.subItems?.some((s) => {
        if (s.href && pathname.startsWith(s.href)) return true;
        return s.children?.some((c) => {
          if ('href' in c && c.href && pathname.startsWith(c.href)) return true;
          if ('children' in c) {
            const si = c as SubItem;
            return si.children?.some((gc) => 'href' in gc && gc.href && pathname.startsWith(gc.href));
          }
          return false;
        });
      })) {
        initial[item.id] = true;
      }
    });
    return initial;
  });

  // Track sub-group expand (level 2 — submenu yang punya children)
  const [openSubGroups, setOpenSubGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      item.subItems?.forEach((sub) => {
        // Level 2: sub punya children (bisa SubSubItem atau SubItem)
        if (sub.children) {
          // Cek apakah ada children yang active (level 3 link)
          const level3Active = sub.children.some((c) => {
            if ('href' in c && c.href) return pathname.startsWith(c.href);
            // Jika level 3 juga punya children (tidak terjadi di sini, tapi future-proof)
            return false;
          });
          if (level3Active) initial[`${item.id}__${sub.label}`] = true;
        }
      });
    });
    return initial;
  });

  // Track level-3 expand (sub-sub-group, untuk smk3-audit: elemen → sub-elemen → sub-sub-elemen)
  const [openLevel3Groups, setOpenLevel3Groups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      item.subItems?.forEach((sub) => {
        if (sub.children) {
          sub.children.forEach((c) => {
            // Jika child level 2 juga punya children (level 3 sub-group)
            if ('children' in c && c.children) {
              const subItem = c as SubItem;
              const level3Active = subItem.children?.some(
                (gc) => 'href' in gc && gc.href && pathname.startsWith(gc.href)
              );
              if (level3Active) initial[`${item.id}__${sub.label}__${subItem.label}`] = true;
            }
          });
        }
      });
    });
    return initial;
  });

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSubGroup = (key: string) => {
    setOpenSubGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLevel3Group = (key: string) => {
    setOpenLevel3Groups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/');

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  // ── Search logic ──────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();

  // Filter menu items berdasarkan query pencarian (support 3 level)
  const filteredMenuItems = q
    ? menuItems
        .map((item) => {
          const menuMatches = item.label.toLowerCase().includes(q);

          const matchedSubs = item.subItems
            ?.map((s) => {
              if (!s.children) {
                // Sub-item biasa tanpa children
                return s.label.toLowerCase().includes(q) ? s : null;
              }

              // Sub-group dengan children — bisa 2-level atau 3-level
              const isThreeLevel = s.children.some((c) => 'children' in c && (c as SubItem).children);

              if (isThreeLevel) {
                // 3-level: filter children (sub-elemen) dan grand-children (sub-sub-elemen)
                const matchedChildren = s.children
                  .map((c) => {
                    const si = c as SubItem;
                    const siMatches = si.label.toLowerCase().includes(q);
                    const matchedGc = si.children?.filter((gc) =>
                      gc.label.toLowerCase().includes(q)
                    );
                    if (siMatches || (matchedGc && matchedGc.length > 0)) {
                      return { ...si, children: siMatches ? si.children : matchedGc };
                    }
                    return null;
                  })
                  .filter(Boolean) as SubItem[];

                const groupMatches = s.label.toLowerCase().includes(q);
                if (groupMatches || matchedChildren.length > 0) {
                  return { ...s, children: groupMatches ? s.children : matchedChildren };
                }
                return null;
              } else {
                // 2-level biasa
                const matchedChildren = s.children.filter((c) =>
                  c.label.toLowerCase().includes(q)
                );
                const groupMatches = s.label.toLowerCase().includes(q);
                if (groupMatches || matchedChildren.length > 0) {
                  return { ...s, children: groupMatches ? s.children : matchedChildren };
                }
                return null;
              }
            })
            .filter(Boolean) as typeof item.subItems;

          if (menuMatches || (matchedSubs && matchedSubs.length > 0)) {
            return {
              ...item,
              subItems: menuMatches ? item.subItems : matchedSubs,
            };
          }
          return null;
        })
        .filter(Boolean) as MenuItem[]
    : menuItems;

  return (
    <>
      {/* ── Hamburger button (MOBILE ONLY) — di luar aside agar selalu terlihat ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-[400] bg-white text-[#1F2937] rounded-xl p-2.5 border border-[#E5E7EB] shadow-md hover:bg-gray-50 active:scale-95 transition-all"
        aria-label="Buka menu sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* ── Overlay (mobile) ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[350] md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px] z-[360]
          bg-white text-[#1F2937] flex flex-col
          border-r border-[#E5E7EB]
          overflow-y-auto
          transition-transform duration-300
          md:translate-x-0 md:sticky md:top-0 md:h-screen md:z-auto md:flex-shrink-0
          [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#E5E7EB] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#D1D5DB]
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Brand + close button (mobile) */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E7EB] flex-shrink-0 bg-white">
          <div className="w-9 h-9 bg-[#FF6B1A] rounded-xl flex items-center justify-center font-bold text-base text-white flex-shrink-0 shadow-xs ring-2 ring-[#FFF1E8]">
            K3
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm text-[#1F2937] tracking-tight leading-tight">SMK3 System</div>
            <div className="text-[10px] text-[#6B7280] tracking-wider uppercase font-semibold mt-0.5 truncate">PT. QMB New Energy Materials</div>
          </div>
          {/* Close button — hanya terlihat di mobile */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-[#9CA3AF] hover:text-[#1F2937] p-1 ml-auto rounded-lg transition-colors"
            aria-label="Tutup sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Search box */}
        <div className="px-3.5 py-3 border-b border-[#E5E7EB] flex-shrink-0 bg-white">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari menu..."
              className="w-full bg-[#FAFAFA] text-[#1F2937] text-[12px] placeholder-[#9CA3AF] pl-8 pr-7 py-2 rounded-lg border border-[#E5E7EB] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/15 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
                aria-label="Hapus pencarian"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Quick navigation links */}
        <div className="px-3 py-2 border-b border-[#E5E7EB] flex-shrink-0 space-y-0.5 bg-[#FAFAFA]/50">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#4B5563] hover:bg-white hover:text-[#1F2937] hover:shadow-xs transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Kembali ke Home</span>
          </Link>
          <Link
            href="/contact"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#4B5563] hover:bg-white hover:text-[#1F2937] hover:shadow-xs transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Safety Complaint</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-2">
          {filteredMenuItems.length === 0 && q && (
            <div className="px-3 py-6 text-center">
              <p className="text-[12px] text-[#6B7280]">Tidak ada menu yang cocok</p>
              <p className="text-[11px] text-[#9CA3AF] mt-1">&ldquo;{search}&rdquo;</p>
            </div>
          )}
          {filteredMenuItems.map((item, index) => {
            // Sembunyikan divider jika sedang search
            const isDivider = !q && index === filteredMenuItems.findIndex(i => i.id === 'safety-compliance');
            const isMenuActive =
              item.href
                ? isActive(item.href)
                : item.subItems?.some((s) => {
                    if (s.href && isActive(s.href)) return true;
                    return s.children?.some((c) => {
                      if ('href' in c && c.href && isActive(c.href)) return true;
                      // Level 3 (smk3-audit): sub.children adalah SubItem[] yang punya children SubSubItem[]
                      if ('children' in c) {
                        const subItem = c as SubItem;
                        return subItem.children?.some(
                          (gc) => 'href' in gc && gc.href && isActive(gc.href)
                        );
                      }
                      return false;
                    });
                  });

            // Saat ada query: paksa buka semua menu yang masuk hasil filter
            const isOpen = q ? true : openMenus[item.id];

            return (
              <React.Fragment key={item.id}>
                {isDivider && <div className="h-px bg-[#E5E7EB] my-2 mx-2" />}

                <div className="mb-0.5">
                  {/* Menu header */}
                  {item.href ? (
                    // Direct link (Dashboard)
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                        isMenuActive
                          ? 'bg-[#FFF1E8] text-[#FF6B1A] font-semibold'
                          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                      }`}
                    >
                      <span className="w-5 flex justify-center flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  ) : (
                    // Collapsible menu
                    <button
                      onClick={() => !q && toggleMenu(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors text-left ${
                        isMenuActive
                          ? 'bg-[#FFF1E8] text-[#FF6B1A] font-semibold'
                          : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                      }`}
                    >
                      <span className="w-5 flex justify-center flex-shrink-0">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {!q && (
                        <svg
                          width="11" height="11"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                          className={`flex-shrink-0 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* Sub-items */}
                  {item.subItems && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen
                          ? item.id === 'smk3-audit' ? 'max-h-[20000px] opacity-100' : 'max-h-[600px] opacity-100'
                          : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="pl-2 mt-0.5">
                        {item.subItems.map((sub) => {
                          const isElementHeader = /^\d+\.\s/.test(sub.label);

                          // Highlight teks yang cocok dengan query
                          const highlightLabel = (label: string) => {
                            if (!q) return label;
                            const idx = label.toLowerCase().indexOf(q);
                            if (idx === -1) return label;
                            return (
                              <>
                                {label.slice(0, idx)}
                                <mark className="bg-[#FF6B1A]/20 text-[#FF6B1A] rounded px-0.5">
                                  {label.slice(idx, idx + q.length)}
                                </mark>
                                {label.slice(idx + q.length)}
                              </>
                            );
                          };

                          // ── Sub-group (punya children) ──
                          if (sub.children) {
                            const subGroupKey = `${item.id}__${sub.label}`;
                            const subGroupOpen = q ? true : !!openSubGroups[subGroupKey];

                            // Deteksi apakah ini 3-level (children adalah SubItem[] dengan children) atau 2-level biasa
                            const isThreeLevel = sub.children.some((c) => 'children' in c && (c as SubItem).children);

                            // Active check: cek sampai level 3
                            const subGroupActive = sub.children.some((c) => {
                              if ('href' in c && c.href && isActive(c.href)) return true;
                              if ('children' in c) {
                                const si = c as SubItem;
                                return si.children?.some((gc) => 'href' in gc && gc.href && isActive(gc.href));
                              }
                              return false;
                            });

                            // Deteksi apakah ini elemen header (misal "1. Pembangunan...")
                            const isElemHeader = /^\d+\.\s/.test(sub.label);

                            return (
                              <div key={sub.label}>
                                {/* Header level 2 — bisa elemen header atau sub-group biasa */}
                                <button
                                  onClick={() => !q && toggleSubGroup(subGroupKey)}
                                  className={`w-full flex items-center gap-2.5 rounded-md text-[12px] my-px transition-colors text-left ${
                                    isElemHeader
                                      ? `py-2 px-3 pl-8 font-semibold tracking-wide ${
                                          subGroupActive
                                            ? 'text-[#FF6B1A] bg-[#FFF1E8]/70'
                                            : 'text-[#374151] hover:bg-gray-100/70 hover:text-[#111827]'
                                        }`
                                      : `py-1.5 px-3 pl-11 ${
                                          subGroupActive
                                            ? 'text-[#FF6B1A] bg-[#FFF1E8]/60 font-medium'
                                            : 'text-[#6B7280] hover:bg-gray-100/60 hover:text-[#111827]'
                                        }`
                                  }`}
                                >
                                  {!isElemHeader && (
                                    <span className={`w-1 h-1 rounded-full flex-shrink-0 ${subGroupActive ? 'bg-[#FF6B1A]' : 'bg-gray-300'}`} />
                                  )}
                                  <span className="flex-1">{highlightLabel(sub.label)}</span>
                                  {!q && (
                                    <svg
                                      width="10" height="10"
                                      viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                      className={`flex-shrink-0 text-[#9CA3AF] transition-transform duration-200 ${subGroupOpen ? 'rotate-90' : ''}`}
                                    >
                                      <path d="m9 18 6-6-6-6" />
                                    </svg>
                                  )}
                                </button>

                                {/* Children level 2 */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${subGroupOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                  <div className={isElemHeader ? 'pl-2' : 'pl-2'}>
                                    {sub.children.map((child) => {
                                      // ── 3-level: child adalah SubItem yang punya children (sub-sub-group) ──
                                      if (isThreeLevel && 'children' in child) {
                                        const subItem = child as SubItem;
                                        const level3Key = `${item.id}__${sub.label}__${subItem.label}`;
                                        const level3Open = q ? true : !!openLevel3Groups[level3Key];
                                        const level3Active = subItem.children?.some(
                                          (gc) => 'href' in gc && gc.href && isActive(gc.href)
                                        );
                                        return (
                                          <div key={subItem.label}>
                                            {/* Header level 3 (sub-elemen) */}
                                            <button
                                              onClick={() => !q && toggleLevel3Group(level3Key)}
                                              className={`w-full flex items-center gap-2 rounded-md text-[11.5px] my-px py-1.5 px-3 pl-11 transition-colors text-left ${
                                                level3Active
                                                  ? 'text-[#FF6B1A] bg-[#FFF1E8]/60 font-medium'
                                                  : 'text-[#6B7280] hover:bg-gray-100/60 hover:text-[#111827]'
                                              }`}
                                            >
                                              <span className={`w-1 h-1 rounded-full flex-shrink-0 ${level3Active ? 'bg-[#FF6B1A]' : 'bg-gray-300'}`} />
                                              <span className="flex-1">{highlightLabel(subItem.label)}</span>
                                              {!q && (
                                                <svg
                                                  width="9" height="9"
                                                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                  className={`flex-shrink-0 text-[#9CA3AF] transition-transform duration-200 ${level3Open ? 'rotate-90' : ''}`}
                                                >
                                                  <path d="m9 18 6-6-6-6" />
                                                </svg>
                                              )}
                                            </button>
                                            {/* Sub-sub-menu (level 4 visual = link ke halaman) */}
                                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${level3Open ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                              <div className="pl-2">
                                                {subItem.children?.map((grandChild) => {
                                                  if (!('href' in grandChild)) return null;
                                                  const gc = grandChild as SubSubItem;
                                                  const gcActive = isActive(gc.href);
                                                  return (
                                                    <Link
                                                      key={gc.href}
                                                      href={gc.href}
                                                      onClick={() => { setMobileOpen(false); setSearch(''); }}
                                                      className={`flex items-center gap-2 rounded-md text-[11px] my-px py-1.5 px-3 pl-14 transition-colors ${
                                                        gcActive
                                                          ? 'text-[#FF6B1A] bg-[#FFF1E8] font-semibold'
                                                          : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#111827]'
                                                      }`}
                                                    >
                                                      <span className={`w-1 h-1 rounded-full flex-shrink-0 ${gcActive ? 'bg-[#FF6B1A]' : 'bg-gray-300'}`} />
                                                      {highlightLabel(gc.label)}
                                                    </Link>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }

                                      // ── 2-level biasa: child adalah SubSubItem (langsung link) ──
                                      if ('href' in child) {
                                        const gc = child as SubSubItem;
                                        const childActive = isActive(gc.href);
                                        return (
                                          <Link
                                            key={gc.href}
                                            href={gc.href}
                                            onClick={() => { setMobileOpen(false); setSearch(''); }}
                                            className={`flex items-center gap-2 rounded-md text-[11px] my-px py-1.5 px-3 pl-14 transition-colors ${
                                              childActive
                                                ? 'text-[#FF6B1A] bg-[#FFF1E8] font-semibold'
                                                : 'text-[#6B7280] hover:bg-gray-100 hover:text-[#111827]'
                                            }`}
                                          >
                                            <span className={`w-1 h-1 rounded-full flex-shrink-0 ${childActive ? 'bg-[#FF6B1A]' : 'bg-gray-300'}`} />
                                            {highlightLabel(gc.label)}
                                          </Link>
                                        );
                                      }

                                      return null;
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          // ── Sub-item biasa (punya href) ──
                          const subActive = isActive(sub.href!);
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href!}
                              onClick={() => { setMobileOpen(false); setSearch(''); }}
                              className={`flex items-center gap-2.5 rounded-md text-[12px] my-px transition-colors ${
                                isElementHeader
                                  ? `py-2 px-3 pl-8 font-semibold tracking-wide ${
                                      subActive
                                        ? 'text-[#FF6B1A] bg-[#FFF1E8]/70'
                                        : 'text-[#374151] hover:bg-gray-100/70 hover:text-[#111827]'
                                    }`
                                  : `py-1.5 px-3 pl-11 ${
                                      subActive
                                        ? 'text-[#FF6B1A] bg-[#FFF1E8]/60 font-medium'
                                        : 'text-[#6B7280] hover:bg-gray-100/60 hover:text-[#111827]'
                                    }`
                              }`}
                            >
                              {!isElementHeader && (
                                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${subActive ? 'bg-[#FF6B1A]' : 'bg-gray-300'}`} />
                              )}
                              {highlightLabel(sub.label)}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-[#E5E7EB] bg-[#FAFAFA]/50 p-2 space-y-0.5">
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              pathname === '/profile'
                ? 'bg-[#FFF1E8] text-[#FF6B1A] font-semibold'
                : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#111827]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </Link>
          <Link
            href="/settings"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
              pathname === '/settings'
                ? 'bg-[#FFF1E8] text-[#FF6B1A] font-semibold'
                : 'text-[#4B5563] hover:bg-gray-100 hover:text-[#111827]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </Link>
        </div>
      </aside>
    </>
  );
}
