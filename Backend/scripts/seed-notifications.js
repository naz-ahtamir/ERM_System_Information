/**
 * Seeder untuk notifikasi dummy testing.
 *
 * Usage:
 *   node scripts/seed-notifications.js
 *
 * Opsional — targetkan user tertentu:
 *   TARGET_USER_ID=<uuid> node scripts/seed-notifications.js
 *
 * Script ini:
 *  1. Ambil beberapa user dari DB (atau pakai TARGET_USER_ID)
 *  2. Ambil beberapa finding dari DB sebagai metadata
 *  3. Buat notifikasi dummy beragam type untuk tiap user
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

async function seedNotifications() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres123@localhost:5432/smk3_db';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding dummy notifications...\n');

    // ── Ambil target users ──────────────────────────────────────────────────
    let targetUsers;

    if (process.env.TARGET_USER_ID) {
      const user = await prisma.user.findUnique({
        where: { id: process.env.TARGET_USER_ID },
        select: { id: true, nama: true, role: true },
      });
      if (!user) {
        console.error(`❌ User dengan ID ${process.env.TARGET_USER_ID} tidak ditemukan`);
        process.exit(1);
      }
      targetUsers = [user];
    } else {
      // Ambil max 5 user (admin, supervisor, user)
      targetUsers = await prisma.user.findMany({
        take: 5,
        select: { id: true, nama: true, role: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (targetUsers.length === 0) {
      console.error('❌ Tidak ada user di database. Jalankan seed-admin.js dulu.');
      process.exit(1);
    }

    console.log(`👥 Target users: ${targetUsers.map((u) => u.nama).join(', ')}\n`);

    // ── Ambil beberapa finding untuk referensi ──────────────────────────────
    const findings = await prisma.finding.findMany({
      take: 4,
      where: { deletedAt: null },
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
    });

    // ── Template notifikasi ─────────────────────────────────────────────────
    const buildNotifications = (userId, findings) => {
      const f0 = findings[0];
      const f1 = findings[1];
      const f2 = findings[2];
      const f3 = findings[3];

      const now = new Date();
      const ago = (hours) => new Date(now.getTime() - hours * 3_600_000);

      return [
        {
          userId,
          type: 'finding_submitted',
          title: 'Temuan Baru Dilaporkan',
          message: `Temuan baru "${f0?.title || 'Electrical Hazard di Area Produksi'}" telah disubmit dan menunggu review Anda.`,
          findingId: f0?.id ?? null,
          isRead: false,
          createdAt: ago(1),
        },
        {
          userId,
          type: 'approval_required',
          title: 'Persetujuan Diperlukan',
          message: `Anda ditunjuk sebagai PIC untuk temuan "${f1?.title || 'Machine Guard Missing - Line 3'}". Deadline: 7 hari ke depan.`,
          findingId: f1?.id ?? null,
          isRead: false,
          createdAt: ago(3),
        },
        {
          userId,
          type: 'finding_approved',
          title: 'Temuan Disetujui (ACC)',
          message: `Temuan "${f2?.title || 'APD Tidak Lengkap - Operator Forklift'}" telah disetujui oleh Supervisor. Tindak lanjut diperlukan.`,
          findingId: f2?.id ?? null,
          isRead: false,
          createdAt: ago(6),
        },
        {
          userId,
          type: 'finding_rejected',
          title: 'Temuan Ditolak (TACC)',
          message: `Temuan "${f3?.title || 'Spillage di Area Kimia B2'}" ditolak. Alasan: Data pendukung kurang lengkap. Harap revisi dan submit ulang.`,
          findingId: f3?.id ?? null,
          isRead: true,
          createdAt: ago(24),
        },
        {
          userId,
          type: 'finding_submitted',
          title: 'Temuan Baru — Perlu Tindak Lanjut',
          message: 'Ada 3 temuan baru yang belum ditinjau dalam 48 jam terakhir. Harap segera diproses.',
          findingId: null,
          isRead: true,
          createdAt: ago(48),
        },
        {
          userId,
          type: 'approval_required',
          title: 'Reminder: Deadline PIC Mendekat',
          message: 'Temuan yang Anda tangani memiliki deadline follow-up dalam 2 hari ke depan. Pastikan progres sudah diupdate.',
          findingId: f0?.id ?? null,
          isRead: true,
          createdAt: ago(72),
        },
      ];
    };

    // ── Hapus notifikasi lama yang dibuat seeder (opsional, idempoten) ──────
    let deletedCount = 0;
    for (const user of targetUsers) {
      const result = await prisma.notification.deleteMany({
        where: {
          userId: user.id,
          title: {
            in: [
              'Temuan Baru Dilaporkan',
              'Persetujuan Diperlukan',
              'Temuan Disetujui (ACC)',
              'Temuan Ditolak (TACC)',
              'Temuan Baru — Perlu Tindak Lanjut',
              'Reminder: Deadline PIC Mendekat',
            ],
          },
        },
      });
      deletedCount += result.count;
    }
    if (deletedCount > 0) {
      console.log(`🗑️  Hapus ${deletedCount} notifikasi seeder lama\n`);
    }

    // ── Buat notifikasi baru ────────────────────────────────────────────────
    let totalCreated = 0;
    for (const user of targetUsers) {
      const notifs = buildNotifications(user.id, findings);

      for (const notif of notifs) {
        await prisma.notification.create({ data: notif });
      }

      totalCreated += notifs.length;
      console.log(
        `  ✅ ${notifs.length} notifikasi dibuat untuk ${user.nama} (${user.role})`,
      );
    }

    console.log(`\n🎉 Selesai! Total ${totalCreated} notifikasi dummy berhasil dibuat.`);
    console.log('\n📋 Ringkasan per type:');
    console.log('   finding_submitted  → 2 notifikasi per user');
    console.log('   approval_required  → 2 notifikasi per user');
    console.log('   finding_approved   → 1 notifikasi per user');
    console.log('   finding_rejected   → 1 notifikasi per user');
    console.log('\n💡 Tip: Gunakan akun admin/supervisor untuk melihat semua notifikasi\n');
  } catch (error) {
    console.error('❌ Error saat seeding:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedNotifications();
