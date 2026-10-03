'use client';

/**
 * Form edit/approval PICA sudah dipindah ke modal di list page.
 * Redirect ke /internal-audit-smk/pica
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PicaDetailRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/internal-audit-smk/pica');
  }, [router]);
  return null;
}
