"use client";

import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureInputProps {
  value?: string;
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
}

export default function SignatureInput({ value, onChange, label, required = false }: SignatureInputProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  useEffect(() => {
    if (value && sigCanvas.current) {
      sigCanvas.current.fromDataURL(value);
      setIsEmpty(false);
    }
  }, [value]);

  const clear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onChange("");
  };

  const save = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL("image/png");
      setIsEmpty(false);
      onChange(dataURL);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#6B7280] mb-2">
        {label} {required && <span className="text-[#FF6B1A]">*</span>}
      </label>
      <div className="border border-[#E5E7EB] rounded-xl p-3 bg-[#FAFAFA]">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-36 border border-[#E5E7EB] rounded-lg bg-white",
            style: { touchAction: "none" },
          }}
          backgroundColor="rgb(255,255,255)"
          penColor="#1F2937"
          velocityFilterWeight={0.7}
          clearOnResize={false}
        />
      </div>
      <div className="flex gap-2.5 mt-3">
        <button
          type="button"
          onClick={save}
          className="px-4 py-2 bg-[#FF6B1A] text-white text-[12px] font-semibold rounded-lg hover:bg-[#E85D0F] transition shadow-xs"
        >
          Simpan Tanda Tangan
        </button>
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#1F2937] text-[12px] font-semibold rounded-lg hover:bg-[#F9FAFB] transition shadow-xs"
        >
          Hapus
        </button>
      </div>
      {value && !isEmpty && (
        <div className="mt-3">
          <p className="text-[12px] font-medium text-[#6B7280] mb-1">Pratinjau:</p>
          <img src={value} alt="Tanda tangan" className="h-16 border border-[#E5E7EB] rounded-lg bg-white p-1" />
        </div>
      )}
    </div>
  );
}