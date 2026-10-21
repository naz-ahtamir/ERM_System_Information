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
      <Card className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <CardHeader className="border-b border-[#E5E7EB] px-6 py-4">
          <CardTitle className="text-base font-bold text-[#1F2937]">Temuan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-3 border-[#FF6B1A] border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader className="border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-[#1F2937]">Temuan Terbaru</CardTitle>
            <p className="text-xs text-[#6B7280] mt-0.5">Daftar laporan temuan K3 paling mutakhir</p>
          </div>
          <Link
            href="/findings"
            className="text-xs font-semibold text-[#FF6B1A] hover:text-[#E85D0F] hover:underline"
          >
            Lihat Semua →
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {findings.length === 0 ? (
          <div className="p-6">
            <EmptyState
              message="Belum ada data temuan"
              action={{
                label: 'Tambah Temuan',
                onClick: () => (window.location.href = '/findings/new'),
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#E5E7EB]">
                  <th className="py-3 px-6 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Judul Temuan
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Status
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Lokasi
                  </th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Tanggal
                  </th>
                  <th className="py-3 px-6 text-right text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {findings.slice(0, 5).map((finding) => (
                  <tr key={finding.id} className="hover:bg-[#FFF9F5]/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/findings/${finding.id}`}
                        className="text-sm font-medium text-[#1F2937] hover:text-[#FF6B1A] transition-colors line-clamp-1"
                      >
                        {finding.title}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={finding.findingStatus} />
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#6B7280] whitespace-nowrap">
                      {finding.data?.lokasiUtama || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#6B7280] whitespace-nowrap">
                      {finding.data?.tanggalInspeksi || new Date(finding.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/findings/${finding.id}`}
                        className="text-xs font-semibold text-[#FF6B1A] hover:text-[#E85D0F] hover:underline"
                      >
                        Detail
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
