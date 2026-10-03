'use client';
import { AuthenticatedShell } from '@/components/layout/AuthenticatedShell';
export default function AccidentPreventionLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
