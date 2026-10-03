"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import SMK3DataForm from "@/components/SMK3DataForm";
import SMK3DataList from "@/components/SMK3DataList";
import SMK3DataModal from "@/components/SMK3DataModal";
import { getFormConfig } from "@/data/formConfigs";
import { SubSubElementData } from "@/types/subSubElement";

export default function InspeksiKotakP3KPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<SubSubElementData | null>(null);
  const [viewData, setViewData] = useState<SubSubElementData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const formConfig = getFormConfig("7.1.1-inspeksi-kotak-p3k");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [status, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditData(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEdit = (data: SubSubElementData) => {
    setEditData(data);
    setShowForm(true);
  };

  return (
    <>
      {/* Page Header */}
      <div className="bg-[#231f20] py-8 px-5 md:px-10 border-b-[4px] border-b-[#f15a22]">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <Link href="/smk3" className="text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
            </Link>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb]">SMK3</div>
            <div className="text-[#c5c0bb]">/</div>
            <Link href="/smk3/pemantauan" className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Elemen 7
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <Link href="/smk3/pemantauan/7-1" className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              Sub-Elemen 7.1
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <Link href="/smk3/pemantauan/7-1/7-1-1" className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#c5c0bb] hover:text-[#f15a22] transition-colors">
              7.1.1
            </Link>
            <div className="text-[#c5c0bb]">/</div>
            <div className="font-barlow-condensed text-[11px] font-bold tracking-[0.2em] uppercase text-[#80b918]">Inspeksi Kotak P3K</div>
          </div>

          {/* Title Section */}
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-[#80b918] px-4 py-2 flex items-center justify-center text-white font-barlow-condensed font-extrabold text-[18px]">
              7.1.1.3
            </div>
            <div className="flex-1">
              <h1 className="font-barlow-condensed font-extrabold text-white uppercase leading-[0.95] tracking-[-0.01em] text-[clamp(24px,4vw,40px)]">
                Inspeksi Kotak P3K
              </h1>
            </div>
          </div>
          <p className="text-[#c5c0bb] text-[14px] max-w-3xl">
            Pemeriksaan ketersediaan dan kondisi kotak pertolongan pertama pada kecelakaan (P3K)
          </p>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 md:py-24 px-5 md:px-10 bg-[#faf9f7]">
        <div className="max-w-7xl mx-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-barlow-condensed font-extrabold text-[#231f20] uppercase text-[clamp(24px,3vw,32px)]">
              Kelola Data Inspeksi Kotak P3K
            </h2>
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(!showForm);
              }}
              className="px-6 py-3 bg-[#80b918] text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#6a9b13] transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? "Tutup Form" : "Tambah Data"}
            </button>
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <SMK3DataForm
                subSubElementId="7.1.1-inspeksi-kotak-p3k"
                subSubElementTitle="Inspeksi Kotak P3K"
                fields={formConfig.fields}
                onSuccess={handleFormSuccess}
                onCancel={() => {
                  setShowForm(false);
                  setEditData(null);
                }}
                initialData={editData}
                isEdit={!!editData}
              />
            </div>
          )}

          {/* Data List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <SMK3DataList
              subSubElementId="7.1.1-inspeksi-kotak-p3k"
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
