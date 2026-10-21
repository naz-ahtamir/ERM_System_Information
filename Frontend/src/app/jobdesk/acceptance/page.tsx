"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import SignatureInput from "@/components/SignatureInput";
import { jobdeskList, JobDesk } from "@/data/jobdeskData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface AcceptanceRecord {
  id: string;
  nama: string;
  departemen: string;
  jabatan: string;
  signature: string;
  acceptedAt: string;
  jobdesk: JobDesk;
}

type SortField = "nama" | "jabatan" | "departemen" | "acceptedAt";

function sortValue(rec: AcceptanceRecord, field: SortField): number | string {
  if (field === "acceptedAt") return new Date(rec.acceptedAt).getTime();
  return rec[field];
}

export default function JobDeskAcceptancePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  const [nama, setNama] = useState("");
  const [departemen, setDepartemen] = useState("");
  const [jabatan, setJabatan] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDesk | null>(null);

  const [records, setRecords] = useState<AcceptanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("acceptedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [loadingRecords, setLoadingRecords] = useState(false);

  const departemenList = useMemo(() => {
    const deps = jobdeskList.map((j) => j.departemen);
    return [...new Set(deps)];
  }, []);

  const jabatanList = useMemo(() => {
    if (!departemen) return [];
    return jobdeskList
      .filter((j) => j.departemen === departemen)
      .map((j) => j.jabatan);
  }, [departemen]);

  const filteredRecords = useMemo(() => {
    let filtered = records;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.nama.toLowerCase().includes(term) ||
          r.jabatan.toLowerCase().includes(term) ||
          r.departemen.toLowerCase().includes(term)
      );
    }
    return [...filtered].sort((a, b) => {
      const av = sortValue(a, sortField);
      const bv = sortValue(b, sortField);
      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [records, searchTerm, sortField, sortOrder]);

  useEffect(() => {
    if (jabatan) {
      const found = jobdeskList.find(
        (j) => j.jabatan === jabatan && j.departemen === departemen
      );
      setSelectedJob(found || null);
    } else {
      setSelectedJob(null);
    }
  }, [jabatan, departemen]);

  useEffect(() => {
    if (isAdmin) fetchRecords();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !departemen || !jabatan || !selectedJob) {
      alert("Harap lengkapi semua data!");
      return;
    }
    if (!signature) {
      alert("Harap berikan tanda tangan!");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        nama,
        departemen,
        jabatan,
        jobdesk: selectedJob,
        signature,
        acceptedAt: new Date().toISOString(),
      };
      await fetch("/api/jobdesk/acceptance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await generatePDF(payload);
      alert("Jobdesk berhasil diterima dan PDF telah diunduh!");
      setNama("");
      setDepartemen("");
      setJabatan("");
      setSignature("");
      setSelectedJob(null);
      if (isAdmin) fetchRecords();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (data: {
    nama: string;
    departemen: string;
    jabatan: string;
    jobdesk: JobDesk;
    signature: string;
    acceptedAt: string;
  }) => {
    const container = document.createElement("div");
    container.style.cssText =
      "padding:40px;background:white;font-family:Arial,sans-serif;width:800px;";
    container.innerHTML = `
      <h1 style="font-size:24px;font-weight:bold;margin-bottom:8px;">PT QMB New Energy Materials</h1>
      <h2 style="font-size:20px;margin-bottom:20px;">Surat Penerimaan Job Desk</h2>
      <p><strong>Nama:</strong> ${data.nama}</p>
      <p><strong>Departemen:</strong> ${data.departemen}</p>
      <p><strong>Jabatan:</strong> ${data.jabatan}</p>
      <p><strong>Tanggal:</strong> ${new Date(data.acceptedAt).toLocaleDateString("id-ID")}</p>
      <hr style="margin:20px 0;"/>
      <h3 style="font-weight:bold;">Uraian Jabatan</h3>
      <p>${data.jobdesk.uraian}</p>
      <h3 style="font-weight:bold;margin-top:16px;">Spesifikasi &amp; Persyaratan</h3>
      <p>${data.jobdesk.spesifikasi}</p>
      <h3 style="font-weight:bold;margin-top:16px;">Kompetensi</h3>
      <ul>${data.jobdesk.kompetensi.map((i) => `<li>${i}</li>`).join("")}</ul>
      <h3 style="font-weight:bold;margin-top:16px;">Fungsi Jabatan</h3>
      <ul>${data.jobdesk.fungsi.map((i) => `<li>${i}</li>`).join("")}</ul>
      <h3 style="font-weight:bold;margin-top:16px;">Tugas, Wewenang, Tanggung Jawab</h3>
      <ul>${data.jobdesk.tugasWewenang.map((i) => `<li>${i}</li>`).join("")}</ul>
      <h3 style="font-weight:bold;margin-top:16px;">Indikator Keberhasilan</h3>
      <p>${data.jobdesk.indikator}</p>
      <hr style="margin:20px 0;"/>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <p><strong>Nama Pekerja:</strong> ${data.nama}</p>
          <p><strong>Tanda Tangan:</strong></p>
          <img src="${data.signature}" alt="ttd" style="width:200px;height:80px;border:1px solid #ccc;"/>
        </div>
        <div><p><strong>Tanggal:</strong> ${new Date(data.acceptedAt).toLocaleDateString("id-ID")}</p></div>
      </div>
    `;
    document.body.appendChild(container);
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`jobdesk_${data.nama}_${data.jabatan}.pdf`);
    document.body.removeChild(container);
  };

  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const res = await fetch("/api/jobdesk/acceptance");
      const data = await res.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error("Gagal fetch records:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <>
      <div className="bg-white py-[calc(72px+40px)] px-5 md:px-10 border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-barlow-condensed font-extrabold text-[#1F2937] uppercase text-[clamp(32px,5vw,56px)]">
            Penerimaan Job Desk
          </h1>
          <p className="text-[#E5E7EB] text-lg mt-2">
            Isi data diri Anda, lalu tanda tangani sebagai bukti penerimaan job
            desk.
          </p>
        </div>
      </div>

      <section className="py-12 px-5 md:px-10 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E5E7EB]">
            <h2 className="font-barlow-condensed font-bold text-2xl text-[#1F2937] mb-6">
              Form Penerimaan
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-barlow-condensed font-bold text-sm text-[#1F2937] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]"
                  required
                />
              </div>

              <div>
                <label className="block font-barlow-condensed font-bold text-sm text-[#1F2937] mb-1">
                  Departemen *
                </label>
                <select
                  value={departemen}
                  onChange={(e) => {
                    setDepartemen(e.target.value);
                    setJabatan("");
                  }}
                  className="w-full border border-[#E5E7EB] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]"
                  required
                >
                  <option value="">Pilih Departemen</option>
                  {departemenList.map((dep) => (
                    <option key={dep} value={dep}>
                      {dep}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-barlow-condensed font-bold text-sm text-[#1F2937] mb-1">
                  Jabatan *
                </label>
                <select
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]"
                  disabled={!departemen}
                  required
                >
                  <option value="">Pilih Jabatan</option>
                  {jabatanList.map((jb) => (
                    <option key={jb} value={jb}>
                      {jb}
                    </option>
                  ))}
                </select>
              </div>

              {selectedJob && (
                <div className="bg-[#f2f0ee] p-4 rounded border border-[#E5E7EB] max-h-48 overflow-y-auto text-sm">
                  <h3 className="font-bold text-[#1F2937]">
                    {selectedJob.jabatan}
                  </h3>
                  <p className="mt-1">
                    <strong>Uraian:</strong> {selectedJob.uraian}
                  </p>
                  <p>
                    <strong>Spesifikasi:</strong> {selectedJob.spesifikasi}
                  </p>
                  <p>
                    <strong>Kompetensi:</strong>{" "}
                    {selectedJob.kompetensi.slice(0, 3).join(", ")}...
                  </p>
                </div>
              )}

              <SignatureInput
                label="Tanda Tangan (Bukti Penerimaan)"
                value={signature}
                onChange={setSignature}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF6B1A] text-white font-barlow-condensed font-bold text-lg uppercase tracking-wider py-4 rounded hover:bg-[#E85D0F] transition disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Terima & Buat PDF"}
              </button>
            </form>
          </div>

          {/* List Records — admin only */}
          {isAdmin && (
            <div className="bg-white rounded-xl shadow-lg p-8 border border-[#E5E7EB]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <h2 className="font-barlow-condensed font-bold text-2xl text-[#1F2937]">
                  Riwayat Penerimaan
                </h2>
                <button
                  onClick={fetchRecords}
                  className="text-sm text-[#FF6B1A] hover:underline"
                >
                  Refresh
                </button>
              </div>

              <input
                type="text"
                placeholder="Cari nama, jabatan, atau departemen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]"
              />

              <div className="flex flex-wrap gap-2 mb-4 text-sm">
                <span className="text-[#6B7280]">Sort by:</span>
                {(["nama", "jabatan", "departemen", "acceptedAt"] as SortField[]).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setSortField(f);
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                      }}
                      className={`px-2 py-1 rounded ${sortField === f ? "bg-[#FF6B1A] text-white" : "bg-[#f2f0ee]"}`}
                    >
                      {f === "acceptedAt" ? "Tanggal" : f.charAt(0).toUpperCase() + f.slice(1)}
                      {sortField === f && (sortOrder === "asc" ? " ↑" : " ↓")}
                    </button>
                  )
                )}
              </div>

              {loadingRecords ? (
                <div className="text-center py-8 text-[#6B7280]">
                  Memuat data...
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8 text-[#6B7280]">
                  {searchTerm
                    ? "Tidak ada data yang cocok"
                    : "Belum ada record penerimaan"}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f2f0ee]">
                      <tr>
                        <th className="px-3 py-2 text-left">Nama</th>
                        <th className="px-3 py-2 text-left">Jabatan</th>
                        <th className="px-3 py-2 text-left">Departemen</th>
                        <th className="px-3 py-2 text-left">Tanggal</th>
                        <th className="px-3 py-2 text-center">TTD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2f0ee]">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className="hover:bg-[#FAFAFA]">
                          <td className="px-3 py-2">{record.nama}</td>
                          <td className="px-3 py-2">{record.jabatan}</td>
                          <td className="px-3 py-2">{record.departemen}</td>
                          <td className="px-3 py-2">
                            {new Date(record.acceptedAt).toLocaleDateString(
                              "id-ID"
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {record.signature && (
                              <img
                                src={record.signature}
                                alt="ttd"
                                className="h-8 mx-auto border rounded"
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-[#6B7280] mt-2">
                    Total: {filteredRecords.length} record
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
