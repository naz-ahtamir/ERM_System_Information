'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { findingsApi, getApiErrorMessage, getStoredToken, clearToken } from '@/lib/api';
import { Input, Select, Textarea, Button, Spinner, Card } from '@/components/ui';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Zod validation schema
const findingFormSchema = z.object({
  title: z.string()
    .min(5, 'Judul harus minimal 5 karakter')
    .max(255, 'Judul maksimal 255 karakter'),
  tanggal: z.string()
    .min(1, 'Tanggal wajib diisi'),
  lokasi: z.string()
    .min(3, 'Lokasi harus minimal 3 karakter')
    .max(255, 'Lokasi maksimal 255 karakter'),
  deskripsi: z.string()
    .min(10, 'Deskripsi harus minimal 10 karakter')
    .max(2000, 'Deskripsi maksimal 2000 karakter'),
  kategori: z.string()
    .optional(),
  levelHazard: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.enum(['OPEN', 'INPG', 'CLSD']),
});

type FindingFormData = z.infer<typeof findingFormSchema>;

interface FindingFormProps {
  initialData?: {
    id?: string;
    title?: string;
    findingStatus?: string;
    subSubElementId?: string;
    data?: {
      tanggalInspeksi?: string;
      lokasiUtama?: string;
      deskripsiKetidaksesuaian?: string;
      kategoriHazard?: string;
      levelHazard?: string;
    };
    files?: string[];
  };
  isEdit?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const KATEGORI_OPTIONS = [
  { value: 'keselamatan-kerja', label: 'Keselamatan Kerja' },
  { value: 'kesehatan-kerja', label: 'Kesehatan Kerja' },
  { value: 'hazard-assessment', label: 'Hazard Assessment' },
  { value: 'incident-report', label: 'Incident Report' },
  { value: 'near-miss', label: 'Near Miss' },
];

const LEVEL_HAZARD_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
];

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'INPG', label: 'In Progress' },
  { value: 'CLSD', label: 'Closed' },
];

