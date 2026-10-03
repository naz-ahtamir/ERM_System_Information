const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres123@localhost:5432/smk3_db";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding admin user...\n');
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { idKaryawan: '82400944' },
    });

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log(`   ID: ${existingAdmin.idKaryawan}`);
      console.log(`   Nama: ${existingAdmin.nama}`);
      console.log(`\n🔄 Resetting admin password...\n`);
      
      const hashedPassword = await bcrypt.hash('82400944K3', 10);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
      });
      
      console.log('✅ Admin password reset successfully!');
    } else {
      const hashedPassword = await bcrypt.hash('82400944K3', 10);
      
      const admin = await prisma.user.create({
        data: {
          idKaryawan: '82400944',
          nama: 'Admin User',
          jabatan: 'Administrator',
          departemen: 'IT',
          divisi: 'Technology',
          pusat: 'Head Office',
          perusahaan: 'PT SMK3',
          password: hashedPassword,
          role: 'admin',
          approved: true,
        },
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   ID: ${admin.idKaryawan}`);
      console.log(`   Nama: ${admin.nama}`);
    }

    console.log('\n🔑 Admin credentials:');
    console.log('   ID Karyawan: 82400944');
    console.log('   Password: 82400944K3\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

seedAdmin();
