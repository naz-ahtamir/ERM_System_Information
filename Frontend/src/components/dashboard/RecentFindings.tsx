import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StatusBadge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';

interface Finding {
  id: string;
  title: string;
  findingStatus: 'OPEN' | 'INPG' | 'CLSD';
  data?: {
    lokasiUtama?: string;
    tanggalInspeksi?: string;
  };
  createdAt: string;
  createdBy: string;
}

interface RecentFindingsProps {
  findings: Finding[];
  isLoading?: boolean;
}

export function RecentFindings({ findings, isLoading }: RecentFindingsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temuan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-[#f15a22] border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Temuan Terbaru</CardTitle>
          <Link
            href="/findings"
            className="text-sm text-[#f15a22] hover:underline font-medium"
          >
            Lihat Semua
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {findings.length === 0 ? (
          <EmptyState
            message="Belum ada data finding"
            action={{
              label: 'Tambah Finding',
              onClick: () => (window.location.href = '/findings/new'),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Judul
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Lokasi
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Tanggal
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {findings.slice(0, 5).map((finding) => (
                  <tr key={finding.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        href={`/findings/${finding.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-[#f15a22]"
                      >
                        {finding.title}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={finding.findingStatus} />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {finding.data?.lokasiUtama || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {finding.data?.tanggalInspeksi || new Date(finding.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/findings/${finding.id}`}
                        className="text-sm text-[#f15a22] hover:underline font-medium"
                      >
                        Lihat
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
