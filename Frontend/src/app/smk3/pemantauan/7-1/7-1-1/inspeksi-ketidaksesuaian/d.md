"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import SMK3DataForm from "@/components/SMK3DataForm";
import SMK3DataList from "@/components/SMK3DataList";
import SMK3DataModal from "@/components/SMK3DataModal";
import { getFormConfig } from "@/data/formConfigs";
import { SubSubElementData } from "@/types/subSubElement";

export default function InspeksiKetidaksesuaianPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<SubSubElementData | null>(null);
  const [viewData, setViewData] = useState<SubSubElementData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const formConfig = getFormConfig("7.1.1-inspeksi-ketidaksesuaian");
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#f15a22] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#6b6560] text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditData(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (data: SubSubElementData) => {
    setEditData(data);
    setShowForm(true);
    // Scroll ke form
    setTimeout(() => {
      document.getElementById("form-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <>
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="bg-[#231f20] py-[calc(72px+64px)] px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Link
              href="/smk3"
              className="text-[#c5c0bb] hover:text-[#f15a22] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Link>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb]">
              SMK3
            </div>
            <div className="text-[#c5c0bb]">/</div>
            <Link
              href="/smk3/pemantauan"
              className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors"
            >
              Elemen 7
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <Link
              href="/smk3/pemantauan/7-1"
              className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors"
            >
              Sub-Elemen 7.1
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <Link
              href="/smk3/pemantauan/7-1/7-1-1"
              className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors"
            >
              7.1.1
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#f15a22]">
              Inspeksi Ketidaksesuaian
            </div>
          </div>

          {/* Title + Workflow Info */}
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-[#f7941d] px-4 py-2 flex items-center justify-center text-white font-barlow-condensed font-extrabold text-[18px] flex-shrink-0">
              7.1.1.1
            </div>
            <div className="flex-1">
              <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(24px,4vw,40px)]">
                Inspeksi Ketidaksesuaian
              </h1>
            </div>
          </div>
          <p className="text-[#c5c0bb] text-[14px] max-w-3xl mb-5">
            Pemeriksaan untuk mengidentifikasi dan mendokumentasikan
            ketidaksesuaian terhadap standar K3 yang berlaku
          </p>

          {/* Workflow Legend */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-[#c5c0bb] font-medium">
                CLSD · Langsung tersimpan
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs text-[#c5c0bb] font-medium">
                INPG · Perlu persetujuan atasan
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs text-[#c5c0bb] font-medium">
                Menunggu Persetujuan
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase text-[clamp(20px,3vw,28px)]">
              Kelola Data Inspeksi Ketidaksesuaian
            </h2>
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(prev => !prev);
              }}
              className="px-6 py-3 bg-[#f7941d] text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#d17a1a] transition-colors flex items-center gap-2 flex-shrink-0"
            >
              {showForm ? (
                <>
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Tutup Form
                </>
              ) : (
                <>
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Tambah Data
                </>
              )}
            </button>
          </div>

          {/* Form Section */}
          {showForm && (
            <div
              id="form-section"
              className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-[#d4cfc9]"
            >
              <SMK3DataForm
                subSubElementId="7.1.1-inspeksi-ketidaksesuaian"
                subSubElementTitle="Inspeksi Ketidaksesuaian"
                fields={formConfig.fields}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditData(null);
                }}
                initialData={editData}
                isEdit={!!editData}
                // Aktifkan approval workflow untuk page ini
                hasApprovalWorkflow={true}
              />
            </div>
          )}

          {/* Data List */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4cfc9]">
            <SMK3DataList
              subSubElementId="7.1.1-inspeksi-ketidaksesuaian"
              onEdit={isAdmin ? handleEdit : undefined}
              onView={setViewData}
              refreshTrigger={refreshTrigger}
            />
          </div>
        </div>
      </section>

      {/* View Modal */}
      <SMK3DataModal data={viewData} onClose={() => setViewData(null)} />
    </>
  );
}
