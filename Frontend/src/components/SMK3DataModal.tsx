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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#E5E7EB]">
        {/* Header */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-[#E5E7EB]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFF1E8] text-[#FF6B1A] border border-[#FF6B1A]/20">
                {data.subSubElementId}
              </span>
            </div>
            <h3 className="font-bold text-[18px] text-[#1F2937] leading-snug">
              {data.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1F2937] hover:bg-[#F3F4F6] p-2 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            <h4 className="font-barlow-condensed font-bold text-lg text-[#1F2937] uppercase border-b border-[#E5E7EB] pb-2">
              Informasi Data
            </h4>
            {Object.entries(data.data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-4">
                <div className="font-semibold text-[#6B7280] capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </div>
                <div className="col-span-2 text-[#1F2937]">
                  {String(value)}
                </div>
              </div>
            ))}
          </div>

          {/* Files */}
          {data.files.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-barlow-condensed font-bold text-lg text-[#1F2937] uppercase border-b border-[#E5E7EB] pb-2">
                File Lampiran
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.files.map((file, idx) => (
                  <a
                    key={idx}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-[#E5E7EB] rounded hover:border-[#FF6B1A] hover:bg-[#FF6B1A]/5 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-[#FF6B1A]/10 rounded flex items-center justify-center group-hover:bg-[#FF6B1A]/20">
                      <svg
                        className="w-6 h-6 text-[#FF6B1A]"
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
                      <p className="font-semibold text-sm text-[#1F2937] truncate">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {(file.fileSize / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-[#FF6B1A] flex-shrink-0"
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
          <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#6B7280]">Dibuat oleh:</span>
                <p className="font-semibold text-[#1F2937]">{typeof data.createdBy === 'object' ? data.createdBy?.nama : data.createdBy}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Tanggal dibuat:</span>
                <p className="font-semibold text-[#1F2937]">
                  {new Date(data.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <span className="text-[#6B7280]">Status:</span>
                <p className="font-semibold text-[#1F2937] capitalize">{data.status}</p>
              </div>
              <div>
                <span className="text-[#6B7280]">Terakhir diupdate:</span>
                <p className="font-semibold text-[#1F2937]">
                  {new Date(data.updatedAt).toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-[#E5E7EB] px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#1F2937] hover:bg-[#F9FAFB] text-[13px] font-semibold rounded-xl transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
