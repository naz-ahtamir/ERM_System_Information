'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Button, Spinner, EmptyState, Modal } from '@/components/ui';
import { StatusBadge } from '@/components/ui/Badge';
import { findingsApi, getApiErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Finding {
  id: string;
  title: string;
  findingStatus: 'OPEN' | 'INPG' | 'CLSD';
  data?: {
    tanggalInspeksi?: string;
    lokasiUtama?: string;
    kategoriHazard?: string;
    levelHazard?: string;
    deskripsiKetidaksesuaian?: string;
    rekomendasiPerbaikan?: string;
    [key: string]: any;
  };
  files?: string[];
  createdBy: string | { nama?: string; [key: string]: any };
  createdById: string;
  approvedBy?: string;
  approvedById?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export default function FindingDetailPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [finding, setFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const fetchFinding = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await findingsApi.getById(id);
      setFinding(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching finding:', err);
      setError(getApiErrorMessage(err));
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated && !isAuthLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchFinding();
    }
  }, [isAuthenticated, id, fetchFinding]);

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus finding ini?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await findingsApi.delete(id);
      toast.success('Finding berhasil dihapus');
      router.push('/findings');
    } catch (err) {
      console.error('Error deleting finding:', err);
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async () => {
    try {
      await findingsApi.updateStatus(id, 'INPG', {
        approvedBy: user?.name || 'Unknown',
        approvedById: user?.id || '',
        approvedAt: new Date().toISOString(),
      });
      toast.success('Finding berhasil diapprove');
      await fetchFinding();
      setShowApprovalModal(false);
    } catch (err) {
      console.error('Error approving finding:', err);
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Masukkan alasan penolakan');
      return;
    }

    try {
      // For rejection, we can either keep OPEN or create a custom status
      // For now, we'll just update with a note
      await findingsApi.updateStatus(id, 'OPEN', {
        rejectionReason: rejectionReason,
      });
      toast.success('Finding berhasil ditolak');
      await fetchFinding();
      setShowApprovalModal(false);
      setRejectionReason('');
    } catch (err) {
      console.error('Error rejecting finding:', err);
      toast.error(getApiErrorMessage(err));
    }
  };



  const isUserSupervisorOrAdmin =
    user?.role === 'supervisor' ||
    user?.role === 'admin';

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error || !finding) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          title="Finding Tidak Ditemukan"
          description={error || 'Finding yang Anda cari tidak ditemukan'}
        />
        <div className="mt-6">
          <Link href="/findings">
            <Button variant="primary">Kembali ke Findings</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Section with Title and Status */}
      <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{finding.title}</h1>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Dibuat oleh <span className="font-semibold">{typeof finding.createdBy === 'object' ? finding.createdBy?.nama : finding.createdBy}</span></p>
            <p>Tanggal: <span className="font-semibold">{new Date(finding.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={finding.findingStatus} />
        </div>
      </div>

      {/* Finding Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Tanggal Inspeksi */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tanggal Inspeksi</label>
          <p className="mt-2 text-lg text-gray-900 font-semibold">
            {finding.data?.tanggalInspeksi
              ? new Date(finding.data.tanggalInspeksi).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
              : '-'}
          </p>
        </div>

        {/* Lokasi Utama */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lokasi Utama</label>
          <p className="mt-2 text-lg text-gray-900 font-semibold">
            {finding.data?.lokasiUtama || '-'}
          </p>
        </div>

        {/* Kategori Hazard */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori Hazard</label>
          <p className="mt-2 text-lg text-gray-900 font-semibold">
            {finding.data?.kategoriHazard || '-'}
          </p>
        </div>

        {/* Level Hazard */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Level Hazard</label>
          <p className="mt-2 text-lg text-gray-900 font-semibold">
            {finding.data?.levelHazard || '-'}
          </p>
        </div>

        {/* Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</label>
          <div className="mt-2">
            <StatusBadge status={finding.findingStatus} />
          </div>
        </div>

        {/* Created At */}
        <div className="bg-white rounded-lg shadow p-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Dibuat Pada</label>
          <p className="mt-2 text-lg text-gray-900 font-semibold">
            {new Date(finding.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6">
        {/* Deskripsi Ketidaksesuaian */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Deskripsi Ketidaksesuaian</h2>
          <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
            {finding.data?.deskripsiKetidaksesuaian || '-'}
          </p>
        </div>

        {/* Rekomendasi Perbaikan */}
        {finding.data?.rekomendasiPerbaikan && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Rekomendasi Perbaikan</h2>
            <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
              {finding.data.rekomendasiPerbaikan}
            </p>
          </div>
        )}

        {/* Approval Information */}
        {finding.approvedBy && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-3">✓ Informasi Approval</h2>
            <div className="space-y-2 text-green-800">
              <p><span className="font-semibold">Diapprove oleh:</span> {finding.approvedBy}</p>
              <p>
                <span className="font-semibold">Tanggal Approval:</span>{' '}
                {finding.approvedAt
                  ? new Date(finding.approvedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '-'}
              </p>
            </div>
          </div>
        )}

        {/* Photos Section */}
        {finding.files && finding.files.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Foto-foto ({finding.files.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {finding.files.map((file, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedPhotoIndex(index);
                    setShowPhotoModal(true);
                  }}
                  className="relative group aspect-square rounded-lg overflow-hidden shadow hover:shadow-lg transition-all duration-200 hover:scale-105"
                >
                  <img
                    src={file}
                    alt={`Finding photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs font-semibold">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">Klik pada foto untuk melihat ukuran lebih besar</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/findings/${id}/edit`}>
          <Button variant="primary">✎ Edit Finding</Button>
        </Link>

        {isUserSupervisorOrAdmin && finding.findingStatus === 'OPEN' && (
          <>
            <Button
              variant="primary"
              onClick={() => handleApprove()}
              className="bg-green-600 hover:bg-green-700"
            >
              ✓ Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowApprovalModal(true)}
            >
              ✗ Reject
            </Button>
          </>
        )}

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50 font-medium"
        >
          {isDeleting ? '⌛ Menghapus...' : '🗑 Hapus'}
        </button>

        <Link href="/findings">
          <Button variant="secondary">← Kembali ke Findings</Button>
        </Link>
      </div>

      {/* Photo Modal */}
      <Modal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        size="xl"
      >
        <div className="space-y-4">
          {finding.files && finding.files.length > 0 && (
            <>
              <img
                src={finding.files[selectedPhotoIndex]}
                alt={`Finding photo ${selectedPhotoIndex + 1}`}
                className="w-full h-auto rounded-lg"
              />
              
              {/* Photo Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setSelectedPhotoIndex(
                      selectedPhotoIndex === 0
                        ? finding.files!.length - 1
                        : selectedPhotoIndex - 1
                    )
                  }
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  ← Sebelumnya
                </button>
                
                <span className="text-gray-600 font-medium">
                  Foto {selectedPhotoIndex + 1} dari {finding.files.length}
                </span>
                
                <button
                  onClick={() =>
                    setSelectedPhotoIndex(
                      selectedPhotoIndex === finding.files!.length - 1
                        ? 0
                        : selectedPhotoIndex + 1
                    )
                  }
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Berikutnya →
                </button>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto py-2">
                {finding.files.map((file, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhotoIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedPhotoIndex === index
                        ? 'border-[#f15a22] shadow-md'
                        : 'border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={file}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Rejection Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tolak Finding
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[#f15a22] focus:border-transparent resize-none"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Tolak Finding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
