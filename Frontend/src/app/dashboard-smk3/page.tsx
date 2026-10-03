"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentFindings } from "@/components/dashboard/RecentFindings";
import { Button, Spinner } from "@/components/ui";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import Link from "next/link";

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

interface Stats {
  total: number;
  open: number;
  closed: number;
}

export default function DashboardSMK3Page() {
  const { user, isLoading: isAuthLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, closed: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isAuthLoading]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Mock data untuk demo - nanti akan diganti dengan API call
      // const response = await fetch('/api/smk3-data');
      // const data = await response.json();
      
      // Simulasi data
      const mockFindings: Finding[] = [
        {
          id: '1',
          title: 'Electrical Hazard at Area A',
          findingStatus: 'OPEN',
          data: {
            lokasiUtama: 'Area A - Smelting',
            tanggalInspeksi: '2024-01-15'
          },
          createdAt: new Date().toISOString(),
          createdBy: 'John Doe'
        },
        {
          id: '2',
          title: 'Safety Equipment Missing',
          findingStatus: 'INPG',
          data: {
            lokasiUtama: 'Area B - Processing',
            tanggalInspeksi: '2024-01-14'
          },
          createdAt: new Date().toISOString(),
          createdBy: 'Jane Smith'
        }
      ];
      
      setFindings(mockFindings);
      setStats({
        total: mockFindings.length,
        open: mockFindings.filter(f => f.findingStatus === 'OPEN').length,
        closed: mockFindings.filter(f => f.findingStatus === 'CLSD').length,
      });
      
      // Mock notifications
      setNotifications([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleMarkAsRead = async (id: string) => {
    // TODO: Implement mark as read
    console.log('Mark as read:', id);
  };

  const handleMarkAllAsRead = async () => {
    // TODO: Implement mark all as read
    console.log('Mark all as read');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        user={{
          name: user.nama || user.name || '',
          role: user.role,
          email: user.email || `${user.idKaryawan}@smk3.local`,
        }}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header with notification */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, {user.nama || user.name}!
              </p>
            </div>
            <NotificationDropdown
              notifications={notifications}
              unreadCount={notifications.filter(n => !n.isRead).length}
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatCard
              title="Total Findings"
              value={stats.total}
              color="orange"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />
            <StatCard
              title="Open Findings"
              value={stats.open}
              color="red"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <StatCard
              title="Closed Findings"
              value={stats.closed}
              color="green"
              icon={
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Recent Findings */}
          <RecentFindings findings={findings} isLoading={isLoading} />

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/findings/new">
              <Button variant="primary" size="lg">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Finding Baru
              </Button>
            </Link>
            <Link href="/findings">
              <Button variant="secondary" size="lg">
                Lihat Semua Findings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
