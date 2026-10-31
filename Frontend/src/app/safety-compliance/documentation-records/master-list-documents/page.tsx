'use client';

/**
 * Master List Documents
 * Hierarki 4 level: Manual → SOP → Instruksi Kerja → Formulir
 * Dikelompokkan per Departemen.
 *
 * Cara input referensi:
 *  - Pilih Departemen → Pilih Jenis Dokumen
 *  - Parent OPSIONAL untuk semua jenis (bisa berdiri sendiri)
 *  - Jika diisi, parent harus memiliki level hierarki lebih tinggi
 *    (contoh: IK bisa merujuk ke SOP atau Manual, Formulir bisa merujuk ke IK/SOP/Manual)
 *  - MANUAL tidak bisa punya parent (selalu root)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  departmentsApi,
  documentsApi,
  Department,
  Document as Doc,
  JenisDokumen,
  CreateDocumentDto,
} from '@/lib/api';

// ── Constants ──────────────────────────────────────────────────────────────

const JENIS_OPTIONS: { label: string; value: JenisDokumen; short: string }[] = [
  { label: 'Manual', value: 'MANUAL', short: 'MAN' },
  { label: 'SOP', value: 'SOP', short: 'SOP' },
  { label: 'Instruksi Kerja (IK)', value: 'INSTRUKSI_KERJA', short: 'IK' },
  { label: 'Formulir', value: 'FORMULIR', short: 'FRM' },
];

const PARENT_JENIS: Record<JenisDokumen, JenisDokumen | null> = {
  MANUAL: null,
  SOP: 'MANUAL',
  INSTRUKSI_KERJA: 'SOP',
  FORMULIR: 'INSTRUKSI_KERJA',
};

const JENIS_LABEL: Record<JenisDokumen, string> = {
  MANUAL: 'Manual',
  SOP: 'SOP',
  INSTRUKSI_KERJA: 'Instruksi Kerja',
  FORMULIR: 'Formulir',
};

/** Warna badge per jenis dokumen — lebih tebal/solid */
const JENIS_BADGE: Record<JenisDokumen, { bg: string; text: string; dot: string }> = {
  MANUAL:         { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  SOP:            { bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500' },
  INSTRUKSI_KERJA:{ bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-500' },
  FORMULIR:       { bg: 'bg-emerald-100',text: 'text-emerald-800',dot: 'bg-emerald-500' },
};

/** Warna garis connector tree per level */
const LEVEL_LINE_COLOR = ['border-purple-300', 'border-blue-300', 'border-amber-300', 'border-emerald-300'];

const STATUS_DOK_OPTIONS = ['ASLI', 'SALINAN', 'ASLI_REVISI', 'SALINAN_REVISI'];
const STATUS_DOK_LABEL: Record<string, string> = {
  ASLI: 'Asli', SALINAN: 'Salinan', ASLI_REVISI: 'Asli-Revisi', SALINAN_REVISI: 'Salinan-Revisi',
};
const STATUS_DIST_OPTIONS = ['TERKENDALI', 'TIDAK_TERKENDALI'];
const STATUS_VAL_OPTIONS = ['BERLAKU', 'TIDAK_BERLAKU', 'PEMUSNAHAN'];

const STATUS_VAL_STYLE: Record<string, string> = {
  BERLAKU: 'bg-green-100 text-green-700 border border-green-200',
  TIDAK_BERLAKU: 'bg-red-100 text-red-700 border border-red-200',
  PEMUSNAHAN: 'bg-gray-100 text-gray-600 border border-gray-200',
};

// Hierarki icon SVG per level
const LEVEL_ICON: Record<JenisDokumen, React.ReactNode> = {
  MANUAL: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  SOP: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  INSTRUKSI_KERJA: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="12" y2="17" />
    </svg>
  ),
  FORMULIR: (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="15" x2="11" y2="15" />
    </svg>
  ),
};

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function JenisBadge({ jenis, size = 'md' }: { jenis: JenisDokumen; size?: 'sm' | 'md' | 'lg' }) {
  const c = JENIS_BADGE[jenis];
  const sizeClass = size === 'sm'
    ? 'px-1.5 py-0.5 text-[10px]'
    : size === 'lg'
    ? 'px-3 py-1 text-[12px]'
    : 'px-2 py-0.5 text-[11px]';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider ${c.bg} ${c.text} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {JENIS_LABEL[jenis]}
    </span>
  );
}

function StatusValBadge({ val }: { val: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${STATUS_VAL_STYLE[val] ?? 'bg-gray-100 text-gray-500'}`}>
      {val.replace('_', ' ')}
    </span>
  );
}

// ── Build tree dari flat list ──────────────────────────────────────────────

interface TreeNode extends Doc {
  treeChildren: TreeNode[];
}

function buildTree(docs: Doc[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  docs.forEach((d) => map.set(d.id, { ...d, treeChildren: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.treeChildren.push(node);
    } else {
      roots.push(node);
    }
  });
  // Sort by jenis order then nomor
  const jenisOrder = ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'];
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      const ji = jenisOrder.indexOf(a.jenisDokumen) - jenisOrder.indexOf(b.jenisDokumen);
      if (ji !== 0) return ji;
      return a.nomorDokumen.localeCompare(b.nomorDokumen);
    });
    nodes.forEach((n) => sortNodes(n.treeChildren));
  };
  sortNodes(roots);
  return roots;
}

// ── Toast ──────────────────────────────────────────────────────────────────

function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[600] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[14px] font-medium ${type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'success'
        ? <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        : <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>}
      {msg}
    </div>
  );
}

// ── Tree Node Component (recursive) ───────────────────────────────────────

function TreeItem({
  node,
  level,
  isLast,
  parentLines,
  expanded,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  selectedId,
}: {
  node: TreeNode;
  level: number;         // 0=Manual, 1=SOP, 2=IK, 3=Form
  isLast: boolean;       // apakah anak terakhir di parent-nya
  parentLines: boolean[]; // array panduan garis vertikal dari ancestor
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (doc: Doc) => void;
  onEdit: (doc: Doc) => void;
  onDelete: (doc: Doc) => void;
  canEdit: boolean;
  canDelete: boolean;
  selectedId?: string;
}) {
  const hasChildren = node.treeChildren.length > 0;
  const isOpen = expanded.has(node.id);
  const isSelected = selectedId === node.id;
  const c = JENIS_BADGE[node.jenisDokumen];
  const lineColor = LEVEL_LINE_COLOR[Math.min(level, 3)];

  return (
    <div>
      {/* Row */}
      <div
        className={`group flex items-stretch min-h-[44px] cursor-pointer rounded-xl transition-all duration-150 ${
          isSelected
            ? 'bg-orange-50 ring-1 ring-[#FF6B1A]/30'
            : 'hover:bg-gray-50'
        }`}
        onClick={() => onSelect(node)}
      >
        {/* ── Connector lines kiri ── */}
        <div className="flex flex-shrink-0" style={{ width: `${level * 28}px` }}>
          {parentLines.map((showLine, i) => (
            <div
              key={i}
              className="w-7 flex-shrink-0 flex justify-center"
            >
              {showLine && (
                <div className={`w-px h-full border-l-2 border-dashed ${LEVEL_LINE_COLOR[Math.min(i, 3)]} opacity-40`} />
              )}
            </div>
          ))}
        </div>

        {/* ── L-connector untuk node saat ini ── */}
        {level > 0 && (
          <div className="w-7 flex-shrink-0 flex flex-col items-center relative">
            {/* Garis vertikal atas */}
            <div className={`w-px flex-1 border-l-2 border-dashed ${lineColor} opacity-40`} />
            {/* Garis horizontal */}
            <div className={`absolute top-1/2 left-0 w-full h-0 border-t-2 border-dashed ${lineColor} opacity-40`} style={{ transform: 'translateY(-1px)' }} />
            {/* Garis vertikal bawah (hanya jika bukan anak terakhir) */}
            {!isLast && (
              <div className={`w-px flex-1 border-l-2 border-dashed ${lineColor} opacity-40`} />
            )}
            {isLast && <div className="flex-1" />}
          </div>
        )}

        {/* ── Konten row ── */}
        <div className="flex-1 flex items-center gap-2 py-2 pr-3 min-w-0">
          {/* Toggle button */}
          <button
            onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
            className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
              hasChildren
                ? 'hover:bg-[#FF6B1A]/10 text-[#9CA3AF] hover:text-[#FF6B1A]'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <svg
              width="12" height="12" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth="2.5"
              className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          {/* Ikon dokumen */}
          <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>
            {LEVEL_ICON[node.jenisDokumen]}
          </div>

          {/* Badge jenis + nama */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <JenisBadge jenis={node.jenisDokumen} size="sm" />
            <span className={`text-[13px] font-semibold truncate ${isSelected ? 'text-[#FF6B1A]' : 'text-[#1F2937]'}`}>
              {node.namaDokumen}
            </span>
          </div>

          {/* Meta — nomor, revisi, status */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <span className="text-[11px] text-[#6B7280] font-mono bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
              {node.nomorDokumen}
            </span>
            <span className="text-[11px] text-[#9CA3AF]">Rev.{node.revisi ?? '00'}</span>
            <StatusValBadge val={node.statusValidasi} />
            <span className="text-[11px] text-[#9CA3AF] hidden lg:inline">{fmt(node.tanggalTerbit)}</span>
          </div>

          {/* Aksi hover */}
          {(canEdit || canDelete) && (
            <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              {canEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                  className="p-1.5 text-[#6B7280] hover:text-[#FF6B1A] hover:bg-orange-50 rounded-lg transition-colors"
                  title="Edit"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(node); }}
                  className="p-1.5 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Hapus"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Children rekursif */}
      {isOpen && hasChildren && (
        <div>
          {node.treeChildren.map((child, idx) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isLast={idx === node.treeChildren.length - 1}
              parentLines={[...parentLines, !isLast]}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              canEdit={canEdit}
              canDelete={canDelete}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Form State ─────────────────────────────────────────────────────────────

interface FormState {
  departemenId: string;
  jenisDokumen: JenisDokumen | '';
  namaDokumen: string;
  nomorDokumen: string;
  revisi: string;
  tanggalTerbit: string;
  statusDokumen: string;
  statusDistribusi: string;
  statusValidasi: string;
  parentId: string;
}

const EMPTY_FORM: FormState = {
  departemenId: '',
  jenisDokumen: '',
  namaDokumen: '',
  nomorDokumen: '',
  revisi: '00',
  tanggalTerbit: '',
  statusDokumen: 'ASLI',
  statusDistribusi: 'TERKENDALI',
  statusValidasi: 'BERLAKU',
  parentId: '',
};

// ── Form Modal ─────────────────────────────────────────────────────────────

function DocFormModal({
  isOpen,
  onClose,
  onSave,
  departments,
  editDoc,
  user,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fd: FormData, dto: CreateDocumentDto, hasFile: boolean) => Promise<void>;
  departments: Department[];
  editDoc: Doc | null;
  user?: any;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [parentCandidates, setParentCandidates] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editDoc) {
      setForm({
        departemenId: editDoc.departemenId,
        jenisDokumen: editDoc.jenisDokumen,
        namaDokumen: editDoc.namaDokumen,
        nomorDokumen: editDoc.nomorDokumen,
        revisi: editDoc.revisi ?? '00',
        tanggalTerbit: editDoc.tanggalTerbit.split('T')[0],
        statusDokumen: editDoc.statusDokumen,
        statusDistribusi: editDoc.statusDistribusi,
        statusValidasi: editDoc.statusValidasi,
        parentId: editDoc.parentId ?? '',
      });
    } else {
      // Auto-prefill departemen user jika tersedia
      const userDept = departments.find(
        (d) =>
          d.id === user?.departmentId ||
          d.name?.toLowerCase() === user?.departemen?.toLowerCase() ||
          d.code?.toLowerCase() === user?.departemen?.toLowerCase()
      );
      setForm({
        ...EMPTY_FORM,
        departemenId: userDept?.id || '',
      });
    }
    setFile(null);
    setErrors({});
  }, [isOpen, editDoc, user, departments]);

  // Load parent candidates: semua dokumen di departemen yang sama dengan level lebih tinggi
  // MANUAL tidak bisa punya parent. SOP bisa merujuk ke MANUAL.
  // IK bisa merujuk ke SOP atau MANUAL. Formulir bisa merujuk ke IK, SOP, atau MANUAL.
  const JENIS_ORDER_FE = ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'] as const;

  useEffect(() => {
    if (!form.jenisDokumen || !form.departemenId || form.jenisDokumen === 'MANUAL') {
      setParentCandidates([]);
      return;
    }
    const myLevel = JENIS_ORDER_FE.indexOf(form.jenisDokumen as any);
    // Ambil semua dokumen di departemen ini, lalu filter di client
    documentsApi.getAll({ departemenId: form.departemenId })
      .then((docs) => {
        const candidates = docs.filter((d) => {
          const parentLevel = JENIS_ORDER_FE.indexOf(d.jenisDokumen as any);
          return parentLevel < myLevel && d.id !== editDoc?.id;
        });
        // Sort: level paling dekat dulu, lalu nomor dokumen
        candidates.sort((a, b) => {
          const la = JENIS_ORDER_FE.indexOf(a.jenisDokumen as any);
          const lb = JENIS_ORDER_FE.indexOf(b.jenisDokumen as any);
          if (la !== lb) return lb - la; // level lebih dekat dulu
          return a.nomorDokumen.localeCompare(b.nomorDokumen);
        });
        setParentCandidates(candidates);
      })
      .catch(() => setParentCandidates([]));
  }, [form.jenisDokumen, form.departemenId, editDoc?.id]);

  const set = (key: keyof FormState, val: string) => {
    setForm((p) => {
      const next = { ...p, [key]: val };
      if (key === 'departemenId' || key === 'jenisDokumen') next.parentId = '';
      return next;
    });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.departemenId) e.departemenId = 'Wajib pilih departemen';
    if (!form.jenisDokumen) e.jenisDokumen = 'Wajib pilih jenis dokumen';
    if (!form.namaDokumen.trim()) e.namaDokumen = 'Wajib diisi';
    if (!form.nomorDokumen.trim()) e.nomorDokumen = 'Wajib diisi';
    if (!form.tanggalTerbit) e.tanggalTerbit = 'Wajib diisi';
    // Parent opsional — tidak ada validasi mandatory
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const dto: CreateDocumentDto = {
        departemenId: form.departemenId,
        jenisDokumen: form.jenisDokumen as JenisDokumen,
        namaDokumen: form.namaDokumen.trim(),
        nomorDokumen: form.nomorDokumen.trim(),
        revisi: form.revisi.trim() || '00',
        tanggalTerbit: form.tanggalTerbit,
        statusDokumen: form.statusDokumen as any,
        statusDistribusi: form.statusDistribusi as any,
        statusValidasi: form.statusValidasi as any,
        ...(form.parentId ? { parentId: form.parentId } : {}),
      };
      const fd = new FormData();
      fd.append('departemenId', form.departemenId);
      fd.append('jenisDokumen', form.jenisDokumen);
      fd.append('namaDokumen', form.namaDokumen.trim());
      fd.append('nomorDokumen', form.nomorDokumen.trim());
      fd.append('revisi', form.revisi.trim() || '00');
      fd.append('tanggalTerbit', form.tanggalTerbit);
      fd.append('statusDokumen', form.statusDokumen);
      fd.append('statusDistribusi', form.statusDistribusi);
      fd.append('statusValidasi', form.statusValidasi);
      if (form.parentId) fd.append('parentId', form.parentId);
      if (file) fd.append('file', file);
      await onSave(fd, dto, !!file);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // Parent bisa diisi untuk semua jenis kecuali MANUAL (MANUAL = root)
  const canHaveParent = form.jenisDokumen && form.jenisDokumen !== 'MANUAL';
  const hasParentCandidates = parentCandidates.length > 0;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-[15px] text-[#1F2937]">
              {editDoc ? 'Edit Record Dokumen' : '+ Tambah Record Dokumen'}
            </h2>
            <p className="text-[11px] text-[#9CA3AF] mt-0.5">
              Parent opsional — dokumen boleh berdiri sendiri di departemen
            </p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] p-1">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Panduan hierarki visual */}
        <div className="px-6 pt-4 pb-0 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="flex-shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-blue-700 font-medium mr-1">Hierarki (opsional):</span>
            {(['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'] as JenisDokumen[]).map((j, i, arr) => (
              <React.Fragment key={j}>
                <JenisBadge jenis={j} size="sm" />
                {i < arr.length - 1 && <span className="text-blue-300">›</span>}
              </React.Fragment>
            ))}
            <span className="text-blue-500 ml-1">— boleh dilewati</span>
          </div>
        </div>

        {/* Body form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">

            {/* Step 1: Departemen + Jenis */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="1. Pilih Departemen" required error={errors.departemenId}>
                <select value={form.departemenId} onChange={(e) => set('departemenId', e.target.value)}
                  className={inputCls(!!errors.departemenId)}>
                  <option value="">-- Pilih Departemen --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="2. Jenis Dokumen" required error={errors.jenisDokumen}>
                <select value={form.jenisDokumen} onChange={(e) => set('jenisDokumen', e.target.value as JenisDokumen)}
                  className={inputCls(!!errors.jenisDokumen)}>
                  <option value="">-- Pilih Jenis --</option>
                  {JENIS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Step 2: Parent — muncul jika bukan MANUAL, tapi opsional */}
            {canHaveParent && (
              <Field
                label="3. Merujuk ke Dokumen Parent (opsional)"
                hint={
                  !form.departemenId
                    ? '← Pilih departemen dulu'
                    : !hasParentCandidates
                    ? 'Belum ada dokumen Manual/SOP/IK di departemen ini — bisa diisi nanti'
                    : 'Opsional — boleh dikosongkan jika dokumen berdiri sendiri'
                }
              >
                <select
                  value={form.parentId}
                  onChange={(e) => set('parentId', e.target.value)}
                  disabled={!form.departemenId}
                  className={`${inputCls(false)} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">— Tanpa Parent (berdiri sendiri) —</option>
                  {parentCandidates.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{JENIS_LABEL[d.jenisDokumen]}] [{d.nomorDokumen}] {d.namaDokumen}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            {/* Nama + Nomor */}
            <Field label="4. Nama / Judul Dokumen" required error={errors.namaDokumen}>
              <input type="text" value={form.namaDokumen} onChange={(e) => set('namaDokumen', e.target.value)}
                placeholder={`Contoh: ${form.jenisDokumen === 'MANUAL' ? 'Manual SMK3 PT. QMB' : form.jenisDokumen === 'SOP' ? 'SOP Penanganan B3' : form.jenisDokumen === 'INSTRUKSI_KERJA' ? 'IK Penggunaan APAR' : 'Form Inspeksi Harian'}`}
                className={inputCls(!!errors.namaDokumen)} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Nomor Dokumen" required error={errors.nomorDokumen}>
                <input type="text" value={form.nomorDokumen} onChange={(e) => set('nomorDokumen', e.target.value)}
                  placeholder={form.jenisDokumen === 'MANUAL' ? 'MAN-HSE-001' : form.jenisDokumen === 'SOP' ? 'SOP-HSE-001' : form.jenisDokumen === 'INSTRUKSI_KERJA' ? 'IK-HSE-001' : 'FRM-HSE-001'}
                  className={inputCls(!!errors.nomorDokumen)} />
              </Field>
              <Field label="Nomor Revisi">
                <input type="text" value={form.revisi} onChange={(e) => set('revisi', e.target.value)}
                  placeholder="00" className={inputCls(false)} />
              </Field>
            </div>

            <Field label="Tanggal Terbit" required error={errors.tanggalTerbit}>
              <input type="date" value={form.tanggalTerbit} onChange={(e) => set('tanggalTerbit', e.target.value)}
                className={inputCls(!!errors.tanggalTerbit)} />
            </Field>

            <div className="grid grid-cols-3 gap-3">
              <Field label="Status Dokumen" required>
                <select value={form.statusDokumen} onChange={(e) => set('statusDokumen', e.target.value)}
                  className={inputCls(false)}>
                  {STATUS_DOK_OPTIONS.map((o) => <option key={o} value={o}>{STATUS_DOK_LABEL[o] ?? o}</option>)}
                </select>
              </Field>
              <Field label="Distribusi" required>
                <select value={form.statusDistribusi} onChange={(e) => set('statusDistribusi', e.target.value)}
                  className={inputCls(false)}>
                  {STATUS_DIST_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                </select>
              </Field>
              <Field label="Validasi" required>
                <select value={form.statusValidasi} onChange={(e) => set('statusValidasi', e.target.value)}
                  className={inputCls(false)}>
                  {STATUS_VAL_OPTIONS.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
                </select>
              </Field>
            </div>

            {/* Upload file */}
            <Field label="Upload Dokumen (PDF/Word)" hint="Opsional">
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-[12px] font-semibold border border-gray-200 rounded-lg hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors">
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Pilih File
                </button>
                {file ? (
                  <div className="flex items-center gap-2 text-[12px] text-[#1F2937]">
                    <span className="truncate max-w-[160px]">{file.name}</span>
                    <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="text-[#9CA3AF] hover:text-red-500">✕</button>
                  </div>
                ) : editDoc?.fileUrl ? (
                  <a href={editDoc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="text-[12px] text-[#FF6B1A] hover:underline">File saat ini</a>
                ) : (
                  <span className="text-[12px] text-[#9CA3AF]">Belum ada file</span>
                )}
              </div>
            </Field>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-[13px] font-semibold text-[#1F2937] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#FF6B1A] rounded-xl hover:bg-[#E85D0F] transition-colors disabled:opacity-60">
            {saving ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>Menyimpan...</>
            ) : editDoc ? 'Simpan Perubahan' : '+ Tambah Record'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Field helper ───────────────────────────────────────────────────────────

function Field({ label, required, error, hint, children }: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wide text-[#1F2937] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
      {hint && !error && <p className="text-[#9CA3AF] text-[11px] mt-1">{hint}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full px-3.5 py-2.5 text-[13px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A] transition-colors ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;
}

// ── Detail Panel ───────────────────────────────────────────────────────────

function DetailPanel({
  doc,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  doc: Doc | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  if (!doc) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[450]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[460] flex flex-col">
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <JenisBadge jenis={doc.jenisDokumen} size="md" />
            </div>
            <h3 className="font-bold text-[16px] text-[#1F2937] leading-snug">{doc.namaDokumen}</h3>
            <p className="text-[12px] text-[#9CA3AF] mt-1 font-mono">{doc.nomorDokumen}</p>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#1F2937] flex-shrink-0 p-1">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-3">
            {[
              { label: 'Departemen', value: doc.departemen?.name ?? '—' },
              { label: 'Jenis', value: <JenisBadge jenis={doc.jenisDokumen} size="md" /> },
              { label: 'Nomor Revisi', value: `Rev. ${doc.revisi ?? '00'}` },
              { label: 'Tanggal Terbit', value: fmt(doc.tanggalTerbit) },
              { label: 'Status Dokumen', value: STATUS_DOK_LABEL[doc.statusDokumen] ?? doc.statusDokumen },
              { label: 'Distribusi', value: doc.statusDistribusi.replace('_', ' ') },
              { label: 'Validasi', value: <StatusValBadge val={doc.statusValidasi} /> },
              {
                label: 'Parent',
                value: doc.parent
                  ? <span className="text-[13px]">[{doc.parent.nomorDokumen}] {doc.parent.namaDokumen}</span>
                  : <span className="text-[#9CA3AF]">— (dokumen root)</span>,
              },
              {
                label: 'File',
                value: doc.fileUrl
                  ? <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#FF6B1A] hover:underline text-[13px]">Lihat File</a>
                  : <span className="text-[#9CA3AF]">Tidak ada</span>,
              },
              { label: 'Dibuat Oleh', value: doc.createdBy?.nama ?? '—' },
              { label: 'Tanggal Dibuat', value: fmt(doc.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#9CA3AF] w-28 flex-shrink-0 mt-0.5">{label}</span>
                <span className="text-[13px] text-[#1F2937] font-medium flex-1">{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          {canEdit && (
            <button onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-[#FF6B1A] rounded-xl hover:bg-[#E85D0F] transition-colors">
              Edit
            </button>
          )}
          {canDelete && (
            <button onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
              Hapus
            </button>
          )}
          {!canEdit && !canDelete && (
            <button onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-[#1F2937] bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Tutup
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function MasterListDocumentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor' || isAdmin;
  const canEditDoc = (doc: Doc) => isAdmin || isSupervisor || doc.createdById === user?.id;
  const canDeleteDoc = (_doc: Doc) => isAdmin;

  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDocs, setAllDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterDept, setFilterDept] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [search, setSearch] = useState('');

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Doc | null>(null);
  const [detailDoc, setDetailDoc] = useState<Doc | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [depts, docs] = await Promise.all([
        departmentsApi.getAll(),
        documentsApi.getAll(),
      ]);
      setDepartments(depts);
      setAllDocs(docs);
      // Auto-expand semua departemen
      setExpanded(new Set(depts.map((d) => `dept-${d.id}`)));
    } catch (err: any) {
      showToast(err.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Filter ──
  const filtered = allDocs.filter((d) => {
    if (filterDept && d.departemenId !== filterDept) return false;
    if (filterJenis && d.jenisDokumen !== filterJenis) return false;
    if (search) {
      const q = search.toLowerCase();
      return d.namaDokumen.toLowerCase().includes(q) || d.nomorDokumen.toLowerCase().includes(q);
    }
    return true;
  });

  const useFlat = !!(search || filterJenis);

  const byDept = departments
    .map((dept) => {
      const deptDocs = filtered.filter((d) => d.departemenId === dept.id);
      const tree = buildTree(deptDocs);
      return { dept, tree, count: deptDocs.length };
    })
    .filter((g) => g.count > 0);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const ids = new Set([
      ...departments.map((d) => `dept-${d.id}`),
      ...allDocs.map((d) => d.id),
    ]);
    setExpanded(ids);
  };

  const collapseAll = () => setExpanded(new Set());

  // ── Save ──
  const handleSave = async (fd: FormData, dto: CreateDocumentDto, hasFile: boolean) => {
    try {
      if (editDoc) {
        if (hasFile) {
          try {
            await documentsApi.updateWithFile(editDoc.id, fd);
          } catch (fileErr: any) {
            console.warn('updateWithFile failed, fallback to JSON update:', fileErr);
            await documentsApi.update(editDoc.id, dto);
          }
        } else {
          try {
            await documentsApi.update(editDoc.id, dto);
          } catch (jsonErr: any) {
            console.warn('update(dto) failed, fallback to updateWithFile:', jsonErr);
            await documentsApi.updateWithFile(editDoc.id, fd);
          }
        }
        showToast('Dokumen berhasil diperbarui', 'success');
      } else {
        if (hasFile) {
          try {
            await documentsApi.createWithFile(fd);
            showToast('Dokumen berhasil ditambahkan', 'success');
          } catch (fileErr: any) {
            console.warn('createWithFile failed, fallback to JSON create:', fileErr);
            await documentsApi.create(dto);
            showToast('Dokumen berhasil ditambahkan (file tidak dapat diunggah: izin server dibatasi)', 'success');
          }
        } else {
          try {
            await documentsApi.create(dto);
            showToast('Dokumen berhasil ditambahkan', 'success');
          } catch (jsonErr: any) {
            console.warn('create(dto) failed, fallback to createWithFile:', jsonErr);
            await documentsApi.createWithFile(fd);
            showToast('Dokumen berhasil ditambahkan', 'success');
          }
        }
      }
      await fetchData();
      setDetailDoc(null);
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan dokumen', 'error');
      throw err;
    }
  };

  // ── Delete ──
  const handleDelete = async (doc: Doc) => {
    if (!confirm(`Hapus dokumen "${doc.namaDokumen}"?\n\nSemua dokumen turunannya akan kehilangan parent.`)) return;
    try {
      await documentsApi.delete(doc.id);
      showToast('Dokumen berhasil dihapus', 'success');
      if (detailDoc?.id === doc.id) setDetailDoc(null);
      await fetchData();
    } catch (err: any) {
      showToast(err.message || 'Gagal menghapus', 'error');
    }
  };

  const totalByJenis = (j: JenisDokumen) => allDocs.filter((d) => d.jenisDokumen === j).length;

  // ── Export Excel (print window) ──
  const handleExport = () => {
    const exportDocs = filtered.length > 0 ? filtered : allDocs;
    const jenisOrder = ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'];
    const sorted = [...exportDocs].sort((a, b) => {
      const di = jenisOrder.indexOf(a.jenisDokumen) - jenisOrder.indexOf(b.jenisDokumen);
      if (di !== 0) return di;
      return a.nomorDokumen.localeCompare(b.nomorDokumen);
    });

    const rows = sorted.map((d, i) => `
      <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
        <td>${i + 1}</td>
        <td>${d.nomorDokumen}</td>
        <td>${JENIS_LABEL[d.jenisDokumen]}</td>
        <td>${d.namaDokumen}</td>
        <td>${d.revisi ?? '00'}</td>
        <td>${d.departemen?.name ?? '—'}</td>
        <td>${new Date(d.tanggalTerbit).toLocaleDateString('id-ID')}</td>
        <td>${STATUS_DOK_LABEL[d.statusDokumen] ?? d.statusDokumen}</td>
        <td>${d.statusDistribusi.replace('_', ' ')}</td>
        <td>${d.statusValidasi.replace('_', ' ')}</td>
        <td>${d.parent?.nomorDokumen ?? '—'}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Master List Documents</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;color:#1f2937;padding:16px}
      @media print{body{padding:4mm;font-size:10px}.no-print{display:none!important}@page{margin:8mm;size:A3 landscape}}
      .header{background:#1F2937;color:white;padding:14px 18px;margin-bottom:12px;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
      .header h1{font-size:16px;margin:0 0 3px}
      .header p{font-size:10px;color:#9ca3af;margin:0}
      .print-btn{background:#FF6B1A;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;margin-bottom:12px}
      table{border-collapse:collapse;width:100%;min-width:900px}
      th{background:#1F2937;color:white;padding:8px 10px;text-align:left;font-size:11px;position:sticky;top:0}
      td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:middle}
    </style></head><body>
    <div class="header">
      <div><h1>Master List Documents</h1><p>Dicetak: ${new Date().toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' })}</p></div>
      <div style="text-align:right"><p style="font-size:14px;font-weight:700;color:#FF6B1A">${sorted.length} Dokumen</p><p>SMK3 Safety System</p></div>
    </div>
    <button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save as PDF</button>
    <table>
      <thead><tr>
        <th>#</th><th>Nomor</th><th>Jenis</th><th>Nama Dokumen</th><th>Revisi</th>
        <th>Departemen</th><th>Tgl Terbit</th><th>Status Dok</th><th>Distribusi</th><th>Validasi</th><th>Parent</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </body></html>`;

    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  };

  // ── Flat tree untuk search/filter ──
  const flatFiltered = (() => {
    const order = ['MANUAL', 'SOP', 'INSTRUKSI_KERJA', 'FORMULIR'];
    return [...filtered].sort((a, b) => {
      const di = order.indexOf(a.jenisDokumen) - order.indexOf(b.jenisDokumen);
      if (di !== 0) return di;
      return a.nomorDokumen.localeCompare(b.nomorDokumen);
    });
  })();

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      {/* Page Header */}
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-2">
            Safety Compliance › Documentation &amp; Records
          </p>
          <h1 className="font-bold text-[#1F2937] text-[clamp(22px,4vw,34px)] leading-tight">
            Master List Documents
          </h1>
          {/* <p className="text-[#6B7280] text-[13px] mt-1.5">
            Daftar induk seluruh dokumen K3 — hierarki 4 level per departemen
          </p> */}

          {/* Stat chips + legend hierarki
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {JENIS_OPTIONS.map((j, i) => {
              const c = JENIS_BADGE[j.value];
              return (
                <div key={j.value} className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${c.bg} ${c.text}`}>
                    {LEVEL_ICON[j.value]}
                  </div>
                  <div>
                    <div className="text-white font-bold text-[13px]">{totalByJenis(j.value)}</div>
                    <div className="text-[10px] text-[#6B7280]">{j.label}</div>
                  </div>
                  {i < JENIS_OPTIONS.length - 1 && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF6B1A" strokeWidth="2.5">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  )}
                </div>
              );
            })}
            <div className="ml-auto flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <span className="text-[#6B7280] text-[12px]">Total Dokumen</span>
              <span className="text-white font-bold text-[18px]">{allDocs.length}</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-8">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 mb-5">
          {/* Row 1: Search + Export + Tambah */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama / nomor dokumen..."
                className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Export button */}
            <button
              onClick={() => handleExport()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E7EB] text-[#1F2937] text-[13px] font-semibold rounded-xl hover:border-green-400 hover:text-green-700 transition-colors whitespace-nowrap"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export
            </button>

            {/* Tambah Record */}
            <button
              onClick={() => { setEditDoc(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B1A] text-white text-[13px] font-semibold rounded-xl hover:bg-[#E85D0F] transition-colors whitespace-nowrap shadow-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Tambah Record
            </button>
          </div>

          {/* Row 2: Filter dropdowns */}
          <div className="flex flex-wrap gap-3">
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="py-2.5 px-3.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-colors">
              <option value="">Semua Departemen</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>

            <select value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}
              className="py-2.5 px-3.5 text-[13px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] transition-colors">
              <option value="">Semua Jenis</option>
              {JENIS_OPTIONS.map((j) => <option key={j.value} value={j.value}>{j.label}</option>)}
            </select>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-[12px] text-[#6B7280]">
            {loading ? 'Memuat data...' : `Menampilkan ${filtered.length} dokumen${search || filterDept || filterJenis ? ` dari ${allDocs.length} total` : ''}`}
          </p>
          {isAdmin ? (
            <span className="text-[11px] px-2.5 py-0.5 bg-[#FF6B1A]/10 text-[#FF6B1A] rounded-full font-semibold border border-[#FF6B1A]/20">
              Mode Admin
            </span>
          ) : isSupervisor ? (
            <span className="text-[11px] px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold border border-blue-200">
              Mode Supervisor
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full font-semibold border border-gray-200">
              Mode User
            </span>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-3 shadow-sm">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-11 bg-gray-50 rounded-xl animate-pulse" style={{ marginLeft: `${(i % 4) * 28}px` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-16 px-6 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#E5E7EB" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <p className="font-semibold text-[#1F2937] text-[14px] mb-1">
              {search || filterDept || filterJenis ? 'Tidak ada dokumen yang cocok' : 'Belum ada dokumen'}
            </p>
            <p className="text-[#6B7280] text-[13px]">
              {search || filterDept || filterJenis ? 'Coba ubah filter' : 'Klik "Tambah Dokumen" untuk mulai.'}
            </p>
          </div>
        ) : useFlat ? (
          /* ── Flat view saat search/filter jenis aktif ── */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
              <p className="text-[11px] text-[#6B7280] font-semibold uppercase tracking-wide">
                Hasil Pencarian / Filter — {flatFiltered.length} dokumen
              </p>
            </div>
            <div className="p-3">
              {flatFiltered.map((doc) => {
                const c = JENIS_BADGE[doc.jenisDokumen];
                return (
                  <div key={doc.id}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${detailDoc?.id === doc.id ? 'bg-orange-50 ring-1 ring-[#FF6B1A]/20' : 'hover:bg-gray-50'}`}
                    onClick={() => setDetailDoc(doc)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg} ${c.text}`}>
                      {LEVEL_ICON[doc.jenisDokumen]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <JenisBadge jenis={doc.jenisDokumen} size="sm" />
                        <span className="text-[13px] font-semibold text-[#1F2937] truncate">{doc.namaDokumen}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#9CA3AF]">
                        <span className="font-mono">{doc.nomorDokumen}</span>
                        <span>·</span>
                        <span>{doc.departemen?.name}</span>
                        {doc.parent && (
                          <><span>·</span><span className="truncate">↳ {doc.parent.namaDokumen}</span></>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusValBadge val={doc.statusValidasi} />
                      {(canEditDoc(doc) || canDeleteDoc(doc)) && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEditDoc(doc) && (
                            <button onClick={(e) => { e.stopPropagation(); setEditDoc(doc); setModalOpen(true); }}
                              className="p-1.5 text-[#6B7280] hover:text-[#FF6B1A] hover:bg-orange-50 rounded-lg"
                              title="Edit">
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                          {canDeleteDoc(doc) && (
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(doc); }}
                              className="p-1.5 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg"
                              title="Hapus">
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Tree view per departemen ── */
          <div className="space-y-4">
            {byDept.map(({ dept, tree, count }) => {
              if (filterDept && dept.id !== filterDept) return null;
              const deptKey = `dept-${dept.id}`;
              const deptOpen = expanded.has(deptKey);

              return (
                <div key={dept.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Departemen header */}
                  <button
                    onClick={() => toggleExpand(deptKey)}
                    className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
                  >
                    {/* <div className="w-10 h-10 rounded-xl bg-[#FF6B1A] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div> */}
                    <div className="flex-1">
                      <div className="font-bold text-[15px] text-[#1F2937]">{dept.name}</div>
                      <div className="flex items-center gap-3 mt-0.5">
                        {/* <span className="text-[11px] text-[#9CA3AF] font-mono bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{dept.code}</span>
                        <span className="text-[11px] text-[#6B7280]">{count} dokumen</span> */}
                        {/* Mini stat per jenis */}
                        {/* <div className="flex gap-1.5">
                          {JENIS_OPTIONS.map((j) => {
                            const n = filtered.filter((d) => d.departemenId === dept.id && d.jenisDokumen === j.value).length;
                            if (!n) return null;
                            return (
                              <span key={j.value} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${JENIS_BADGE[j.value].bg} ${JENIS_BADGE[j.value].text}`}>
                                {j.short} {n}
                              </span>
                            );
                          })}
                        </div> */}
                      </div>
                    </div>
                    <svg
                      width="16" height="16" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" strokeWidth="2.5"
                      className={`text-[#9CA3AF] transition-transform duration-200 flex-shrink-0 ${deptOpen ? 'rotate-90' : ''}`}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>

                  {/* Tree */}
                  {deptOpen && (
                    <div className="px-4 py-3">
                      {tree.length === 0 ? (
                        <p className="text-[13px] text-[#9CA3AF] py-4 text-center">Tidak ada dokumen di departemen ini</p>
                      ) : (
                        tree.map((node, idx) => (
                          <TreeItem
                            key={node.id}
                            node={node}
                            level={0}
                            isLast={idx === tree.length - 1}
                            parentLines={[]}
                            expanded={expanded}
                            onToggle={toggleExpand}
                            onSelect={setDetailDoc}
                            onEdit={(d) => { setEditDoc(d); setModalOpen(true); }}
                            onDelete={handleDelete}
                            canEdit={canEditDoc(node)}
                            canDelete={canDeleteDoc(node)}
                            selectedId={detailDoc?.id}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <DocFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditDoc(null); }}
        onSave={handleSave}
        departments={departments}
        editDoc={editDoc}
        user={user}
      />

      {/* Detail Panel */}
      <DetailPanel
        doc={detailDoc}
        onClose={() => setDetailDoc(null)}
        onEdit={() => { setEditDoc(detailDoc); setDetailDoc(null); setModalOpen(true); }}
        onDelete={() => { if (detailDoc) handleDelete(detailDoc); }}
        canEdit={detailDoc ? canEditDoc(detailDoc) : false}
        canDelete={detailDoc ? canDeleteDoc(detailDoc) : false}
      />

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
