"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import SMK3DataForm from "@/components/SMK3DataForm";
import SMK3DataModal from "@/components/SMK3DataModal";
import { getFormConfig } from "@/data/formConfigs";
import { SubSubElementData, FindingStatus } from "@/types/subSubElement";

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const findingStatusConfig: Record<FindingStatus, { label: string; bg: string; text: string; dot: string }> = {
  OPEN:             { label: "OPEN",                 bg: "bg-red-100",   text: "text-red-700",   dot: "bg-red-500"   },
  CLSD:             { label: "CLSD",                 bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  INPG:             { label: "INPG",                 bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  pending_approval: { label: "Menunggu Persetujuan", bg: "bg-blue-100",  text: "text-blue-700",  dot: "bg-blue-500"  },
};

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[700] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-[14px] font-medium ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
      )}
      {msg}
    </div>
  );
}

export default function SubSubElement1215Page() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "admin";
  const isSupervisor = user?.role === "supervisor" || user?.role === "admin";
  const formConfig = getFormConfig("12.1.5");

  const [dataList, setDataList] = useState<SubSubElementData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<SubSubElementData | null>(null);
  const [viewData, setViewData] = useState<SubSubElementData | null>(null);
  const [approvalModal, setApprovalModal] = useState<{ open: boolean; id: string; action: "approve" | "reject"; title: string }>({ open: false, id: "", action: "approve", title: "" });
  const [approvalNote, setApprovalNote] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => { if (!isAuthenticated && !isLoading) router.push("/login"); }, [isAuthenticated, isLoading, router]);

  const fetchData = useCallback(async () => {
    setFetching(true); setFetchError("");
    try {
      const res = await fetch("/api/smk3-data?subSubElementId=12.1.5");
      if (!res.ok) throw new Error("Gagal memuat data");
      setDataList(await res.json());
    } catch (e: any) { setFetchError(e.message || "Terjadi kesalahan"); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = dataList.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const by = typeof item.createdBy === "object" ? (item.createdBy?.nama ?? "") : (item.createdBy ?? "");
    return item.title.toLowerCase().includes(q) || JSON.stringify(item.data).toLowerCase().includes(q) || by.toLowerCase().includes(q);
  });

  const pendingCount = dataList.filter((d) => d.findingStatus === "pending_approval").length;

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    try {
      const res = await fetch(`/api/smk3-data?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data");
      showToast("Data berhasil dihapus", "success"); fetchData();
    } catch (e: any) { showToast(e.message || "Gagal menghapus", "error"); }
  };

  const handleApprovalAction = async () => {
    setIsApproving(true); setApprovalError("");
    try {
      const res = await fetch("/api/smk3-data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: approvalModal.id, action: approvalModal.action, approvalNote }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Gagal memproses"); }
      showToast(approvalModal.action === "approve" ? "Temuan disetujui" : "Temuan ditolak", "success");
      setApprovalModal({ open: false, id: "", action: "approve", title: "" }); fetchData();
    } catch (e: any) { setApprovalError(e.message || "Terjadi kesalahan"); }
    finally { setIsApproving(false); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white px-6 md:px-10 py-8 border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#FF6B1A] mb-2">12. Pengembangan Keterampilan &amp; Kemampuan</p>
          <h1 className="font-bold text-[#1F2937] text-[clamp(22px,4vw,38px)] leading-tight">12.1 Strategi Pelatihan</h1>
          <p className="text-[#6B7280] text-[13px] mt-1.5">12.1.5 Fasilitas dan Sumber Daya Pelatihan</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 py-8">
        {isSupervisor && pendingCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-blue-800 text-[13px]">{pendingCount} Temuan Menunggu Persetujuan Anda</p>
              <p className="text-blue-600 text-[12px] mt-0.5">Klik tombol approve/reject pada baris yang berstatus menunggu persetujuan</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul, data, atau pembuat..."
              className="w-full pl-10 pr-4 py-2.5 text-[14px] bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 transition-colors" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 px-1 flex-wrap gap-2">
          <p className="text-[12px] text-[#6B7280]">{fetching ? "Memuat data..." : `Menampilkan ${filtered.length} record${search ? ` dari ${dataList.length}` : ""}`}</p>        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {fetching ? (
            <div className="p-8 space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-12 bg-[#FAFAFA] rounded-xl animate-pulse" />)}</div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <p className="text-[14px] font-semibold text-[#1F2937]">{fetchError}</p>
              <button onClick={fetchData} className="mt-3 text-[13px] text-[#FF6B1A] hover:underline">Coba lagi</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-[#FAFAFA] flex items-center justify-center mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="font-semibold text-[#1F2937] text-[14px] mb-1">{search ? "Tidak ada hasil" : "Belum ada data"}</p>
              <p className="text-[#6B7280] text-[13px]">{search ? "Coba ubah kata kunci" : "Belum ada record yang ditambahkan"}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#FAFAFA]">
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide w-10">#</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">Judul</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide hidden md:table-cell">Status</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide hidden lg:table-cell">Dibuat Oleh</th>
                    <th className="text-left py-3 px-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide hidden lg:table-cell">Tanggal</th>
                    <th className="text-right py-3 px-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAFAFA]">
                  {filtered.map((item, idx) => {
                    const fsCfg = item.findingStatus ? findingStatusConfig[item.findingStatus] : null;
                    const isPending = item.findingStatus === "pending_approval";
                    const by = typeof item.createdBy === "object" ? item.createdBy?.nama : item.createdBy;
                    return (
                      <tr key={item.id} className={`hover:bg-[#FAFAFA] transition-colors ${isPending ? "bg-blue-50/30" : ""}`}>
                        <td className="py-3 px-4 text-[#9CA3AF]">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => setViewData(item)} className="text-left">
                            <p className="font-medium text-[#1F2937] hover:text-[#FF6B1A] transition-colors leading-snug">{item.title}</p>
                            {item.files.length > 0 && (
                              <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] text-[#9CA3AF]">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                {item.files.length} file
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          {fsCfg ? (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${fsCfg.bg} ${fsCfg.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${fsCfg.dot} ${isPending ? "animate-pulse" : ""}`} />
                              {fsCfg.label}
                            </span>
                          ) : <span className="text-[#E5E7EB]">—</span>}
                        </td>
                        <td className="py-3 px-4 text-[#6B7280] hidden lg:table-cell">{by || "—"}</td>
                        <td className="py-3 px-4 text-[#6B7280] hidden lg:table-cell whitespace-nowrap">{formatDate(item.createdAt)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => setViewData(item)} className="p-1.5 text-[#6B7280] hover:text-[#FF6B1A] hover:bg-[#FAFAFA] rounded-lg transition-colors" title="Lihat detail">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            {isSupervisor && isPending && (
                              <>
                                <button onClick={() => { setApprovalNote(""); setApprovalModal({ open: true, id: item.id, action: "approve", title: item.title }); }} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Setujui">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                                <button onClick={() => { setApprovalNote(""); setApprovalModal({ open: true, id: item.id, action: "reject", title: item.title }); }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Tolak">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>
                              </>
                            )}
                            {isAdmin && (
                              <>
                                <button onClick={() => { setEditData(item); setShowForm(true); }} className="p-1.5 text-[#6B7280] hover:text-[#FF6B1A] hover:bg-[#FFF1E8] rounded-lg transition-colors" title="Edit">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowForm(false); setEditData(null); }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#FF6B1A] mb-0.5">12.1.5</p>
                <h2 className="font-bold text-[15px] text-[#1F2937]">{editData ? "Edit Data" : "Tambah Data"}</h2>
              </div>
              <button onClick={() => { setShowForm(false); setEditData(null); }} className="text-[#6B7280] hover:text-[#1F2937] p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <SMK3DataForm
                subSubElementId="12.1.5"
                subSubElementTitle="12.1.5 Fasilitas dan Sumber Daya Pelatihan"
                fields={formConfig.fields}
                onSuccess={() => { setShowForm(false); setEditData(null); showToast("Data berhasil disimpan", "success"); fetchData(); }}
                onCancel={() => { setShowForm(false); setEditData(null); }}
                initialData={editData}
                isEdit={!!editData}
              />
            </div>
          </div>
        </div>
      )}

      <SMK3DataModal data={viewData} onClose={() => setViewData(null)} />

      {approvalModal.open && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setApprovalModal({ open: false, id: "", action: "approve", title: "" })} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`px-6 py-4 rounded-t-2xl flex items-center gap-3 ${approvalModal.action === "approve" ? "bg-green-500" : "bg-red-500"}`}>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                {approvalModal.action === "approve"
                  ? <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              </div>
              <div>
                <h3 className="font-bold text-white text-[15px]">{approvalModal.action === "approve" ? "Setujui Temuan" : "Tolak Temuan"}</h3>
                <p className="text-white/70 text-[12px] truncate max-w-xs">{approvalModal.title}</p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-[13px] text-[#6B7280]">{approvalModal.action === "approve" ? "Temuan ini akan disetujui dan status berubah menjadi INPG (aktif)." : "Temuan ini akan dikembalikan ke submitter untuk direvisi."}</p>
              {approvalError && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-[12px] text-red-700">{approvalError}</div>}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#1F2937] mb-1.5">
                  {approvalModal.action === "approve" ? "Catatan" : "Alasan Penolakan"}
                  {approvalModal.action === "reject" && <span className="text-red-500 ml-1">*</span>}
                  {approvalModal.action === "approve" && <span className="ml-1 text-[#6B7280] font-normal normal-case">(opsional)</span>}
                </label>
                <textarea value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} rows={3}
                  placeholder={approvalModal.action === "approve" ? "Catatan tambahan (opsional)..." : "Tuliskan alasan penolakan (wajib)..."}
                  className={`w-full px-3.5 py-2.5 text-[14px] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A] resize-none transition-colors ${approvalModal.action === "reject" && !approvalNote.trim() ? "border-red-300" : "border-[#E5E7EB]"}`} />
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-[#E5E7EB]">
              <button onClick={() => setApprovalModal({ open: false, id: "", action: "approve", title: "" })} disabled={isApproving}
                className="flex-1 py-2.5 text-[13px] font-semibold text-[#1F2937] bg-[#FAFAFA] rounded-xl hover:bg-[#E5E7EB] transition-colors disabled:opacity-50">Batal</button>
              <button onClick={handleApprovalAction} disabled={isApproving || (approvalModal.action === "reject" && !approvalNote.trim())}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${approvalModal.action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                {isApproving
                  ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  : approvalModal.action === "approve"
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
                {isApproving ? "Memproses..." : approvalModal.action === "approve" ? "Setujui" : "Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
