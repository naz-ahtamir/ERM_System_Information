'use client';
import { CrudPage } from '@/components/CrudPage';
import { config } from '@/app/safety-compliance/worker-consultation/config';
export default function Page() { return <CrudPage config={config} />; }
