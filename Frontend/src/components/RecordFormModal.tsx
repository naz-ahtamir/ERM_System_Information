'use client';

import React, { useEffect, useState } from 'react';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
}

interface RecordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: { title: string; data: Record<string, any> }) => Promise<void>;
  fields: FormField[];
  title: string;         // judul modal, mis. "Tambah Record Safety Compliance"
  initialValues?: { title: string; data: Record<string, any> } | null;
  isLoading?: boolean;
}

export function RecordFormModal({
  isOpen,
  onClose,
  onSubmit,
  fields,
  title,
  initialValues,
  isLoading = false,
}: RecordFormModalProps) {
  const [formTitle, setFormTitle] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset saat modal dibuka/ditutup atau initialValues berubah
  useEffect(() => {
    if (isOpen) {
      setFormTitle(initialValues?.title ?? '');
      const initial: Record<string, string> = {};
      fields.forEach((f) => {
        initial[f.key] = String(initialValues?.data?.[f.key] ?? '');
      });
      setFormData(initial);
      setErrors({});
    }
  }, [isOpen, initialValues, fields]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formTitle.trim()) errs['title'] = 'Judul tidak boleh kosong';
    fields.forEach((f) => {
      if (f.required && !formData[f.key]?.trim()) {
        errs[f.key] = `${f.label} tidak boleh kosong`;
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSubmit({ title: formTitle.trim(), data: formData });
      onClose();
    } catch (err) {
      // error ditangani di parent
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <h2 className="font-bold text-[16px] text-[#231f20]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[#6b6560] hover:text-[#231f20] transition-colors p-1"
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Title field */}
          <div>
            <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Judul Record <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Masukkan judul record..."
              className={`w-full px-3.5 py-2.5 text-[14px] text-[#231f20] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                errors['title'] ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb] bg-white'
              }`}
            />
            {errors['title'] && (
              <p className="text-red-500 text-[12px] mt-1">{errors['title']}</p>
            )}
          </div>

          {/* Dynamic fields */}
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block text-[12px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.key] ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  rows={3}
                  className={`w-full px-3.5 py-2.5 text-[14px] text-[#231f20] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors resize-none ${
                    errors[field.key] ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb] bg-white'
                  }`}
                />
              ) : field.type === 'select' ? (
                <select
                  value={formData[field.key] ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className={`w-full px-3.5 py-2.5 text-[14px] text-[#231f20] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                    errors[field.key] ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb] bg-white'
                  }`}
                >
                  <option value="">-- Pilih {field.label} --</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.key] ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className={`w-full px-3.5 py-2.5 text-[14px] text-[#231f20] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f15a22]/30 focus:border-[#f15a22] transition-colors ${
                    errors[field.key] ? 'border-red-400 bg-red-50' : 'border-[#c5c0bb] bg-white'
                  }`}
                />
              )}

              {errors[field.key] && (
                <p className="text-red-500 text-[12px] mt-1">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-lg hover:bg-[#e5e0db] transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={submitting || isLoading}
            className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold text-white bg-[#f15a22] rounded-lg hover:bg-[#d44d1a] transition-colors disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {initialValues ? 'Simpan Perubahan' : 'Tambah Record'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
