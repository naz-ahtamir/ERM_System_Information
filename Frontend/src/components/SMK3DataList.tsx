"use client";

import { useState, useEffect } from "react";
import { SubSubElementData, FindingStatus } from "@/types/subSubElement";
import { useAuth } from "@/contexts/AuthContext";

interface SMK3DataListProps {
  subSubElementId: string;
  onEdit?: (data: SubSubElementData) => void;
  onView?: (data: SubSubElementData) => void;
  refreshTrigger?: number;
}

// Badge konfigurasi per status temuan
const findingStatusConfig: Record<
  FindingStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  OPEN: {
    label: "OPEN",
    bg: "bg-red-100",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  CLSD: {
    label: "CLSD",
    bg: "bg-green-100",
    text: "text-green-700",
    dot: "bg-green-500",
  },
  INPG: {
    label: "INPG",
    bg: "bg-amber-100",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  pending_approval: {
    label: "Menunggu Persetujuan",
    bg: "bg-blue-100",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
};

interface ApprovalModalState {
  open: boolean;
  id: string;
  action: "approve" | "reject";
  title: string;
}

export default function SMK3DataList({
  subSubElementId,
  onEdit,
  onView,
  refreshTrigger,
}: SMK3DataListProps) {
  const { user } = useAuth();
  const [dataList, setDataList] = useState<SubSubElementData[]>([]);
  const [filteredData, setFilteredData] = useState<SubSubElementData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Approval modal state
  const [approvalModal, setApprovalModal] = useState<ApprovalModalState>({
    open: false,
    id: "",
    action: "approve",
    title: "",
  });
  const [approvalNote, setApprovalNote] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";
  const isSupervisor =
    user?.role === "supervisor" || user?.role === "admin";

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/smk3-data?subSubElementId=${subSubElementId}`
      );
      if (!response.ok) throw new Error("Gagal memuat data");
      const data = await response.json();
      setDataList(data);
      setFilteredData(data);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [subSubElementId, refreshTrigger]);

  useEffect(() => {
    let result = dataList;

    if (filterStatus !== "all") {
      result = result.filter(item => item.findingStatus === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item => {
          const createdByStr = typeof item.createdBy === 'object'
            ? (item.createdBy?.nama ?? '')
            : (item.createdBy ?? '');
          return (
            item.title.toLowerCase().includes(q) ||
            JSON.stringify(item.data).toLowerCase().includes(q) ||
            createdByStr.toLowerCase().includes(q)
          );
        }
      );
    }

    setFilteredData(result);
  }, [searchQuery, filterStatus, dataList]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;
    try {
      const response = await fetch(`/api/smk3-data?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Gagal menghapus data");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus data");
    }
  };

  const openApprovalModal = (
    id: string,
    action: "approve" | "reject",
    title: string
  ) => {
    setApprovalModal({ open: true, id, action, title });
    setApprovalNote("");
    setApprovalError(null);
  };

  const handleApprovalAction = async () => {
    setIsApproving(true);
    setApprovalError(null);
    try {
      const response = await fetch("/api/smk3-data", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: approvalModal.id,
          action: approvalModal.action,
          approvalNote,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Gagal memproses persetujuan");
      }

      setApprovalModal({ open: false, id: "", action: "approve", title: "" });
      fetchData();
    } catch (err: any) {
      setApprovalError(err.message || "Terjadi kesalahan");
    } finally {
      setIsApproving(false);
    }
  };

  // Hitung jumlah pending
  const pendingCount = dataList.filter(
    d => d.findingStatus === "pending_approval"
  ).length;

  // ─── Approval Modal ───────────────────────────────────────────────────────
  const renderApprovalModal = () => {
    if (!approvalModal.open) return null;
    const isApprove = approvalModal.action === "approve";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
          <div
            className={`px-6 py-4 flex items-center gap-3 ${
              isApprove ? "bg-green-500" : "bg-red-500"
            }`}
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              {isApprove ? (
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
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
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-barlow-condensed font-extrabold text-white uppercase text-lg leading-tight">
                {isApprove ? "Setujui Temuan" : "Tolak Temuan"}
              </h3>
              <p className="text-white/70 text-xs truncate max-w-xs">
                {approvalModal.title}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-sm text-[#6b6560]">
              {isApprove
                ? "Temuan ini akan disetujui dan status akan berubah menjadi INPG (aktif). Tindakan perbaikan perlu dilakukan."
                : "Temuan ini akan dikembalikan ke submitter untuk direvisi. Berikan alasan penolakan."}
            </p>

            {approvalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {approvalError}
              </div>
            )}

            <div>
              <label className="block font-barlow-condensed font-semibold text-sm text-[#231f20] mb-2 uppercase tracking-wide">
                {isApprove ? "Catatan Persetujuan" : "Alasan Penolakan"}
                {!isApprove && <span className="text-[#f15a22] ml-1">*</span>}
                {isApprove && (
                  <span className="text-[#6b6560] font-normal normal-case tracking-normal ml-1">
                    (opsional)
                  </span>
                )}
              </label>
              <textarea
                value={approvalNote}
                onChange={e => setApprovalNote(e.target.value)}
                placeholder={
                  isApprove
                    ? "Tambahkan catatan jika diperlukan..."
                    : "Jelaskan alasan penolakan..."
                }
                rows={3}
                className="w-full px-4 py-2.5 border border-[#d4cfc9] rounded focus:outline-none focus:ring-2 focus:ring-[#f15a22] focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>

          <div className="bg-[#faf9f7] px-6 py-4 flex gap-3">
            <button
              onClick={() =>
                setApprovalModal({
                  open: false,
                  id: "",
                  action: "approve",
                  title: "",
                })
              }
              disabled={isApproving}
              className="flex-1 px-4 py-2.5 border border-[#d4cfc9] text-[#6b6560] font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#d4cfc9]/30 transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleApprovalAction}
              disabled={isApproving || (!isApprove && !approvalNote.trim())}
              className={`flex-1 px-4 py-2.5 text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                isApprove
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isApproving ? (
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
                  Memproses...
                </>
              ) : isApprove ? (
                "Setujui"
              ) : (
                "Tolak"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#f15a22] border-t-transparent" />
        <p className="text-[#6b6560] mt-4">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {renderApprovalModal()}

      <div className="space-y-5">
        {/* Pending Approval Banner (hanya untuk supervisor/admin) */}
        {isSupervisor && pendingCount > 0 && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-barlow-condensed font-bold text-blue-800 text-sm uppercase tracking-wide">
                {pendingCount} Temuan Menunggu Persetujuan Anda
              </p>
              <p className="text-blue-600 text-xs mt-0.5">
                Filter "Menunggu Persetujuan" untuk melihat semua antrian
              </p>
            </div>
            <button
              onClick={() => setFilterStatus("pending_approval")}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold uppercase rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Lihat Antrian
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari data..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 border border-[#d4cfc9] rounded focus:outline-none focus:ring-2 focus:ring-[#f15a22] focus:border-transparent text-sm"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b6560]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Filter by finding status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-[#d4cfc9] rounded focus:outline-none focus:ring-2 focus:ring-[#f15a22] focus:border-transparent text-sm bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="CLSD">CLSD</option>
            <option value="INPG">INPG</option>
            <option value="pending_approval">Menunggu Persetujuan</option>
          </select>
        </div>

        {/* Count */}
        <p className="text-sm text-[#6b6560]">
          Menampilkan{" "}
          <span className="font-semibold text-[#231f20]">
            {filteredData.length}
          </span>{" "}
          dari {dataList.length} data
        </p>

        {/* Empty State */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12 bg-[#faf9f7] rounded-lg border border-[#d4cfc9]">
            <svg
              className="mx-auto h-12 w-12 text-[#d4cfc9]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-[#6b6560] mt-4">
              {searchQuery || filterStatus !== "all"
                ? "Tidak ada data yang sesuai filter"
                : "Belum ada data"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredData.map(item => {
              const fsCfg = item.findingStatus
                ? findingStatusConfig[item.findingStatus]
                : null;
              const isPending = item.findingStatus === "pending_approval";

              return (
                <div
                  key={item.id}
                  className={`bg-white border rounded-lg p-5 hover:shadow-md transition-shadow ${
                    isPending
                      ? "border-blue-300 shadow-sm shadow-blue-100"
                      : "border-[#d4cfc9]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title + Status Badge */}
                      <div className="flex items-start gap-3 flex-wrap mb-2">
                        <h4 className="font-barlow-condensed font-bold text-lg text-[#231f20]">
                          {item.title}
                        </h4>
                        {fsCfg && (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${fsCfg.bg} ${fsCfg.text} flex-shrink-0`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${fsCfg.dot} ${
                                isPending ? "animate-pulse" : ""
                              }`}
                            />
                            {fsCfg.label}
                          </span>
                        )}
                      </div>

                      {/* Data Preview */}
                      <div className="space-y-1 mb-3">
                        {Object.entries(item.data)
                          .slice(0, 3)
                          .map(([key, value]) => (
                            <p key={key} className="text-sm text-[#6b6560]">
                              <span className="font-semibold capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}:
                              </span>{" "}
                              {String(value).substring(0, 100)}
                              {String(value).length > 100 && "..."}
                            </p>
                          ))}
                      </div>

                      {/* Approval info jika ada */}
                      {item.approval && (
                        <div
                          className={`mb-3 p-3 rounded-lg text-xs space-y-1 ${
                            item.approval.rejectedAt
                              ? "bg-red-50 border border-red-200 text-red-700"
                              : item.approval.approvedAt
                              ? "bg-green-50 border border-green-200 text-green-700"
                              : "bg-blue-50 border border-blue-200 text-blue-700"
                          }`}
                        >
                          {item.approval.rejectedAt ? (
                            <>
                              <p className="font-semibold">
                                ✕ Ditolak oleh {item.approval.rejectedBy}
                              </p>
                              {item.approval.rejectionNote && (
                                <p>Alasan: {item.approval.rejectionNote}</p>
                              )}
                            </>
                          ) : item.approval.approvedAt ? (
                            <>
                              <p className="font-semibold">
                                ✓ Disetujui oleh {item.approval.approvedBy}
                              </p>
                              {item.approval.approvalNote && (
                                <p>Catatan: {item.approval.approvalNote}</p>
                              )}
                            </>
                          ) : (
                            <>
                              <p className="font-semibold">
                                ⏳ Diajukan oleh {item.approval.requestedBy}
                              </p>
                              {item.approval.note && (
                                <p>Catatan: {item.approval.note}</p>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Files */}
                      {item.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {item.files.map((file, idx) => (
                            <a
                              key={idx}
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1 bg-[#f15a22]/10 text-[#f15a22] text-xs font-semibold rounded hover:bg-[#f15a22]/20 transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                />
                              </svg>
                              {file.fileName}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 text-xs text-[#6b6560]">
                        <span>Oleh: {typeof item.createdBy === 'object' ? item.createdBy?.nama : item.createdBy}</span>
                        <span>·</span>
                        <span>
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {/* View */}
                      <button
                        onClick={() => onView?.(item)}
                        className="p-2 text-[#f15a22] hover:bg-[#f15a22]/10 rounded transition-colors"
                        title="Lihat Detail"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      {/* Approve / Reject — hanya untuk supervisor/admin pada pending */}
                      {isSupervisor && isPending && (
                        <>
                          <button
                            onClick={() =>
                              openApprovalModal(item.id, "approve", item.title)
                            }
                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Setujui"
                          >
                            <svg
                              className="w-5 h-5"
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
                          </button>
                          <button
                            onClick={() =>
                              openApprovalModal(item.id, "reject", item.title)
                            }
                            className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="Tolak"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </button>
                        </>
                      )}

                      {/* Edit & Delete — admin only */}
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEdit?.(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
