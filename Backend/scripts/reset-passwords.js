const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function resetPasswords() {
  // Setup Prisma with adapter
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres123@localhost:5432/smk3_db";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🔐 Resetting all user passwords to: {idKaryawan}K3\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        idKaryawan: true,
        nama: true,
      },
    });

    console.log(`📊 Found ${users.length} users\n`);

    let updated = 0;
    for (const user of users) {
      const newPassword = `${user.idKaryawan}K3`;
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      
      console.log(`✅ ${user.idKaryawan} (${user.nama}) → Password: ${newPassword}`);
      updated++;
    }

    console.log(`\n✅ Successfully reset ${updated} passwords!`);
    console.log('\n📝 Test login with:');
    console.log('   ID: 82400469');
    console.log('   Password: 82400469K3\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

resetPasswords();
