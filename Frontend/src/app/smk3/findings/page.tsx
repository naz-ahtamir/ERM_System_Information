"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button, Spinner, EmptyState } from "@/components/ui";
import { StatusBadge } from "@/components/ui/Badge";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { findingsApi, getApiErrorMessage } from "@/lib/api";
import { exportFindingsToExcel } from "@/lib/exportFindingsToExcel";
import toast from "react-hot-toast";

interface Finding {
  id: string;
  title: string;
  findingStatus: 'OPEN' | 'INPG' | 'CLSD';
  data?: {
    lokasiUtama?: string;
    tanggalInspeksi?: string;
  };
  createdAt: string;
  createdBy: string | { nama?: string; [key: string]: any };
  approvedBy?: string;
}

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'OPEN', value: 'OPEN' },
  { label: 'INPG', value: 'INPG' },
  { label: 'CLSD', value: 'CLSD' },
];

function FindingsListContent() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.get('findingStatus') || ''
  );

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch findings when status filter changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchFindings();
    }
  }, [status, selectedStatus]);

  const fetchFindings = async () => {
    try {
      setIsLoading(true);
      const filters: any = {};
      if (selectedStatus) {
        filters.findingStatus = selectedStatus;
      }
      const data = await findingsApi.getAll(filters);
      setFindings(data);
    } catch (error) {
      console.error('Error fetching findings:', error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    // Update URL with filter parameter
    if (status) {
      router.push(`/smk3/findings?findingStatus=${status}`);
    } else {
      router.push('/smk3/findings');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus finding ini? "${title}"`)) {
      return;
    }

    try {
      await findingsApi.delete(id);
      toast.success('Finding berhasil dihapus');
      // Refresh findings
      fetchFindings();
    } catch (error) {
      console.error('Error deleting finding:', error);
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleExportToExcel = async () => {
    try {
      setIsExporting(true);
      if (findings.length === 0) {
        toast.error('Tidak ada finding untuk diekspor');
        return;
      }
      exportFindingsToExcel(findings);
      toast.success('Excel file berhasil diunduh');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Gagal membuat export file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        user={{
          name: user?.name || '',
          role: user?.role || 'user',
          email: user?.email || '',
        }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header with notification */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Findings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola dan pantau semua findings
              </p>
            </div>
            <NotificationDropdown
              notifications={notifications}
              unreadCount={notifications.filter(n => !n.isRead).length}
            />
          </div>
        </div>

        {/* Findings Content */}
        <div className="p-6">
          {/* Top Action Bar */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Link href="/smk3/findings/new">
              <Button variant="primary" size="lg">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Finding Baru
              </Button>
            </Link>
            <button
              onClick={handleExportToExcel}
              disabled={isExporting || findings.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-[#f15a22] text-white font-medium rounded-lg hover:bg-[#e0490e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExporting ? (
                <>
                  <Spinner size="sm" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0 0V8m0 4h4m-4 0H8" />
                  </svg>
                  Export to Excel
                </>
              )}
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-3">Filter by Status:</p>
            <div className="flex flex-wrap gap-3">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusChange(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedStatus === filter.value
                      ? 'bg-[#f15a22] text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Findings Table */}
          <Card padding="none">
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : findings.length === 0 ? (
                <div className="py-12">
                  <EmptyState
                    icon={
                      <svg
                        className="w-12 h-12 text-gray-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    }
                    title="Tidak ada finding"
                    description={
                      selectedStatus
                        ? `Tidak ada finding dengan status ${selectedStatus}`
                        : "Belum ada data finding. Buat finding baru untuk memulai."
                    }
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created By</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {findings.map((finding) => (
                        <tr key={finding.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            <Link 
                              href={`/smk3/findings/${finding.id}`}
                              className="text-[#f15a22] hover:underline"
                            >
                              {finding.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <StatusBadge status={finding.findingStatus} />
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {finding.data?.lokasiUtama || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {finding.data?.tanggalInspeksi
                              ? new Date(finding.data.tanggalInspeksi).toLocaleDateString('id-ID')
                              : new Date(finding.createdAt).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {typeof finding.createdBy === 'object' ? finding.createdBy?.nama : finding.createdBy}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <Link href={`/smk3/findings/${finding.id}`}>
                                <Button variant="secondary" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Link href={`/smk3/findings/${finding.id}/edit`}>
                                <Button variant="secondary" size="sm">
                                  Edit
                                </Button>
                              </Link>
                              <button
                                onClick={() => handleDelete(finding.id, finding.title)}
                                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Responsive Info */}
          <div className="mt-4 md:hidden">
            <p className="text-xs text-gray-500">
              💡 Tip: Swipe left/right untuk melihat kolom lainnya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FindingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <FindingsListContent />
    </Suspense>
  );
}
