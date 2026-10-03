const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Cari user 82402108
  const user = await prisma.user.findUnique({
    where: { idKaryawan: '82402108' },
    select: { id: true, nama: true, role: true, supervisorId: true }
  });
  console.log('\n=== USER 82402108 ===');
  console.log(JSON.stringify(user, null, 2));

  if (!user) {
    console.log('User tidak ditemukan!');
    await prisma.$disconnect();
    return;
  }

  // Cek notifikasi milik user ini
  const notifs = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log('\n=== NOTIFIKASI MILIK USER (max 10) ===');
  console.log('Total:', notifs.length);
  if (notifs.length > 0) {
    notifs.forEach(n => {
      console.log(`- [${n.type}] ${n.title} | isRead: ${n.isRead} | ${n.createdAt}`);
    });
  } else {
    console.log('KOSONG - tidak ada notifikasi');
  }

  // Cek apakah ada user yang supervisorId-nya = user.id
  const bawahan = await prisma.user.findMany({
    where: { supervisorId: user.id },
    select: { id: true, idKaryawan: true, nama: true }
  });
  console.log('\n=== BAWAHAN (user yang punya supervisorId = 82402108) ===');
  if (bawahan.length > 0) {
    bawahan.forEach(b => console.log(`- ${b.idKaryawan} | ${b.nama}`));
  } else {
    console.log('KOSONG - belum ada bawahan yang di-assign');
  }

  // Cek semua findings INPG terbaru
  const findings = await prisma.finding.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { id: true, title: true, findingStatus: true, createdByName: true, createdById: true, createdAt: true }
  });
  console.log('\n=== FINDINGS TERBARU (max 5) ===');
  findings.forEach(f => {
    console.log(`- [${f.findingStatus}] ${f.title} | by ${f.createdByName} | ${f.createdAt}`);
  });

  // Cek total notifikasi di DB
  const totalNotifs = await prisma.notification.count();
  console.log('\n=== TOTAL NOTIFIKASI DI DB ===', totalNotifs);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
