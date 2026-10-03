import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotifications() {
  console.log('🌱 Seeding sample notifications...');

  // Get semua users untuk sample
  const users = await prisma.user.findMany({
    select: { id: true, nama: true, role: true, supervisorId: true },
    take: 5,
  });

  if (users.length === 0) {
    console.log('❌ Tidak ada user di database. Seed users dulu.');
    return;
  }

  // Get supervisor/admin untuk notifikasi
  const supervisors = users.filter((u) => u.role === 'supervisor' || u.role === 'admin');
  const regularUsers = users.filter((u) => u.role === 'user');

  if (supervisors.length === 0) {
    console.log('⚠️ Tidak ada supervisor/admin. Kirim notifikasi ke user pertama saja.');
  }

  const targetUser = supervisors[0] || users[0];

  // Get finding untuk sample (atau buat notifikasi tanpa findingId)
  const findings = await prisma.finding.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  // Sample notifications
  const notifications = [
    {
      userId: targetUser.id,
      type: 'finding_submitted' as const,
      title: '📋 Temuan Baru Dilaporkan',
      message: `${regularUsers[0]?.nama || 'User'} melaporkan temuan baru: "Kabel listrik terkelupas di area produksi". Harap ditinjau.`,
      findingId: findings[0]?.id || null,
      isRead: false,
    },
    {
      userId: targetUser.id,
      type: 'approval_required' as const,
      title: '✅ Butuh Persetujuan',
      message: 'Finding "Lantai licin di gudang" memerlukan persetujuan Anda.',
      findingId: findings[1]?.id || null,
      isRead: false,
    },
    {
      userId: targetUser.id,
      type: 'deadline_reminder' as const,
      title: '⏰ Deadline Mendekat',
      message: 'Finding "Perbaikan APAR" deadline dalam 3 hari (2024-12-25). Harap segera ditindaklanjuti.',
      findingId: findings[2]?.id || null,
      isRead: false,
    },
    {
      userId: targetUser.id,
      type: 'license_expiring_soon' as const,
      title: '📄 Sertifikat Akan Expired',
      message: 'Sertifikat "Boiler XYZ-123" akan expired dalam 7 hari. Harap perpanjang segera.',
      findingId: null,
      isRead: false,
    },
    {
      userId: targetUser.id,
      type: 'finding_approved' as const,
      title: '✅ Temuan Disetujui',
      message: 'Temuan Anda "Perbaikan tangga darurat" telah disetujui. PIC akan ditugaskan untuk tindak lanjut.',
      findingId: findings[0]?.id || null,
      isRead: true, // Sudah dibaca (untuk test read/unread)
    },
  ];

  // Create notifications
  for (const notif of notifications) {
    await prisma.notification.create({
      data: notif,
    });
    console.log(`✅ Created: ${notif.title} → ${targetUser.nama}`);
  }

  // Summary
  const totalNotif = await prisma.notification.count();
  const unreadCount = await prisma.notification.count({
    where: { isRead: false },
  });

  console.log('\n📊 Summary:');
  console.log(`   Total notifications: ${totalNotif}`);
  console.log(`   Unread: ${unreadCount}`);
  console.log(`   Target user: ${targetUser.nama} (${targetUser.role})`);
  console.log(`   User ID: ${targetUser.id}`);
  console.log('\n✅ Seeding complete!');
  console.log('\n💡 Tips:');
  console.log(`   1. Login dengan user: ${targetUser.nama}`);
  console.log(`   2. Cek notification bell di header`);
  console.log(`   3. Badge counter harus tampil: (${unreadCount})`);
}

seedNotifications()
  .catch((e) => {
    console.error('❌ Error seeding notifications:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
