"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface KonsultasiK3 {
  id: string;
  judulKonsultasi: string;
  tanggalKonsultasi: string;
  lokasi: string;
  peserta: string;
  topikBahasan: string;
  hasilKonsultasi: string;
  fotoKegiatanUrl: string[];
  daftarHadirUrl: string;
  notulenUrl: string;
  status: string;
  createdBy: string | { nama?: string; [key: string]: any };
  createdAt: string;
  updatedAt: string;
}

export default function KonsultasiKebijakanPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [konsultasiList, setKonsultasiList] = useState<KonsultasiK3[]>([]);
  const [filteredList, setFilteredList] = useState<KonsultasiK3[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const isAdmin = user?.role === "admin";

  // Form state
  const [formData, setFormData] = useState({
    judulKonsultasi: "",
    tanggalKonsultasi: "",
    lokasi: "",
    peserta: "",
    topikBahasan: "",
    hasilKonsultasi: "",
  });
  const [fotoKegiatan, setFotoKegiatan] = useState<FileList | null>(null);
  const [daftarHadir, setDaftarHadir] = useState<File | null>(null);
  const [notulen, setNotulen] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
    if (isAuthenticated) {
      fetchKonsultasi();
    }
  }, [status, router]);

  useEffect(() => {
    // Filter based on search query
    if (searchQuery.trim() === "") {
      setFilteredList(konsultasiList);
    } else {
      const filtered = konsultasiList.filter(
        (k) =>
          k.judulKonsultasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.lokasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.peserta.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredList(filtered);
    }
  }, [searchQuery, konsultasiList]);

  const fetchKonsultasi = async () => {
    try {
      const res = await fetch("/api/konsultasi");
      if (res.ok) {
        const data = await res.json();
        setKonsultasiList(data);
        setFilteredList(data);
      }
    } catch (error) {
      console.error("Failed to fetch konsultasi:", error);
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
      
      formDataToSend.append("judulKonsultasi", formData.judulKonsultasi);
      formDataToSend.append("tanggalKonsultasi", formData.tanggalKonsultasi);
      formDataToSend.append("lokasi", formData.lokasi);
      formDataToSend.append("peserta", formData.peserta);
      formDataToSend.append("topikBahasan", formData.topikBahasan);
      formDataToSend.append("hasilKonsultasi", formData.hasilKonsultasi);
      
      // Append multiple foto kegiatan
      if (fotoKegiatan) {
        Array.from(fotoKegiatan).forEach((file) => {
          formDataToSend.append("fotoKegiatan", file);
        });
      }
      
      if (daftarHadir) {
        formDataToSend.append("daftarHadir", daftarHadir);
      }
      
      if (notulen) {
        formDataToSend.append("notulen", notulen);
      }

      const url = "/api/konsultasi";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      if (res.ok) {
        alert(editingId ? "Konsultasi berhasil diupdate!" : "Konsultasi berhasil ditambahkan!");
        resetForm();
        fetchKonsultasi();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menyimpan konsultasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menyimpan konsultasi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (konsultasi: KonsultasiK3) => {
    if (!isAdmin) {
      alert("Hanya admin yang dapat mengedit data");
      return;
    }
    
    setEditingId(konsultasi.id);
    setFormData({
      judulKonsultasi: konsultasi.judulKonsultasi,
      tanggalKonsultasi: konsultasi.tanggalKonsultasi,
      lokasi: konsultasi.lokasi,
      peserta: konsultasi.peserta,
      topikBahasan: konsultasi.topikBahasan,
      hasilKonsultasi: konsultasi.hasilKonsultasi,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert("Hanya admin yang dapat menghapus data");
      return;
    }

    if (!confirm("Apakah Anda yakin ingin menghapus konsultasi ini?")) {
      return;
    }

    try {
      const res = await fetch(`/api/konsultasi?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Konsultasi berhasil dihapus!");
        fetchKonsultasi();
      } else {
        alert("Gagal menghapus konsultasi");
      }
    } catch (error) {
      alert("Terjadi kesalahan saat menghapus konsultasi");
    }
  };

  const resetForm = () => {
    setFormData({
      judulKonsultasi: "",
      tanggalKonsultasi: "",
      lokasi: "",
      peserta: "",
      topikBahasan: "",
      hasilKonsultasi: "",
    });
    setFotoKegiatan(null);
    setDaftarHadir(null);
    setNotulen(null);
    setEditingId(null);
    setShowForm(false);
  };

  const handleViewFile = (fileUrl: string) => {
    setSelectedFile(fileUrl);
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
            <span className="text-[#f15a22]">Konsultasi</span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#f15a22] px-3 py-1.5 text-white font-barlow-condensed font-extrabold text-[16px]">
                  1.1.2
                </div>
                <h1 className="font-barlow-condensed font-extrabold text-white uppercase text-[clamp(24px,4vw,48px)]">
                  Konsultasi Penyusunan Kebijakan K3
                </h1>
              </div>
              <p className="text-[#c5c0bb] text-[14px]">
                Dokumentasi konsultasi dengan stakeholder dalam penyusunan kebijakan K3
              </p>
              {!isAdmin && (
                <p className="text-[#f7941d] text-[12px] mt-2">
                  ℹ️ Anda dapat mencari, menambah, dan melihat data. Edit dan hapus hanya untuk admin.
                </p>
              )}
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className="px-6 py-3 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors"
            >
              {showForm ? "Tutup Form" : "+ Tambah Konsultasi"}
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
                {editingId ? "Edit Konsultasi" : "Tambah Konsultasi Baru"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Judul Konsultasi *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.judulKonsultasi}
                      onChange={(e) => setFormData({ ...formData, judulKonsultasi: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Contoh: Konsultasi Penyusunan Kebijakan K3 dengan P2K3"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Tanggal Konsultasi *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.tanggalKonsultasi}
                      onChange={(e) => setFormData({ ...formData, tanggalKonsultasi: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Lokasi *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lokasi}
                      onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Contoh: Ruang Rapat Lantai 3"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Peserta *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.peserta}
                      onChange={(e) => setFormData({ ...formData, peserta: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Daftar peserta konsultasi (pisahkan dengan koma atau enter)"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Topik Bahasan
                    </label>
                    <textarea
                      rows={3}
                      value={formData.topikBahasan}
                      onChange={(e) => setFormData({ ...formData, topikBahasan: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Topik yang dibahas dalam konsultasi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Hasil Konsultasi
                    </label>
                    <textarea
                      rows={4}
                      value={formData.hasilKonsultasi}
                      onChange={(e) => setFormData({ ...formData, hasilKonsultasi: e.target.value })}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                      placeholder="Kesimpulan dan hasil dari konsultasi"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Foto Kegiatan (JPG/PNG/PDF, max 5 files, 2MB each)
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      multiple
                      onChange={(e) => setFotoKegiatan(e.target.files)}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                    />
                    <p className="text-[12px] text-[#6b6560] mt-2">
                      Upload foto dokumentasi kegiatan konsultasi (maksimal 5 file, masing-masing 2MB)
                    </p>
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Daftar Hadir (PDF, max 2MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setDaftarHadir(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                    />
                  </div>

                  <div>
                    <label className="block font-barlow-condensed font-bold text-[13px] tracking-[0.1em] uppercase text-[#231f20] mb-2">
                      Notulen (PDF, max 3MB)
                    </label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setNotulen(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-1 focus:ring-[#f15a22]"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting || (!!editingId && !isAdmin)}
                    className="px-8 py-3 bg-[#f15a22] text-white font-barlow-condensed font-bold text-[12px] tracking-[0.08em] uppercase hover:bg-[#f7941d] transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : editingId ? "Update Konsultasi" : "Simpan Konsultasi"}
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

      {/* Search and List Section */}
      <section className="py-16 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="mb-8">
            <input
              type="text"
              placeholder="🔍 Cari berdasarkan judul, lokasi, atau peserta..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 border-2 border-[#c5c0bb] text-[14px] focus:outline-none focus:border-[#f15a22] focus:ring-2 focus:ring-[#f15a22]/20"
            />
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="font-barlow-condensed font-bold text-[24px] uppercase text-[#231f20]">
              Daftar Konsultasi ({filteredList.length})
            </h2>
          </div>

          {filteredList.length === 0 ? (
            <div className="bg-white p-12 text-center">
              <p className="text-[#6b6560] text-[14px]">
                {searchQuery ? "Tidak ada data yang sesuai dengan pencarian." : "Belum ada data konsultasi."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredList.map((konsultasi) => (
                <div key={konsultasi.id} className="bg-white p-6 shadow hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="bg-[#f15a22] text-white px-3 py-1 text-[11px] font-barlow-condensed font-bold uppercase">
                          {konsultasi.status}
                        </span>
                        <span className="text-[#6b6560] text-[12px]">
                          {new Date(konsultasi.tanggalKonsultasi).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <h3 className="font-barlow-condensed font-bold text-[18px] text-[#231f20] mb-2">
                        {konsultasi.judulKonsultasi}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px] text-[#6b6560] mb-3">
                        <div><span className="font-bold">Lokasi:</span> {konsultasi.lokasi}</div>
                        <div><span className="font-bold">Dibuat oleh:</span> {typeof konsultasi.createdBy === 'object' ? konsultasi.createdBy?.nama : konsultasi.createdBy}</div>
                      </div>
                      <div className="text-[13px] text-[#6b6560] mb-3">
                        <span className="font-bold">Peserta:</span>
                        <p className="mt-1">{konsultasi.peserta}</p>
                      </div>
                      {konsultasi.hasilKonsultasi && (
                        <div className="text-[13px] text-[#6b6560] mb-3">
                          <span className="font-bold">Hasil:</span>
                          <p className="mt-1">{konsultasi.hasilKonsultasi}</p>
                        </div>
                      )}
                      
                      {/* Files */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {konsultasi.fotoKegiatanUrl.length > 0 && (
                          <div className="flex gap-2">
                            {konsultasi.fotoKegiatanUrl.map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleViewFile(url)}
                                className="px-3 py-1.5 bg-[#f8f7f5] border border-[#c5c0bb] text-[11px] font-barlow-condensed hover:bg-[#f15a22] hover:text-white hover:border-[#f15a22] transition-colors"
                              >
                                📷 Foto {idx + 1}
                              </button>
                            ))}
                          </div>
                        )}
                        {konsultasi.daftarHadirUrl && (
                          <button
                            onClick={() => handleViewFile(konsultasi.daftarHadirUrl)}
                            className="px-3 py-1.5 bg-[#f8f7f5] border border-[#c5c0bb] text-[11px] font-barlow-condensed hover:bg-[#f15a22] hover:text-white hover:border-[#f15a22] transition-colors"
                          >
                            📄 Daftar Hadir
                          </button>
                        )}
                        {konsultasi.notulenUrl && (
                          <button
                            onClick={() => handleViewFile(konsultasi.notulenUrl)}
                            className="px-3 py-1.5 bg-[#f8f7f5] border border-[#c5c0bb] text-[11px] font-barlow-condensed hover:bg-[#f15a22] hover:text-white hover:border-[#f15a22] transition-colors"
                          >
                            📝 Notulen
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(konsultasi)}
                            className="px-4 py-2 bg-[#f7941d] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#f15a22] transition-colors whitespace-nowrap"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(konsultasi.id)}
                            className="px-4 py-2 bg-[#ff4444] text-white font-barlow-condensed font-bold text-[11px] tracking-[0.08em] uppercase hover:bg-[#cc0000] transition-colors"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFile(null)}>
          <div className="bg-white w-full max-w-6xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-barlow-condensed font-bold text-[18px] uppercase">Preview File</h3>
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 bg-[#ff4444] text-white font-barlow-condensed font-bold text-[11px] uppercase hover:bg-[#cc0000]"
              >
                Tutup
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {selectedFile.match(/\.(jpg|jpeg|png)$/i) ? (
                <img src={selectedFile} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <iframe src={selectedFile} className="w-full h-full" title="File Viewer" />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
