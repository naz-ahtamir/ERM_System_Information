require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'admin' },
    select: { idKaryawan: true, nama: true, role: true, approved: true }
  });
  console.log('Admin users:', JSON.stringify(admins, null, 2));
  
  const total = await prisma.user.count();
  console.log('Total users:', total);
  
  // Test departments
  const depts = await prisma.department.count();
  console.log('Total departments in DB:', depts);
}

main()
  .catch(e => console.error(e))
  .finally(() => { prisma.$disconnect(); pool.end(); });
