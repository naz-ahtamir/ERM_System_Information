// src/seed.ts
import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const users = [
    {
      idKaryawan: '82400469',
      nama: 'RACHMAT, S.KM',
      jabatan: 'WAKIL FOREMAN',
      departemen: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT 应急管理部',
      divisi: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT 现场核查与应急管理',
      pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN 应急与环境管理中心',
      perusahaan: 'MEIMING',
      tempatLahir: 'WAKORAMBU',
      agama: 'ISLAM',
      jenisKelamin: 'LAKI-LAKI',
      pendidikan: 'S1',
      namaSekolah: 'UNIVERSITAS HALU OLEO',
      jurusan: 'KESEHATAN MASYARAKAT',
      password: '82400469K3',
      role: 'supervisor' as const,
      approved: true,
    },
    {
      idKaryawan: '82400945',
      nama: 'BAHTIAR',
      jabatan: 'SAFETY CONTROL',
      departemen: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT 应急管理部',
      divisi: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT 现场核查与应急管理',
      pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN 应急与环境管理中心',
      perusahaan: 'MEIMING',
      tempatLahir: 'RAJANG',
      agama: 'ISLAM',
      jenisKelamin: 'LAKI-LAKI',
      pendidikan: 'D3',
      namaSekolah: 'SEKOLAH TINGGI ILMU KESEHATAN MAKASSAR',
      jurusan: 'KESELAMATAN & KESEHATAN KERJA (K3)',
      password: '82400945K3',
      role: 'user' as const,
      approved: true,
    },
    {
      idKaryawan: '82401013',
      nama: 'DANDI',
      jabatan: 'SAFETY CONTROL',
      departemen: 'DEPARTEMEN MANAJEMEN TANGGAP DARURAT 应急管理部',
      divisi: 'PEMERIKSAAN LAPANGAN & MANAJEMEN DARURAT 现场核查与应急管理',
      pusat: 'PUSAT MANAJEMEN TANGGAP DARURAT DAN LINGKUNGAN 应急与环境管理中心',
      perusahaan: 'MEIMING',
      tempatLahir: 'S. LANGGARA',
      agama: 'ISLAM',
      jenisKelamin: 'LAKI-LAKI',
      pendidikan: 'S1',
      namaSekolah: 'UNIVERSITAS COKROAMINOTO PAOPO',
      jurusan: 'PGSD',
      password: '82401013K3',
      role: 'admin' as const,
      approved: true,
    },
  ];

  console.log('🌱 Memulai seed users...\n');

  for (const userData of users) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    await prisma.user.upsert({
      where: { idKaryawan: userData.idKaryawan },
      update: {
        nama: userData.nama,
        jabatan: userData.jabatan,
        departemen: userData.departemen,
        divisi: userData.divisi,
        pusat: userData.pusat,
        perusahaan: userData.perusahaan,
        tempatLahir: userData.tempatLahir,
        agama: userData.agama,
        jenisKelamin: userData.jenisKelamin,
        pendidikan: userData.pendidikan,
        namaSekolah: userData.namaSekolah,
        jurusan: userData.jurusan,
        password: hashedPassword,
        role: userData.role,
        approved: userData.approved,
      },
      create: {
        idKaryawan: userData.idKaryawan,
        nama: userData.nama,
        jabatan: userData.jabatan,
        departemen: userData.departemen,
        divisi: userData.divisi,
        pusat: userData.pusat,
        perusahaan: userData.perusahaan,
        tempatLahir: userData.tempatLahir,
        agama: userData.agama,
        jenisKelamin: userData.jenisKelamin,
        pendidikan: userData.pendidikan,
        namaSekolah: userData.namaSekolah,
        jurusan: userData.jurusan,
        password: hashedPassword,
        role: userData.role,
        approved: userData.approved,
      },
    });

    console.log(`✅ ${userData.idKaryawan} - ${userData.nama} (${userData.role})`);
  }

  console.log('\n🎉 Seed selesai!');
  console.log('📋 Login credentials:');
  console.log('   Admin      → 82401013 / 82401013K3');
  console.log('   Supervisor → 82400469 / 82400469K3');
  console.log('   User       → 82400945 / 82400945K3');

  await app.close();
}

seed().catch((err) => {
  console.error('❌ Seed gagal:', err);
  process.exit(1);
});