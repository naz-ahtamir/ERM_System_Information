"use client";

import { useState, FormEvent } from "react";
import { FormField, FindingStatus } from "@/types/subSubElement";

interface SMK3DataFormProps {
  subSubElementId: string;
  subSubElementTitle: string;
  fields: FormField[];
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: any;
  isEdit?: boolean;
  // Apakah form ini untuk modul inspeksi ketidaksesuaian
  // (yang memerlukan approval workflow)
  hasApprovalWorkflow?: boolean;
  // Auto-fill safety officer dari session
  autoFillSafetyOfficer?: {
    name: string;
    id: string;
  };
}

// Step untuk approval modal
type ApprovalStep = "idle" | "confirm_inpg" | "submitting" | "submitted";

export default function SMK3DataForm({
  subSubElementId,
  subSubElementTitle,
  fields,
  onSuccess,
  onCancel,
  initialData,
  isEdit = false,
  hasApprovalWorkflow = false,
  autoFillSafetyOfficer,
}: SMK3DataFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const data = initialData?.data || {};
    // Auto-fill safety officer if provided
    if (autoFillSafetyOfficer && !isEdit) {
      data.safetyOfficer = `${autoFillSafetyOfficer.name} - ${autoFillSafetyOfficer.id}`;
    }
    return data;
  });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [findingStatus, setFindingStatus] = useState<FindingStatus>(
    initialData?.findingStatus || "INPG"
  );
  const [approvalStep, setApprovalStep] = useState<ApprovalStep>("idle");
  const [approvalNote, setApprovalNote] = useState("");

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFiles(prev => ({ ...prev, [name]: file }));
  };

  // Validasi form sebelum submit
  const validateForm = (): boolean => {
    for (const field of fields) {
      if (field.required && !formData[field.name] && field.type !== "file") {
        setError(`Field "${field.label}" wajib diisi`);
        return false;
      }
      if (
        field.required &&
        field.type === "file" &&
        !files[field.name] &&
        !isEdit
      ) {
        setError(`File "${field.label}" wajib diunggah`);
        return false;
      }
    }
    return true;
  };

  // Dipanggil saat user klik tombol submit utama
  const handleSubmitClick = () => {
    setError(null);
    if (!validateForm()) return;

    if (hasApprovalWorkflow && findingStatus === "INPG" && !isEdit) {
      // Tampilkan modal konfirmasi approval
      setApprovalStep("confirm_inpg");
    } else {
      // CLSD atau edit → langsung submit
      doSubmit(findingStatus, "");
    }
  };

  // Konfirmasi dari modal → lanjut submit dengan approval note
  const handleApprovalConfirm = () => {
    setApprovalStep("submitting");
    doSubmit("INPG", approvalNote);
  };

  const doSubmit = async (status: FindingStatus, note: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("subSubElementId", subSubElementId);
      formDataToSend.append(
        "title",
        formData.judulTemuan ||
          formData.namaInspektur ||
          formData.lokasi ||
          "Data Inspeksi"
      );
      formDataToSend.append("findingStatus", status);
      if (note) formDataToSend.append("approvalNote", note);

      if (isEdit && initialData?.id) {
        formDataToSend.append("id", initialData.id);
      }

      for (const [key, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      }

      for (const [key, file] of Object.entries(files)) {
        if (file) formDataToSend.append(key, file);
      }

      const method = isEdit ? "PUT" : "POST";
      const response = await fetch("/api/smk3-data", {
        method,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menyimpan data");
      }

      setApprovalStep(status === "INPG" ? "submitted" : "idle");

      if (status === "CLSD" || isEdit) {
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
      setApprovalStep("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShow = (field: FormField): boolean => {
    if (!field.showWhen) return true;
    const watchedValue = formData[field.showWhen.field];
    return watchedValue === field.showWhen.value;
    };
    
  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? "";
    const baseClass =
      "w-full px-4 py-2.5 border border-[#d4cfc9] rounded focus:outline-none focus:ring-2 focus:ring-[#f15a22] focus:border-transparent";

    switch (field.type) {
      case "text":
      case "email":
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={value}
            onChange={e => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className={baseClass}
          />
        );
      case "number":
        return (
          <input
            type="number"
            id={field.name}
            name={field.name}
            value={value}
            onChange={e => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className={baseClass}
          />
        );
      case "date":
        return (
          <input
            type="date"
            id={field.name}
            name={field.name}
            value={value}
            onChange={e => handleInputChange(field.name, e.target.value)}
            required={field.required}
            className={baseClass}
          />
        );
      case "textarea":
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={value}
            onChange={e => handleInputChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className={`${baseClass} resize-y`}
          />
        );
      case "select":
      return (
        <select
          id={field.name}
          name={field.name}
          value={value}
          onChange={e => handleInputChange(field.name, e.target.value)}
          required={field.required}
          className={baseClass}
        >
          <option value="">Pilih {field.label}</option>
          {field.options?.map(option => {
            const val = typeof option === "string" ? option : option.value;
            const lbl = typeof option === "string" ? option : option.label;
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
      );
      case "file":
        return (
          <div>
            <input
              type="file"
              id={field.name}
              name={field.name}
              accept={field.accept}
              multiple={field.multiple}
              onChange={e =>
                handleFileChange(field.name, e.target.files?.[0] || null)
              }
              required={field.required && !isEdit}
              className={`${baseClass} file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#f15a22] file:text-white hover:file:bg-[#d14a1a]`}
            />
            <p className="text-xs text-[#6b6560] mt-1">
              Maks {field.maxSize || 5}MB · Format: {field.accept}
            </p>
            {isEdit &&
              initialData?.files?.find(
                (f: any) => f.fieldName === field.name
              ) && (
                <p className="text-xs text-[#f15a22] mt-1">
                  File saat ini:{" "}
                  {
                    initialData.files.find(
                      (f: any) => f.fieldName === field.name
                    ).fileName
                  }
                </p>
              )}
          </div>
        );
      default:
        return null;
    }
  };

  // ─── Modal: Konfirmasi Approval INPG ─────────────────────────────────────
  const renderApprovalModal = () => {
    if (approvalStep === "idle") return null;

    // Success state setelah submit INPG
    if (approvalStep === "submitted") {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-barlow-condensed font-extrabold text-2xl text-[#231f20] uppercase mb-2">
              Menunggu Persetujuan
            </h3>
            <p className="text-[#6b6560] text-sm mb-2">
              Data temuan berhasil disubmit dan{" "}
              <span className="font-semibold text-amber-600">
                menunggu persetujuan atasan
              </span>{" "}
              sebelum aktif.
            </p>
            <p className="text-[#6b6560] text-sm mb-6">
              Status temuan akan tetap{" "}
              <span className="font-bold text-amber-600">INPG</span> hingga
              disetujui.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <p className="text-xs text-amber-700">
                Atasan akan menerima notifikasi dan dapat menyetujui atau
                menolak temuan ini dari dashboard mereka.
              </p>
            </div>
            <button
              onClick={() => {
                setApprovalStep("idle");
                onSuccess?.();
              }}
              className="w-full px-6 py-3 bg-[#f7941d] text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#d17a1a] transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      );
    }

    // Konfirmasi sebelum submit INPG
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Modal Header */}
          <div className="bg-amber-500 px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-barlow-condensed font-extrabold text-white uppercase text-lg leading-tight">
                Persetujuan Diperlukan
              </h3>
              <p className="text-amber-100 text-xs">Status Temuan: INPG</p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-4">
            <p className="text-[#231f20] text-sm">
              Temuan dengan status{" "}
              <span className="font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                INPG (In Progress)
              </span>{" "}
              menandakan belum ada perbaikan. Pengajuan ini memerlukan{" "}
              <span className="font-semibold">persetujuan atasan</span> sebelum
              dapat diproses.
            </p>

            <div className="bg-[#faf9f7] border border-[#d4cfc9] rounded-lg p-4 space-y-1 text-sm">
              <p className="text-[#6b6560]">
                <span className="font-semibold">Setelah submit:</span>
              </p>
              <ul className="space-y-1 text-[#6b6560] ml-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>
                  Data masuk ke antrian persetujuan atasan
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>
                  Status temuan tetap <strong>INPG</strong> hingga disetujui
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">→</span>
                  Atasan dapat menyetujui atau menolak dari dashboard
                </li>
              </ul>
            </div>

            {/* Catatan untuk atasan */}
            <div>
              <label className="block font-barlow-condensed font-semibold text-sm text-[#231f20] mb-2 uppercase tracking-wide">
                Catatan untuk Atasan{" "}
                <span className="text-[#6b6560] font-normal normal-case tracking-normal">
                  (opsional)
                </span>
              </label>
              <textarea
                value={approvalNote}
                onChange={e => setApprovalNote(e.target.value)}
                placeholder="Jelaskan konteks temuan atau alasan memerlukan persetujuan..."
                rows={3}
                className="w-full px-4 py-2.5 border border-[#d4cfc9] rounded focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="bg-[#faf9f7] px-6 py-4 flex gap-3">
            <button
              onClick={() => setApprovalStep("idle")}
              disabled={approvalStep === "submitting"}
              className="flex-1 px-4 py-2.5 border border-[#d4cfc9] text-[#6b6560] font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#d4cfc9]/30 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleApprovalConfirm}
              disabled={approvalStep === "submitting"}
              className="flex-1 px-4 py-2.5 bg-amber-500 text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {approvalStep === "submitting" ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 0v4a8 8 0 00-8 8H4z"
                    />
                  </svg>
                  Mengajukan...
                </>
              ) : (
                "Ajukan Persetujuan"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Approval Modal */}
      {renderApprovalModal()}

      <div className="space-y-6">
        {/* Form Header */}
        <div className="bg-[#f15a22]/10 p-4 rounded">
          <h3 className="font-barlow-condensed font-bold text-lg text-[#231f20] uppercase">
            {isEdit ? "Edit Data" : "Tambah Data Baru"}
          </h3>          
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Status Temuan — hanya tampil jika hasApprovalWorkflow */}
        {hasApprovalWorkflow && !isEdit && (
          <div>
            <label className="block font-barlow-condensed font-semibold text-sm text-[#231f20] mb-3 uppercase tracking-wide">
              Status Temuan <span className="text-[#f15a22]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* INPG */}
              <button
                type="button"
                onClick={() => setFindingStatus("INPG")}
                className={`relative flex flex-col items-start p-4 border-2 rounded-lg transition-all text-left ${
                  findingStatus === "INPG"
                    ? "border-amber-400 bg-amber-50"
                    : "border-[#d4cfc9] bg-white hover:border-amber-300"
                }`}
              >
                {findingStatus === "INPG" && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 mb-2">
                  INPG
                </span>
                <span className="font-barlow-condensed font-bold text-[#231f20] text-sm">
                  In Progress
                </span>
                <span className="text-xs text-[#6b6560] mt-1 leading-snug">
                  Belum ada perbaikan · Butuh persetujuan atasan
                </span>
              </button>

              {/* CLSD */}
              <button
                type="button"
                onClick={() => setFindingStatus("CLSD")}
                className={`relative flex flex-col items-start p-4 border-2 rounded-lg transition-all text-left ${
                  findingStatus === "CLSD"
                    ? "border-green-400 bg-green-50"
                    : "border-[#d4cfc9] bg-white hover:border-green-300"
                }`}
              >
                {findingStatus === "CLSD" && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                )}
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 mb-2">
                  CLSD
                </span>
                <span className="font-barlow-condensed font-bold text-[#231f20] text-sm">
                  Closed
                </span>
                <span className="text-xs text-[#6b6560] mt-1 leading-snug">
                  Perbaikan sudah dilakukan · Langsung tersimpan
                </span>
              </button>
            </div>

            {/* Info banner berdasarkan status yang dipilih */}
            {findingStatus === "INPG" && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <svg
                  className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-amber-700">
                  Setelah submit, data akan masuk antrian persetujuan atasan.
                  Anda dapat menambahkan catatan untuk atasan di langkah
                  berikutnya.
                </p>
              </div>
            )}
            {findingStatus === "CLSD" && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <svg
                  className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-green-700">
                  Temuan closed akan langsung tersimpan tanpa perlu persetujuan
                  atasan.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {fields.filter(shouldShow).map(field => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block font-barlow-condensed font-semibold text-sm text-[#231f20] mb-2 uppercase tracking-wide"
              >
                {field.label}
                {field.required && (
                  <span className="text-[#f15a22] ml-1">*</span>
                )}
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#d4cfc9]">
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className={`flex-1 px-6 py-3 text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              hasApprovalWorkflow && findingStatus === "INPG" && !isEdit
                ? "bg-amber-500 hover:bg-amber-600"
                : "bg-[#f15a22] hover:bg-[#d14a1a]"
            }`}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 0v4a8 8 0 00-8 8H4z"
                  />
                </svg>
                Menyimpan...
              </>
            ) : isEdit ? (
              "Update Data"
            ) : hasApprovalWorkflow && findingStatus === "INPG" ? (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Ajukan Persetujuan
              </>
            ) : (
              "Simpan Data"
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 bg-[#6b6560] text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#231f20] transition-colors disabled:opacity-50"
            >
              Batal
            </button>
          )}
        </div>
      </div>
    </>
  );
}
