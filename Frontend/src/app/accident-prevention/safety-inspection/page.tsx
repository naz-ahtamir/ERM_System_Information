'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SafetyInspectionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/accident-prevention/safety-inspection/non-conformity');
  }, [router]);
  return null;
}
