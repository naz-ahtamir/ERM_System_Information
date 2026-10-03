'use client';

import { AuthenticatedShell } from '@/components/layout/AuthenticatedShell';

export default function SMK3Layout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
