"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  emergencyDrillApi,
  departmentsApi,
  type EmergencyDrill,
  type DrillType,
  type DrillStatus,
  type Department,
} from "@/lib/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const DRILL_TYPE_LABELS: Record<DrillType, string> = {
  FIRE: "Fire Drill",
  EARTHQUAKE: "Earthquake / Gempa Bumi",
  CHEMICAL_SPILL: "Chemical Spill / Tumpahan B3",
  EVACUATION: "General Evacuation",
  FIRST_AID: "First Aid / P3K",
  OTHER: "Other",
};

const DRILL_TYPES = Object.entries(DRILL_TYPE_LABELS) as [DrillType, string][];

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:3001";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function resolveFileUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DrillStatus }) {
  return status === "COMPLETED" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
      COMPLETED
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      NOT COMPLETED
    </span>
  );
}

function DrillTypeBadge({ type }: { type: DrillType }) {
  const colors: Record<DrillType, string> = {
    FIRE: "bg-red-100 text-red-700",
    EARTHQUAKE: "bg-orange-100 text-orange-700",
    CHEMICAL_SPILL: "bg-purple-100 text-purple-700",
    EVACUATION: "bg-blue-100 text-blue-700",
    FIRST_AID: "bg-teal-100 text-teal-700",
    OTHER: "bg-[#e5e0db] text-[#6b6560]",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${colors[type]}`}
    >
      {DRILL_TYPE_LABELS[type]}
    </span>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[700] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[14px] font-medium ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      )}
      {msg}
    </div>
  );
}

// ── Plan Modal (Create) ───────────────────────────────────────────────────────

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: Department[];
  onSaved: (drill: EmergencyDrill) => void;
}

function PlanModal({ isOpen, onClose, departments, onSaved }: PlanModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    planDate: "",
    drillType: "" as DrillType | "",
    scenario: "",
    departmentId: "",
    division: "",
    picPlan: "",
    notesPlan: "",
  });

  useEffect(() => {
    if (isOpen) {
      setForm({ planDate: "", drillType: "", scenario: "", departmentId: "", division: "", picPlan: "", notesPlan: "" });
      setError("");
    }
  }, [isOpen]);

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("planDate", form.planDate);
      fd.append("drillType", form.drillType);
      fd.append("scenario", form.scenario);
      fd.append("departmentId", form.departmentId);
      fd.append("division", form.division);
      fd.append("picPlan", form.picPlan);
      if (form.notesPlan) fd.append("notesPlan", form.notesPlan);
      const created = await emergencyDrillApi.create(fd);
      onSaved(created);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">
              Emergency Drill
            </p>
            <h2 className="font-bold text-[15px] text-[#231f20]">
              Tambah Rencana Drill
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6560] hover:text-[#231f20] p-1"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Plan Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.planDate}
                onChange={(e) => f("planDate")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Jenis Drill <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.drillType}
                onChange={(e) => f("drillType")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] bg-white"
              >
                <option value="">-- Pilih Jenis --</option>
                {DRILL_TYPES.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Skenario <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.scenario}
              onChange={(e) => f("scenario")(e.target.value)}
              placeholder="Uraikan skenario drill..."
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.departmentId}
                onChange={(e) => f("departmentId")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] bg-white"
              >
                <option value="">-- Pilih Dept --</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Division / Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.division}
                onChange={(e) => f("division")(e.target.value)}
                placeholder="Divisi yang terlibat"
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              PIC Plan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.picPlan}
              onChange={(e) => f("picPlan")(e.target.value)}
              placeholder="Person in Charge (rencana)"
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Notes Plan
            </label>
            <textarea
              rows={2}
              value={form.notesPlan}
              onChange={(e) => f("notesPlan")(e.target.value)}
              placeholder="Catatan tambahan rencana..."
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] resize-none"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={(e) => {
              const form = (e.currentTarget.closest(".relative") as HTMLElement)
                ?.querySelector("form");
              form?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Menyimpan..." : "Buat Rencana Drill"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Actual Modal (Fill after drill done) ──────────────────────────────────────

interface ActualModalProps {
  isOpen: boolean;
  drill: EmergencyDrill | null;
  onClose: () => void;
  onSaved: (drill: EmergencyDrill) => void;
}

function ActualModal({ isOpen, drill, onClose, onSaved }: ActualModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    actualDate: "",
    location: "",
    totalTKA: "",
    totalTKI: "",
    totalStaff: "",
    duration: "",
    picActual: "",
    notesActual: "",
  });
  const [filePhoto, setFilePhoto] = useState<File | null>(null);
  const [fileAttend, setFileAttend] = useState<File | null>(null);
  const [fileReport, setFileReport] = useState<File | null>(null);

  const refPhoto = useRef<HTMLInputElement>(null);
  const refAttend = useRef<HTMLInputElement>(null);
  const refReport = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && drill) {
      const fmt = (v?: string | null) => (v ? v.slice(0, 10) : "");
      setForm({
        actualDate: fmt(drill.actualDate),
        location: drill.location ?? "",
        totalTKA: drill.totalTKA?.toString() ?? "",
        totalTKI: drill.totalTKI?.toString() ?? "",
        totalStaff: drill.totalStaff?.toString() ?? "",
        duration: drill.duration ?? "",
        picActual: drill.picActual ?? "",
        notesActual: drill.notesActual ?? "",
      });
      setFilePhoto(null);
      setFileAttend(null);
      setFileReport(null);
      setError("");
    }
  }, [isOpen, drill]);

  const tka = Number(form.totalTKA || 0);
  const tki = Number(form.totalTKI || 0);
  const staf = Number(form.totalStaff || 0);
  const rate = staf > 0 ? ((tka + tki) / staf) * 100 : 0;

  const f = (k: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drill) return;
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      // keep plan fields unchanged
      fd.append("planDate", drill.planDate.slice(0, 10));
      fd.append("drillType", drill.drillType);
      fd.append("scenario", drill.scenario);
      fd.append("departmentId", drill.departmentId);
      fd.append("division", drill.division);
      fd.append("picPlan", drill.picPlan);
      if (drill.notesPlan) fd.append("notesPlan", drill.notesPlan);
      // actual
      if (form.actualDate) fd.append("actualDate", form.actualDate);
      if (form.location) fd.append("location", form.location);
      if (form.totalTKA) fd.append("totalTKA", form.totalTKA);
      if (form.totalTKI) fd.append("totalTKI", form.totalTKI);
      if (form.totalStaff) fd.append("totalStaff", form.totalStaff);
      if (form.duration) fd.append("duration", form.duration);
      if (form.picActual) fd.append("picActual", form.picActual);
      if (form.notesActual) fd.append("notesActual", form.notesActual);
      // keep existing file URLs if no new upload
      if (!filePhoto && drill.photoDocumentation)
        fd.append("photoDocumentation", drill.photoDocumentation);
      if (!fileAttend && drill.attendanceList)
        fd.append("attendanceList", drill.attendanceList);
      if (!fileReport && drill.drillReport)
        fd.append("drillReport", drill.drillReport);
      if (filePhoto) fd.append("photoDocumentation", filePhoto);
      if (fileAttend) fd.append("attendanceList", fileAttend);
      if (fileReport) fd.append("drillReport", fileReport);

      const updated = await emergencyDrillApi.update(drill.id, fd);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !drill) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">
              Isi Hasil Pelaksanaan
            </p>
            <h2 className="font-bold text-[15px] text-[#231f20]">
              Actual — {DRILL_TYPE_LABELS[drill.drillType]}
            </h2>
            <p className="text-[12px] text-[#6b6560] mt-0.5">
              Plan: {fmtDate(drill.planDate)} · {drill.department?.name}
            </p>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl">
              {error}
            </div>
          )}

          <div className="px-3.5 py-3 bg-blue-50 border border-blue-200 rounded-xl text-[12px] text-blue-700">
            Mengisi <strong>Actual Date</strong> akan otomatis mengubah status menjadi <strong>COMPLETED</strong>.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Actual Date
              </label>
              <input
                type="date"
                value={form.actualDate}
                onChange={(e) => f("actualDate")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Durasi
              </label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => f("duration")(e.target.value)}
                placeholder="Cth: 2 jam 30 menit"
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Lokasi Pelaksanaan
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => f("location")(e.target.value)}
              placeholder="Area / gedung tempat drill"
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              PIC Actual
            </label>
            <input
              type="text"
              value={form.picActual}
              onChange={(e) => f("picActual")(e.target.value)}
              placeholder="Person in Charge (pelaksanaan)"
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
            />
          </div>

          {/* Participation */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Jumlah Peserta
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  ["TKA", "totalTKA"],
                  ["TKI", "totalTKI"],
                  ["Total Staff", "totalStaff"],
                ] as [string, keyof typeof form][]
              ).map(([lbl, key]) => (
                <div key={key}>
                  <div className="text-[11px] text-[#6b6560] mb-1">{lbl}</div>
                  <input
                    type="number"
                    min="0"
                    value={(form as any)[key]}
                    onChange={(e) => f(key)(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]"
                  />
                </div>
              ))}
            </div>
            {staf > 0 && (
              <div className="mt-2 px-3.5 py-2 bg-[#f1f0ee] rounded-xl text-[12px] text-[#231f20]">
                Participation Rate:{" "}
                <strong className="text-[#f15a22]">{rate.toFixed(2)}%</strong>
                <span className="text-[#6b6560] ml-1.5">(auto-calculated)</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
              Notes Actual
            </label>
            <textarea
              rows={3}
              value={form.notesActual}
              onChange={(e) => f("notesActual")(e.target.value)}
              placeholder="Catatan pelaksanaan, temuan, evaluasi..."
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] resize-none"
            />
          </div>

          {/* File uploads */}
          <div className="space-y-3 border-t border-[#f1f0ee] pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#6b6560]">
              Upload Dokumentasi
            </p>

            {(
              [
                {
                  label: "Foto Dokumentasi",
                  accept: "image/*",
                  ref: refPhoto,
                  file: filePhoto,
                  setFile: setFilePhoto,
                  existing: drill.photoDocumentation,
                },
                {
                  label: "Daftar Hadir",
                  accept: ".pdf,.jpg,.jpeg,.png",
                  ref: refAttend,
                  file: fileAttend,
                  setFile: setFileAttend,
                  existing: drill.attendanceList,
                },
                {
                  label: "Laporan Drill (PDF)",
                  accept: ".pdf,.doc,.docx",
                  ref: refReport,
                  file: fileReport,
                  setFile: setFileReport,
                  existing: drill.drillReport,
                },
              ] as const
            ).map(({ label, accept, ref, file, setFile, existing }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-[12px] text-[#231f20] min-w-[130px]">
                  {label}
                </span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => (ref as React.RefObject<HTMLInputElement>).current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#c5c0bb] text-[12px] font-medium rounded-lg hover:border-[#f15a22] hover:text-[#f15a22] transition-colors whitespace-nowrap"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload
                  </button>
                  {file ? (
                    <span className="text-[11px] text-green-600 truncate">✓ {file.name}</span>
                  ) : existing ? (
                    <a
                      href={resolveFileUrl(existing)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#f15a22] hover:underline truncate"
                    >
                      📎 Lihat file
                    </a>
                  ) : (
                    <span className="text-[11px] text-[#a09a95]">Belum ada file</span>
                  )}
                  <input
                    ref={ref as React.RefObject<HTMLInputElement>}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors"
          >
            Batal
          </button>
          <button
            onClick={(e) => {
              const formEl = (e.currentTarget.closest(".relative") as HTMLElement)?.querySelector("form");
              formEl?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60"
          >
            {saving && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {saving ? "Menyimpan..." : "Simpan Actual"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Plan Modal ───────────────────────────────────────────────────────────

interface EditPlanModalProps {
  isOpen: boolean;
  drill: EmergencyDrill | null;
  departments: Department[];
  onClose: () => void;
  onSaved: (drill: EmergencyDrill) => void;
}

function EditPlanModal({ isOpen, drill, departments, onClose, onSaved }: EditPlanModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    planDate: "",
    drillType: "" as DrillType | "",
    scenario: "",
    departmentId: "",
    division: "",
    picPlan: "",
    notesPlan: "",
  });

  useEffect(() => {
    if (isOpen && drill) {
      setForm({
        planDate: drill.planDate.slice(0, 10),
        drillType: drill.drillType,
        scenario: drill.scenario,
        departmentId: drill.departmentId,
        division: drill.division,
        picPlan: drill.picPlan,
        notesPlan: drill.notesPlan ?? "",
      });
      setError("");
    }
  }, [isOpen, drill]);

  const f = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drill) return;
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("planDate", form.planDate);
      fd.append("drillType", form.drillType);
      fd.append("scenario", form.scenario);
      fd.append("departmentId", form.departmentId);
      fd.append("division", form.division);
      fd.append("picPlan", form.picPlan);
      if (form.notesPlan) fd.append("notesPlan", form.notesPlan);
      // preserve existing actual & file data
      if (drill.actualDate) fd.append("actualDate", drill.actualDate.slice(0, 10));
      if (drill.location) fd.append("location", drill.location);
      if (drill.totalTKA != null) fd.append("totalTKA", String(drill.totalTKA));
      if (drill.totalTKI != null) fd.append("totalTKI", String(drill.totalTKI));
      if (drill.totalStaff != null) fd.append("totalStaff", String(drill.totalStaff));
      if (drill.duration) fd.append("duration", drill.duration);
      if (drill.picActual) fd.append("picActual", drill.picActual);
      if (drill.notesActual) fd.append("notesActual", drill.notesActual);
      if (drill.photoDocumentation) fd.append("photoDocumentation", drill.photoDocumentation);
      if (drill.attendanceList) fd.append("attendanceList", drill.attendanceList);
      if (drill.drillReport) fd.append("drillReport", drill.drillReport);

      const updated = await emergencyDrillApi.update(drill.id, fd);
      onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen || !drill) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e0db] flex-shrink-0">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-0.5">Edit</p>
            <h2 className="font-bold text-[15px] text-[#231f20]">Edit Rencana Drill</h2>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[13px] rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Plan Date <span className="text-red-500">*</span>
              </label>
              <input type="date" required value={form.planDate} onChange={(e) => f("planDate")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">
                Jenis Drill <span className="text-red-500">*</span>
              </label>
              <select required value={form.drillType} onChange={(e) => f("drillType")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] bg-white">
                <option value="">-- Pilih Jenis --</option>
                {DRILL_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Skenario <span className="text-red-500">*</span></label>
            <textarea required rows={3} value={form.scenario} onChange={(e) => f("scenario")(e.target.value)}
              placeholder="Uraikan skenario drill..."
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Department <span className="text-red-500">*</span></label>
              <select required value={form.departmentId} onChange={(e) => f("departmentId")(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] bg-white">
                <option value="">-- Pilih Dept --</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Division / Unit <span className="text-red-500">*</span></label>
              <input type="text" required value={form.division} onChange={(e) => f("division")(e.target.value)}
                placeholder="Divisi yang terlibat"
                className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">PIC Plan <span className="text-red-500">*</span></label>
            <input type="text" required value={form.picPlan} onChange={(e) => f("picPlan")(e.target.value)}
              placeholder="Person in Charge (rencana)"
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22]" />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wide text-[#231f20] mb-1.5">Notes Plan</label>
            <textarea rows={2} value={form.notesPlan} onChange={(e) => f("notesPlan")(e.target.value)}
              placeholder="Catatan tambahan rencana..."
              className="w-full px-3.5 py-2.5 text-[14px] border border-[#c5c0bb] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f15a22]/20 focus:border-[#f15a22] resize-none" />
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors">
            Batal
          </button>
          <button
            onClick={(e) => {
              const formEl = (e.currentTarget.closest(".relative") as HTMLElement)?.querySelector("form");
              formEl?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
            }}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors disabled:opacity-60">
            {saving && <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

interface DetailPanelProps {
  drill: EmergencyDrill | null;
  isAdmin: boolean;
  onClose: () => void;
  onEditPlan: () => void;
  onFillActual: () => void;
  onDelete: () => void;
}

function DetailPanel({ drill, isAdmin, onClose, onEditPlan, onFillActual, onDelete }: DetailPanelProps) {
  if (!drill) return null;

  const hasActual = !!drill.actualDate;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[450]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[460] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#e5e0db] flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#f15a22] mb-1">
              Detail Emergency Drill
            </p>
            <h3 className="font-bold text-[16px] text-[#231f20] leading-snug">
              {DRILL_TYPE_LABELS[drill.drillType]}
            </h3>
            <div className="mt-2">
              <StatusBadge status={drill.status} />
            </div>
          </div>
          <button onClick={onClose} className="text-[#6b6560] hover:text-[#231f20] flex-shrink-0 p-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-[13px]">
          {/* Plan */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#f15a22] mb-3">
              Plan (Rencana)
            </p>
            <div className="space-y-2.5">
              {[
                ["Plan Date", fmtDate(drill.planDate)],
                ["Department", drill.department?.name ?? "—"],
                ["Division", drill.division],
                ["PIC Plan", drill.picPlan],
                ["Scenario", drill.scenario],
                ...(drill.notesPlan ? [["Notes Plan", drill.notesPlan]] : []),
              ].map(([l, v]) => (
                <div key={l} className="flex gap-3">
                  <span className="w-24 flex-shrink-0 font-semibold text-[#6b6560]">{l}</span>
                  <span className="flex-1 text-[#231f20] whitespace-pre-wrap">{v}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Actual */}
          {hasActual ? (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-3">
                Actual (Pelaksanaan)
              </p>
              <div className="space-y-2.5">
                {[
                  ["Actual Date", fmtDate(drill.actualDate)],
                  ["Lokasi", drill.location ?? "—"],
                  ["TKA", drill.totalTKA?.toString() ?? "—"],
                  ["TKI", drill.totalTKI?.toString() ?? "—"],
                  ["Total Staff", drill.totalStaff?.toString() ?? "—"],
                  [
                    "Participation",
                    drill.participationRate != null
                      ? `${drill.participationRate.toFixed(2)}%`
                      : "—",
                  ],
                  ["Durasi", drill.duration ?? "—"],
                  ["PIC Actual", drill.picActual ?? "—"],
                  ...(drill.notesActual
                    ? [["Notes Actual", drill.notesActual]]
                    : []),
                ].map(([l, v]) => (
                  <div key={l} className="flex gap-3">
                    <span className="w-24 flex-shrink-0 font-semibold text-[#6b6560]">{l}</span>
                    <span className="flex-1 text-[#231f20]">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-[12px] text-amber-700">
              <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Data aktual belum diisi. Klik <strong>&nbsp;"Isi Actual"&nbsp;</strong> setelah drill dilaksanakan.
            </div>
          )}

          {/* Dokumentasi */}
          {(drill.photoDocumentation || drill.attendanceList || drill.drillReport) && (
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#6b6560] mb-3">
                Dokumentasi
              </p>
              <div className="space-y-2">
                {[
                  ["Foto Dokumentasi", drill.photoDocumentation],
                  ["Daftar Hadir", drill.attendanceList],
                  ["Laporan Drill", drill.drillReport],
                ]
                  .filter(([, v]) => !!v)
                  .map(([l, v]) => (
                    <div key={l as string} className="flex items-center gap-3">
                      <span className="w-24 flex-shrink-0 font-semibold text-[#6b6560]">
                        {l}
                      </span>
                      <a
                        href={resolveFileUrl(v as string)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#f15a22] hover:underline flex items-center gap-1"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download
                      </a>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Audit */}
          <section className="text-[11px] text-[#a09a95] border-t border-[#f1f0ee] pt-4">
            <p>
              Dibuat oleh{" "}
              <span className="font-semibold">{drill.createdBy?.nama}</span> ·{" "}
              {new Date(drill.createdAt).toLocaleString("id-ID")}
            </p>
            {drill.updatedBy && (
              <p>
                Diperbarui oleh{" "}
                <span className="font-semibold">{drill.updatedBy.nama}</span> ·{" "}
                {new Date(drill.updatedAt).toLocaleString("id-ID")}
              </p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 px-6 py-4 border-t border-[#e5e0db] flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {!hasActual && (
              <button
                onClick={onFillActual}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Isi Actual
              </button>
            )}
            {hasActual && (
              <button
                onClick={onFillActual}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white bg-[#f15a22] rounded-xl hover:bg-[#d44d1a] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Actual
              </button>
            )}
            <button
              onClick={onEditPlan}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[#231f20] bg-[#f1f0ee] rounded-xl hover:bg-[#e5e0db] transition-colors"
            >
              Edit Plan
            </button>
            {isAdmin && (
              <button
                onClick={onDelete}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
                Hapus
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EmergencyDrillPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [records, setRecords] = useState<EmergencyDrill[]>([]);
  const [filtered, setFiltered] = useState<EmergencyDrill[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<DrillStatus | "">("");
  const [filterYear, setFilterYear] = useState("");

  const [detailDrill, setDetailDrill] = useState<EmergencyDrill | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [actualModalDrill, setActualModalDrill] = useState<EmergencyDrill | null>(null);
  const [editPlanDrill, setEditPlanDrill] = useState<EmergencyDrill | null>(null);

  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Init ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadAll();
    loadDepartments();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Filter ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    let result = [...records];
    if (filterStatus) result = result.filter((r) => r.status === filterStatus);
    if (filterYear)
      result = result.filter(
        (r) => new Date(r.planDate).getFullYear().toString() === filterYear
      );
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.scenario?.toLowerCase().includes(q) ||
          r.picPlan?.toLowerCase().includes(q) ||
          r.picActual?.toLowerCase().includes(q) ||
          r.location?.toLowerCase().includes(q) ||
          r.division?.toLowerCase().includes(q) ||
          r.department?.name?.toLowerCase().includes(q) ||
          DRILL_TYPE_LABELS[r.drillType]?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterStatus, filterYear, records]);

  // ── Loaders ────────────────────────────────────────────────────────────────

  async function loadAll() {
    setLoading(true);
    try {
      const data = await emergencyDrillApi.getAll();
      setRecords(data);
    } catch {
      setToast({ msg: "Gagal memuat data", type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      setDepartments(await departmentsApi.getAll());
    } catch {
      // non-fatal
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function onDrillSaved(drill: EmergencyDrill) {
    setRecords((prev) => {
      const idx = prev.findIndex((d) => d.id === drill.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = drill;
        return next;
      }
      return [drill, ...prev];
    });
    if (detailDrill?.id === drill.id) setDetailDrill(drill);
    setToast({ msg: "Berhasil disimpan", type: "success" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus Emergency Drill ini?")) return;
    setDeleting(id);
    try {
      await emergencyDrillApi.delete(id);
      setRecords((prev) => prev.filter((d) => d.id !== id));
      if (detailDrill?.id === id) setDetailDrill(null);
      setToast({ msg: "Berhasil dihapus", type: "success" });
    } catch (err: any) {
      setToast({ msg: err?.message || "Gagal menghapus", type: "error" });
    } finally {
      setDeleting(null);
    }
  }

  // ── Year options ───────────────────────────────────────────────────────────

  const years = Array.from(
    new Set(records.map((r) => new Date(r.planDate).getFullYear()))
  ).sort((a, b) => b - a);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f1f0ee]">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Page Header */}
      <div className="bg-[#231f20] px-6 md:px-10 py-8 border-b-[3px] border-b-[#f15a22]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22] mb-2">
            Accident Prevention › Emergency Preparedness
          </p>
          <h1 className="font-bold text-white text-[clamp(22px,4vw,38px)] leading-tight">
            Emergency Drill
          </h1>
          <p className="text-[#8a8580] text-[13px] mt-1.5">
            Perencanaan dan pencatatan pelaksanaan simulasi tanggap darurat.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a09b96]"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Emergency Drill..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a09b96] hover:text-[#231f20]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as DrillStatus | "")}
            className="px-3.5 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 whitespace-nowrap"
          >
            <option value="">Semua Status</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="NOT_COMPLETED">NOT COMPLETED</option>
          </select>

          {/* Year filter */}
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-3.5 py-2.5 text-[14px] bg-white border border-[#c5c0bb] rounded-xl focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20 whitespace-nowrap"
          >
            <option value="">Semua Tahun</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>

          {/* Add Plan */}
          <button
            onClick={() => setPlanModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f15a22] text-white text-[13px] font-semibold rounded-xl hover:bg-[#d44d1a] transition-colors whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Rencana
          </button>
        </div>

        {/* Info bar */}
        <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
          <p className="text-[12px] text-[#6b6560]">
            {loading
              ? "Memuat data..."
              : `Menampilkan ${filtered.length} record${search ? ` dari ${records.length}` : ""}`}
          </p>
          {isAdmin && !loading && (
            <span className="text-[11px] px-2.5 py-0.5 bg-[#f15a22]/10 text-[#f15a22] rounded-full font-semibold border border-[#f15a22]/20">
              Mode Admin
            </span>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-[#e5e0db] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-[#f1f0ee] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#f1f0ee] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c5c0bb" strokeWidth="1.5">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="font-semibold text-[15px] text-[#231f20]">
                {search || filterStatus || filterYear
                  ? "Tidak ada record yang sesuai"
                  : "Belum ada Emergency Drill"}
              </p>
              <p className="text-[13px] text-[#a09b96] mt-1">
                {search || filterStatus || filterYear
                  ? "Coba ubah filter pencarian"
                  : "Klik \"Tambah Rencana\" untuk membuat drill baru"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5e0db] bg-[#faf9f7]">
                    {[
                      "Plan Date",
                      "Jenis Drill",
                      "Skenario",
                      "Department",
                      "PIC Plan",
                      "Actual Date",
                      "Participation",
                      "Status",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#6b6560] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((drill, idx) => (
                    <tr
                      key={drill.id}
                      onClick={() => setDetailDrill(drill)}
                      className={`border-b border-[#f1f0ee] hover:bg-[#faf9f7] cursor-pointer transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                      }`}
                    >
                      <td className="px-4 py-3 text-[13px] text-[#231f20] whitespace-nowrap">
                        {fmtDate(drill.planDate)}
                      </td>
                      <td className="px-4 py-3">
                        <DrillTypeBadge type={drill.drillType} />
                      </td>
                      <td
                        className="px-4 py-3 text-[13px] text-[#231f20] max-w-[180px] truncate"
                        title={drill.scenario}
                      >
                        {drill.scenario}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6b6560] whitespace-nowrap">
                        {drill.department?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#6b6560]">
                        {drill.picPlan}
                      </td>
                      <td className="px-4 py-3 text-[13px] whitespace-nowrap">
                        {drill.actualDate ? (
                          fmtDate(drill.actualDate)
                        ) : (
                          <span className="text-[#a09a95]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[13px]">
                        {drill.participationRate != null ? (
                          `${drill.participationRate.toFixed(1)}%`
                        ) : (
                          <span className="text-[#a09a95]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={drill.status} />
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          {/* Isi / Edit Actual */}
                          <button
                            title={drill.actualDate ? "Edit Actual" : "Isi Actual"}
                            onClick={() => setActualModalDrill(drill)}
                            className={`p-1.5 rounded transition-colors ${
                              drill.actualDate
                                ? "text-[#6b6560] hover:text-[#f15a22] hover:bg-[#fff3ee]"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }`}
                          >
                            {drill.actualDate ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                          {/* Delete (admin) */}
                          {isAdmin && (
                            <button
                              title="Hapus"
                              onClick={() => handleDelete(drill.id)}
                              disabled={deleting === drill.id}
                              className="p-1.5 text-[#6b6560] hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                            >
                              {deleting === drill.id ? (
                                <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4h6v2" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals & Detail Panel ── */}
      <PlanModal
        isOpen={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        departments={departments}
        onSaved={(drill) => {
          setRecords((prev) => [drill, ...prev]);
          setToast({ msg: "Rencana drill berhasil dibuat", type: "success" });
        }}
      />

      <EditPlanModal
        isOpen={!!editPlanDrill}
        drill={editPlanDrill}
        departments={departments}
        onClose={() => setEditPlanDrill(null)}
        onSaved={onDrillSaved}
      />

      <ActualModal
        isOpen={!!actualModalDrill}
        drill={actualModalDrill}
        onClose={() => setActualModalDrill(null)}
        onSaved={onDrillSaved}
      />

      <DetailPanel
        drill={detailDrill}
        isAdmin={isAdmin}
        onClose={() => setDetailDrill(null)}
        onEditPlan={() => {
          setEditPlanDrill(detailDrill);
          setDetailDrill(null);
        }}
        onFillActual={() => {
          setActualModalDrill(detailDrill);
          setDetailDrill(null);
        }}
        onDelete={() => {
          if (detailDrill) {
            handleDelete(detailDrill.id);
            setDetailDrill(null);
          }
        }}
      />
    </div>
  );
}
