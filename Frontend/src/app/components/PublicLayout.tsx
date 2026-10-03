'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/app/components/Navbar';
import { Footer } from '@/app/components/Footer';

// Route prefix yang pakai sidebar (authenticated) — tidak perlu Navbar/Footer publik
const AUTHENTICATED_PREFIXES = [
  '/dashboard',
  '/smk3',
  '/findings',
  '/admin',
  '/jobdesk',
  '/dashboard-smk3',
  '/safety-compliance',
  '/accident-prevention',
  '/safety-competency',
  '/internal-audit-smk',
  // Password / auth pages — standalone, no public navbar
  '/change-password',
  '/forgot-password',
  '/reset-password',
  '/login',
  // User account pages
  '/profile',
  '/settings',
  '/notifications',
];

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthenticatedRoute = AUTHENTICATED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isAuthenticatedRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[72px]">{children}</main>
      <Footer />
    </>
  );
}
