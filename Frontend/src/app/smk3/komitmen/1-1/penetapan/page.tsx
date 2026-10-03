"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface KebijakanK3 {
  id: string;
  title: string;
  tanggalPenetapan: string;
  penandatangan: string;
  jabatan: string;
  nomorDokumen: string;
  deskripsi: string;
  fileUrl: string;
  fileName: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function PenetapanKebijakanPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [kebijakanList, setKebijakanList] = useState<KebijakanK3[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    tanggalPenetapan: "",
    penandatangan: "",
    jabatan: "",
    nomorDokumen: "",
    deskripsi: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
    if (isAuthenticated) {
      fetchKebijakan();
    }
  }, [status, router]);

  const fetchKebijakan = async () => {
    try {
      const res = await fetch("/api/kebijakan");
      if (res.ok) {
        const data = await res.json();
        setKebijakanList(data);
      }
    } catch (error) {
      console.error("Failed to fetch kebijakan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      
      if (editingId) {
        formDataToSend.append("id", editingId);
      }
      
      formDataToSend.append("title", formData.title);
      formDataToSend.append("tanggalPenetapan", formData.tanggalPenetapan);
      formDataToSend.append("penandatangan", formData.penandatangan);
      formDataToSend.append("jabatan", formData.jabatan);
      formDataToSend.append("nomorDokumen", formData.nomorDokumen);
      formDataToSend.append("deskripsi", formData.deskripsi);
      
      if (file) {
        formDataToSend.append("file", file);
      }

      const url = "/api/kebijakan";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (res.ok) {
        alert(editingId ? "Kebijakan berhasil diupdate!" : "Kebijakan berhasil ditambahkan!");
        resetForm();
        fetchKebijakan();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menyimpan kebijakan");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan kebijakan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (kebijakan: KebijakanK3) => {
    setEditingId(kebijakan.id);
    setFormData({
      title: kebijakan.title,
      tanggalPenetapan: kebijakan.tanggalPenetapan,
      penandatangan: kebijakan.penandatangan,
      jabatan: kebijakan.jabatan,
      nomorDokumen: kebijakan.nomorDokumen,
      deskripsi: kebijakan.deskripsi,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kebijakan ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/kebijakan?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Kebijakan berhasil dihapus!");
        fetchKebijakan();
      } else {
        alert("Gagal menghapus kebijakan");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus kebijakan");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      tanggalPenetapan: "",
      penandatangan: "",
      jabatan: "",
      nomorDokumen: "",
      deskripsi: "",
    });
    setFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleViewPdf = (fileUrl: string) => {
    setSelectedPdf(fileUrl);
  };

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-8 px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 flex-wrap text-sm">
            <Link href="/smk3" className="text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              SMK3
            </Link>
            <span className="text-[#c5c0bb]">/</span>
            <Link href="/smk3/komitmen" className="text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Elemen 1
            </Link>
            <span className="text-[#c5c0bb]">/</span>
            <Link href="/smk3/komitmen/1-1" className="text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Kebijakan K3
            </Link>
            <span className="text-[#c5c0bb]">/</span>
            <span className="text-[#f15a22]">Penetapan</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#f15a22] px-3 py-1.5 text-white font-barlow-condensed font-extrabold text-[16px]">
                  1.1.1
                </div>
                <h1 className="font-barlow-condensed font-extrabold text-white uppercase text-[clamp(28px,4vw,48px)]">
                  Penetapan Kebijakan K3
                </h1>
              </div>
              <p className="text-[#c5c0bb] text-[14px]">
                Kelola dokumen penetapan kebijakan K3 perusahaan
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-6 py-3 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors"
            >
              {showForm ? "Tutup Form" : "+ Tambah Kebijakan"}
            </button>
          </div>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <section className="py-8 px-5 md:px-10 bg-[#f8f7f5]">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white p-8 shadow-lg">
              <h2 className="font-barlow-condensed font-bold text-[20px] uppercase text-[#231f20] mb-6">
                {editingId ? "Edit Kebijakan K3" : "Tambah Kebijakan K3 Baru"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Judul Kebijakan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Contoh: Kebijakan K3 PT. QMB New Energy Materials 2024"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Tanggal Penetapan *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalPenetapan}
                      onChange={(e) => setFormData({ ...formData, tanggalPenetapan: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Nomor Dokumen
                    </label>
                    <input
                      type="text"
                      value={formData.nomorDokumen}
                      onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Contoh: K3/001/2024"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Penandatangan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.penandatangan}
                      onChange={(e) => setFormData({ ...formData, penandatangan: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Nama penandatangan"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Jabatan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Contoh: Direktur Utama"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Deskripsi
                    </label>
                    <textarea
                      rows={4}
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Deskripsi singkat tentang kebijakan ini"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Upload Dokumen PDF {!editingId && "*"}
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      required={!editingId}
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                    />
                    <p className="text-[12px] text-[#6b6560] mt-2">
                      {editingId ? "Kosongkan jika tidak ingin mengubah file" : "Format: PDF"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : editingId ? "Update Kebijakan" : "Simpan Kebijakan"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-8 py-3 bg-[#6b6560] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase hover:bg-[#231f20] transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* List Section */}
      <section className="py-16 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-barlow-condensed font-bold text-[24px] uppercase text-[#231f20] mb-8">
            Daftar Kebijakan K3
          </h2>

          {kebijakanList.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-[#6b6560] text-[14px]">
                Belum ada data kebijakan. Klik tombol "Tambah Kebijakan" untuk menambahkan data baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {kebijakanList.map((kebijakan) => (
                <div key={kebijakan.id} className="bg-white p-6 shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#f15a22] text-white px-3 py-1 text-[11px] font-barlow-condensed font-bold uppercase">
                          {kebijakan.status}
                        </span>
                        {kebijakan.nomorDokumen && (
                          <span className="text-[#6b6560] text-[12px] font-barlow-condensed">
                            No: {kebijakan.nomorDokumen}
                          </span>
                        )}
                      </div>
                      <h3 className="font-barlow-condensed font-bold text-[18px] text-[#231f20] mb-2">
                        {kebijakan.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-[13px] text-[#6b6560] mb-3">
                        <div>
                          <span className="font-bold">Tanggal:</span> {new Date(kebijakan.tanggalPenetapan).toLocaleDateString("id-ID")}
                        </div>
                        <div>
                          <span className="font-bold">Penandatangan:</span> {kebijakan.penandatangan}
                        </div>
                        <div>
                          <span className="font-bold">Jabatan:</span> {kebijakan.jabatan}
                        </div>
                        <div>
                          <span className="font-bold">Dibuat oleh:</span> {kebijakan.createdBy}
                        </div>
                      </div>
                      {kebijakan.deskripsi && (
                        <p className="text-[13px] text-[#6b6560] mb-3">{kebijakan.deskripsi}</p>
                      )}
                      <div className="flex items-center gap-2 text-[12px] text-[#6b6560]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        {kebijakan.fileName}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleViewPdf(kebijakan.fileUrl)}
                        className="px-4 py-2 bg-[#231f20] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#f15a22] transition-colors whitespace-nowrap"
                      >
                        Lihat PDF
                      </button>
                      <button
                        onClick={() => handleEdit(kebijakan)}
                        className="px-4 py-2 bg-[#f7941d] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#f15a22] transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(kebijakan.id)}
                        className="px-4 py-2 bg-[#ff4444] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#cc0000] transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPdf(null)}>
          <div className="bg-white w-full max-w-6xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-barlow-condensed font-bold text-[18px] uppercase">Preview Dokumen PDF</h3>
              <button
                onClick={() => setSelectedPdf(null)}
                className="px-4 py-2 bg-[#ff4444] text-white font-barlow-condensed font-bold text-[11px] uppercase hover:bg-[#cc0000]"
              >
                Tutup
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={selectedPdf}
                className="w-full h-full"
                title="PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
