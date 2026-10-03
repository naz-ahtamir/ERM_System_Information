'use client';

import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { FindingForm } from '@/components/findings/FindingForm';
import { EmptyState } from '@/components/ui';
import { findingsApi, getApiErrorMessage } from '@/lib/api';
import toast from 'react-hot-toast';

interface Finding {
  [key: string]: unknown;
}

export default function EditFindingPage() {
  const { isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [finding, setFinding] = useState<Finding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && id) {
      fetchFinding();
    }
  }, [status, id, fetchFinding]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return null;
  }

  if (error || !finding) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="max-w-4xl mx-auto px-4 py-8">
              <EmptyState
                title="Finding Tidak Ditemukan"
                description={error || 'Finding yang Anda cari tidak ditemukan'}
                action={{
                  label: 'Kembali ke Findings',
                  onClick: () => router.push('/findings'),
                }}
              />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Edit Finding</h1>
              <p className="text-gray-600 mt-2">Perbarui finding atau temuan keselamatan kerja</p>
            </div>

            <FindingForm
              initialData={finding}
              isEdit={true}
              onSuccess={() => {
                router.push(`/findings/${id}`);
              }}
              onCancel={() => {
                router.push(`/findings/${id}`);
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
