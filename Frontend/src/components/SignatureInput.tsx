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
      <label className="block font-barlow-condensed font-bold text-sm text-[#231f20] mb-2">
        {label} {required && <span className="text-[#f15a22]">*</span>}
      </label>
      <div className="border-2 border-[#d4cfc9] rounded-lg p-2 bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-36 border border-gray-300 rounded",
            style: { touchAction: "none" },
          }}
          backgroundColor="rgb(255,255,255)"
          penColor="#231f20"
          velocityFilterWeight={0.7}
          clearOnResize={false}
        />
      </div>
      <div className="flex gap-3 mt-3">
        <button
          type="button"
          onClick={save}
          className="px-4 py-2 bg-[#f15a22] text-white font-barlow-condensed text-xs font-bold uppercase tracking-wider rounded hover:bg-[#d14a1a] transition"
        >
          Simpan Tanda Tangan
        </button>
        <button
          type="button"
          onClick={clear}
          className="px-4 py-2 bg-[#c5c0bb] text-[#231f20] font-barlow-condensed text-xs font-bold uppercase tracking-wider rounded hover:bg-[#a5a09b] transition"
        >
          Hapus
        </button>
      </div>
      {value && !isEmpty && (
        <div className="mt-3">
          <p className="text-xs text-[#6b6560] mb-1">Pratinjau:</p>
          <img src={value} alt="Tanda tangan" className="h-16 border border-gray-200 rounded" />
        </div>
      )}
    </div>
  );
}