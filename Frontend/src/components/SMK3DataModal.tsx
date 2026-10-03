"use client";

import { SubSubElementData } from "@/types/subSubElement";
import { useEffect } from "react";

interface SMK3DataModalProps {
  data: SubSubElementData | null;
  onClose: () => void;
}

export default function SMK3DataModal({ data, onClose }: SMK3DataModalProps) {
  useEffect(() => {
    if (data) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [data]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#231f20] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-barlow-condensed font-bold text-xl text-white uppercase">
              {data.title}
            </h3>
            <p className="text-sm text-[#c5c0bb] mt-1">
              {data.subSubElementId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#f15a22] transition-colors"
          >
            <svg
              className="w-6 h-6"
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
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Data Fields */}
          <div className="space-y-4 mb-6">
            <h4 className="font-barlow-condensed font-bold text-lg text-[#231f20] uppercase border-b border-[#d4cfc9] pb-2">
              Informasi Data
            </h4>
            {Object.entries(data.data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-[#6b6560] capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </div>
                <div className="col-span-2 text-[#231f20]">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>

          {/* Files */}
          {data.files.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-barlow-condensed font-bold text-lg text-[#231f20] uppercase border-b border-[#d4cfc9] pb-2">
                File Lampiran
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-[#d4cfc9] rounded hover:border-[#f15a22] hover:bg-[#f15a22]/5 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#f15a22]/10 rounded flex items-center justify-center group-hover:bg-[#f15a22]/20">
                      <svg
                        className="w-6 h-6 text-[#f15a22]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#231f20] truncate">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-[#6b6560]">
                        {(file.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#f15a22] flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="mt-6 pt-6 border-t border-[#d4cfc9]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#6b6560]">Dibuat oleh:</span>
                <p className="font-semibold text-[#231f20]">{typeof data.createdBy === 'object' ? data.createdBy?.nama : data.createdBy}</p>
              </div>
              <div>
                <span className="text-[#6b6560]">Tanggal dibuat:</span>
                <p className="font-semibold text-[#231f20]">
                  {new Date(data.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <span className="text-[#6b6560]">Status:</span>
                <p className="font-semibold text-[#231f20] capitalize">{data.status}</p>
              </div>
              <div>
                <span className="text-[#6b6560]">Terakhir diupdate:</span>
                <p className="font-semibold text-[#231f20]">
                  {new Date(data.updatedAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#faf9f7] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#6b6560] text-white font-barlow-condensed font-bold text-sm tracking-wider uppercase rounded hover:bg-[#231f20] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