export function FindingForm({
  initialData,
  isEdit = false,
  onSuccess,
  onCancel,
}: FindingFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FindingFormData>({
    resolver: zodResolver(findingFormSchema),
    defaultValues: isEdit && initialData ? {
      title: (initialData.title as string) || '',
      tanggal: (initialData.data?.tanggalInspeksi as string) || '',
      lokasi: (initialData.data?.lokasiUtama as string) || '',
      deskripsi: (initialData.data?.deskripsiKetidaksesuaian as string) || '',
      kategori: (initialData.data?.kategoriHazard as string) || '',
      levelHazard: (initialData.data?.levelHazard as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
      status: (initialData.findingStatus as 'OPEN' | 'INPG' | 'CLSD') || 'OPEN',
    } : {
      title: '',
      tanggal: '',
      lokasi: '',
      deskripsi: '',
      kategori: '',
      levelHazard: 'Medium',
      status: 'OPEN',
    },
  });

  // Initialize file previews for edit mode
  useEffect(() => {
    if (isEdit && initialData?.files) {
      const filePaths = Array.isArray(initialData.files) ? initialData.files : [];
      if (filePaths.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFilePreviews(filePaths);
      }
    }
  }, [isEdit, initialData]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (uploadedFiles.length + filePreviews.length + files.length > 5) {
      toast.error('Maksimal 5 file per finding');
      return;
    }

    const newFiles = Array.from(files);
    
    // Validate file types
    for (const file of newFiles) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error(`File ${file.name} bukan format gambar yang valid (jpg, png, jpeg)`);
        return;
      }
    }

    // Add new files and create previews
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const target = event.target as FileReader;
        if (target?.result) {
          setFilePreviews(prev => [...prev, target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    // Check if it's a new file or existing file
    if (index < uploadedFiles.length) {
      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    }
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FindingFormData) => {
    if (!user) {
      toast.error('User tidak terautentikasi');
      return;
    }

    setIsSubmitting(true);

    try {
      // Backend endpoint POST /api/smk3-data menggunakan FileFieldsInterceptor (multipart/form-data)
      // Jadi kita harus kirim sebagai FormData, bukan JSON
      const formData = new FormData();

      // Field wajib yang diharapkan backend
      formData.append('subElementId', initialData?.subSubElementId || 'findings');
      formData.append('title', data.title);
      formData.append('findingStatus', data.status === 'OPEN' ? 'INPG' : data.status);

      // Field data dikirim sebagai JSON string (sesuai logika backend: JSON.parse(body.data))
      formData.append('data', JSON.stringify({
        tanggalInspeksi: data.tanggal,
        lokasiUtama: data.lokasi,
        deskripsiKetidaksesuaian: data.deskripsi,
        kategoriHazard: data.kategori || '',
        levelHazard: data.levelHazard,
      }));

      // Lampirkan file gambar jika ada (dikirim langsung ke backend, tidak perlu upload terpisah)
      if (uploadedFiles.length > 0) {
        setIsUploadingFiles(true);
        uploadedFiles.forEach((file) => {
          formData.append('dokumentasiHazard', file);
        });
        setIsUploadingFiles(false);
      }

      // Create or update finding
      if (isEdit && initialData?.id) {
        // Update tetap pakai JSON karena PUT endpoint tidak pakai FileFieldsInterceptor
        const updateData = {
          title: data.title,
          findingStatus: data.status === 'OPEN' ? 'INPG' : data.status,
          data: {
            tanggalInspeksi: data.tanggal,
            lokasiUtama: data.lokasi,
            deskripsiKetidaksesuaian: data.deskripsi,
            kategoriHazard: data.kategori || '',
            levelHazard: data.levelHazard,
          },
        };
        await findingsApi.update(initialData.id, updateData);
      } else {
        // Create pakai FormData (multipart) agar cocok dengan FileFieldsInterceptor di backend
        const token = getStoredToken();
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}/smk3-data`, {
          method: 'POST',
          headers,
          body: formData, // Jangan set Content-Type — browser set boundary otomatis untuk FormData
        });

        if (response.status === 401) {
          clearToken();
          toast.error('Sesi habis. Silakan login kembali.');
          window.location.href = '/login';
          return;
        }

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || `Gagal menyimpan finding (${response.status})`);
        }
      }

      // Display success toast with the exact message from requirements
      toast.success('Finding berhasil disimpan');

      // Navigate back to findings list
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
      setIsUploadingFiles(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card padding="none">
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Input
              label="Judul Finding"
              placeholder="Contoh: Electrical Hazard at Area A"
              {...register('title')}
              error={errors.title?.message}
              required
            />
          </div>

          {/* Date */}
          <div>
            <Input
              label="Tanggal"
              type="date"
              {...register('tanggal')}
              error={errors.tanggal?.message}
              required
            />
          </div>

          {/* Location */}
          <div>
            <Input
              label="Lokasi"
              placeholder="Contoh: Area A - Smelting"
              {...register('lokasi')}
              error={errors.lokasi?.message}
              required
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Deskripsi"
              placeholder="Jelaskan temuan dengan detail"
              {...register('deskripsi')}
              error={errors.deskripsi?.message}
              required
            />
          </div>

          {/* Kategori */}
          <div>
            <Select
              label="Kategori"
              options={KATEGORI_OPTIONS}
              {...register('kategori')}
              error={errors.kategori?.message}
            />
          </div>

          {/* Level Hazard */}
          <div>
            <Select
              label="Level Hazard"
              options={LEVEL_HAZARD_OPTIONS}
              {...register('levelHazard')}
              error={errors.levelHazard?.message}
              required
            />
          </div>

          {/* Status */}
          <div>
            <Select
              label="Status"
              options={STATUS_OPTIONS}
              {...register('status')}
              error={errors.status?.message}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Foto
            </label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleFileSelect}
                disabled={isUploadingFiles || uploadedFiles.length + filePreviews.length >= 5}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 focus:border-[#FF6B1A]"
              />
              <span className="text-sm text-gray-500">
                {uploadedFiles.length + filePreviews.length}/5
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: JPG, PNG (Max 5MB per file)
            </p>

            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={preview.startsWith('data:') ? preview : preview}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auto-filled fields display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Dibuat oleh:</strong> {user?.name} ({user?.id})
            </p>
          </div>
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingFiles}
          className="flex-1"
        >
          {isSubmitting || isUploadingFiles ? (
            <>
              <Spinner className="w-4 h-4" />
              {isEdit ? 'Memperbarui...' : 'Menyimpan...'}
            </>
          ) : (
            isEdit ? 'Perbarui Finding' : 'Buat Finding'
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="secondary"
            disabled={isSubmitting}
          >
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
