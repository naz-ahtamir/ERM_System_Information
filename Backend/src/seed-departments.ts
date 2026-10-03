/**
 * Seed Departments — PT. QMB New Energy Materials
 * Jalankan: npx ts-node -r tsconfig-paths/register src/seed-departments.ts
 * Atau lewat endpoint: POST /api/departments/seed
 *
 * Idempotent — aman dijalankan berulang kali.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── 28 Departemen PT. QMB ─────────────────────────────────────────────────

export const DEPARTMENTS_QMB = [
  { code: 'MIN-PROC-1',    name: '1 MINERAL PROCESSING DAN MANUFAKTUR' },
  { code: 'PASCA-PROC-1',  name: '1 PASCA PEMPROSESAN MANUFAKTUR' },
  { code: 'HPAL-MFG-2',    name: '2 HPAL MANUFAKTUR HPAL' },
  { code: 'MIN-PROC-2',    name: '2 MINERAL PROCESSING DAN MANUFAKTUR' },
  { code: 'PASCA-PROC-2',  name: '2 PASCA PEMPROSESAN MANUFAKTUR' },
  { code: 'ADM',           name: 'ADMINISTRASI' },
  { code: 'ELEKTRO',       name: 'ELEKTRODEPOSISI' },
  { code: 'ESG-HPAL',      name: 'ESG-HPAL MANUFAKTUR' },
  { code: 'HPAL-PAL',      name: 'HPAL MANUFAKTUR PAL' },
  { code: 'KERJA-ANALISIS',name: 'KERJA ANALISIS' },
  { code: 'KRISTAL',       name: 'KRISTALISASI' },
  { code: 'LOGISTIK',      name: 'LOGISTIK' },
  { code: 'ENERGI',        name: 'MANAJEMEN ENERGI' },
  { code: 'LINGKUNGAN',    name: 'MANAJEMEN LINGKUNGAN' },
  { code: 'TANGGAP-DARURAT', name: 'MANAJEMEN TANGGAP DARURAT' },
  { code: 'NIKEL-HIDROKSIL', name: 'NIKEL HIDROKSIL' },
  { code: 'PELARUTAN',     name: 'PELARUTAN' },
  { code: 'PEMELIHARAAN',  name: 'PEMELIHARAAN PERALATAN' },
  { code: 'PEMURNIAN',     name: 'PEMURNIAN' },
  { code: 'PILOT-PLANT',   name: 'PILOT PLANT' },
  { code: 'PREKURSOR',     name: 'PREKURSOR' },
  { code: 'PROD-ASAM',     name: 'PRODUKSI ASAM' },
  { code: 'RISET',         name: 'PROYEK RISET' },
  { code: 'IT-OTOMASI',    name: 'SISTEM INFORMASI DAN OTOMASI' },
  { code: 'PUSAT-MURNI',   name: 'TERPADU PUSAT PEMURNIAN' },
  { code: 'TRANSPORT',     name: 'TRANSPORTASI DAN MANAJEMEN PERALATAN' },
  { code: 'UMUM',          name: 'UMUM' },
];

async function main() {
  console.log('🌱  Seeding departments PT. QMB...\n');

  let inserted = 0;
  let skipped  = 0;

  for (const dept of DEPARTMENTS_QMB) {
    const existing = await prisma.department.findUnique({ where: { code: dept.code } });
    if (existing) {
      console.log(`  ⏭  Skip  [${dept.code}] ${dept.name}`);
      skipped++;
    } else {
      await prisma.department.create({ data: dept });
      console.log(`  ✅ Insert [${dept.code}] ${dept.name}`);
      inserted++;
    }
  }

  const total = await prisma.department.count();
  console.log(`\n✔  Selesai — inserted: ${inserted}, skipped: ${skipped}, total DB: ${total}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
