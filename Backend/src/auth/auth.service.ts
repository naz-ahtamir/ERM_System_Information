import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { differenceInYears, differenceInMonths, differenceInDays } from 'date-fns';
import { UpdateUserDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/update-user.dto';

// In-memory token store (gunakan Redis / DB di production)
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // ── Hitung umur otomatis ──
  private hitungUmur(tanggalLahir: Date | null): number | null {
    if (!tanggalLahir) return null;
    return differenceInYears(new Date(), tanggalLahir);
  }

  // ── Hitung masa kerja otomatis ──
  private hitungMasaKerja(tanggalMulai: Date | null): string | null {
    if (!tanggalMulai) return null;
    const now = new Date();
    const years  = differenceInYears(now, tanggalMulai);
    const months = differenceInMonths(now, tanggalMulai) % 12;
    const days   = differenceInDays(now, tanggalMulai) % 30;
    return `${years} Tahun ${months} Bulan ${days} Hari`;
  }

  // ── Format user response ──
  private formatUser(user: any) {
    const { password, ...rest } = user;
    return {
      ...rest,
      umur:      this.hitungUmur(user.tanggalLahir),
      masaKerja: this.hitungMasaKerja(user.tanggalMulaiKerja),
    };
  }

  // ── Login pakai idKaryawan ──
  async login(idKaryawan: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { idKaryawan },
    });

    if (!user) {
      throw new UnauthorizedException('ID Karyawan atau password salah');
    }

    if (!user.approved) {
      throw new UnauthorizedException('Akun tidak aktif. Hubungi admin.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('ID Karyawan atau password salah');
    }

    const payload = {
      id:          user.id,
      idKaryawan:  user.idKaryawan,
      nama:        user.nama,
      role:        user.role,
      departemen:  user.departemen,
      supervisorId: user.supervisorId,
    };

    const token = this.jwtService.sign(payload);

    return {
      user: this.formatUser(user),
      token,
    };
  }

  // ── Bulk create users dari Excel ──
  async bulkCreateUsers(usersData: any[]) {
    const results = {
      success: [] as any[],
      failed: [] as any[],
    };

    const SUPERVISOR_KEYWORDS = [
      'wakil foreman', '副班长', 'foreman', '班长',
      'supervisor', 'manager', 'superintendent', 'kepala', 'head',
    ];
    const ADMIN_IDS = ['82400944'];

    for (const userData of usersData) {
      try {
        const existing = await this.prisma.user.findUnique({
          where: { idKaryawan: userData.idKaryawan },
        });

        if (existing) {
          results.failed.push({
            idKaryawan: userData.idKaryawan,
            reason: 'User sudah ada',
          });
          continue;
        }

        let role: 'admin' | 'supervisor' | 'user' = 'user';
        if (ADMIN_IDS.includes(userData.idKaryawan)) {
          role = 'admin';
        } else if (userData.jabatan) {
          const lower = userData.jabatan.toLowerCase();
          if (SUPERVISOR_KEYWORDS.some(k => lower.includes(k))) {
            role = 'supervisor';
          }
        }

        const hashedPassword = await bcrypt.hash(
          `${userData.idKaryawan}K3`, 10
        );

        const user = await this.prisma.user.create({
          data: {
            idKaryawan:       userData.idKaryawan,
            nama:             userData.nama,
            jabatan:          userData.jabatan,
            departemen:       userData.departemen,
            divisi:           userData.divisi,
            pusat:            userData.pusat,
            perusahaan:       userData.perusahaan,
            tanggalLahir:     userData.tanggalLahir     ? new Date(userData.tanggalLahir)     : null,
            tempatLahir:      userData.tempatLahir      ?? null,
            tanggalMulaiKerja: userData.tanggalMulaiKerja ? new Date(userData.tanggalMulaiKerja) : null,
            agama:            userData.agama            ?? null,
            jenisKelamin:     userData.jenisKelamin     ?? null,
            pendidikan:       userData.pendidikan       ?? null,
            namaSekolah:      userData.namaSekolah      ?? null,
            jurusan:          userData.jurusan          ?? null,
            password:         hashedPassword,
            role,
            approved:         true,
          },
        });

        results.success.push({
          idKaryawan: user.idKaryawan,
          nama:       user.nama,
          role:       user.role,
        });
      } catch (err: any) {
        results.failed.push({
          idKaryawan: userData.idKaryawan,
          reason:     err.message,
        });
      }
    }

    return results;
  }

  // ── Assign supervisor ke user (admin only) ──
  async assignSupervisor(userId: string, supervisorId: string | null) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // Jika supervisorId diberikan, pastikan supervisor-nya ada
    if (supervisorId) {
      const supervisor = await this.prisma.user.findUnique({ where: { id: supervisorId } });
      if (!supervisor) throw new NotFoundException('Supervisor tidak ditemukan');
      // Cegah user assign dirinya sendiri sebagai supervisor
      if (supervisorId === userId) {
        throw new BadRequestException('User tidak bisa menjadi supervisor dirinya sendiri');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { supervisorId: supervisorId ?? null },
      select: {
        id: true,
        idKaryawan: true,
        nama: true,
        supervisorId: true,
      },
    });

    return {
      message: supervisorId
        ? 'Supervisor berhasil di-assign'
        : 'Supervisor berhasil dihapus',
      user: updated,
    };
  }

  // ── Get semua user (admin only) ──
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id:               true,
        idKaryawan:       true,
        nama:             true,
        jabatan:          true,
        departemen:       true,
        email:            true,
        role:             true,
        supervisorId:     true,
        tanggalLahir:     true,
        tanggalMulaiKerja: true,
        approved:         true,
        createdAt:        true,
      },
      orderBy: { nama: 'asc' },
    });

    return users.map(u => ({
      ...u,
      umur:      this.hitungUmur(u.tanggalLahir),
      masaKerja: this.hitungMasaKerja(u.tanggalMulaiKerja),
    }));
  }

  // ── Get user by ID ──
  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id:               true,
        idKaryawan:       true,
        nama:             true,
        jabatan:          true,
        departemen:       true,
        divisi:           true,
        pusat:            true,
        perusahaan:       true,
        email:            true,
        role:             true,
        supervisorId:     true,
        tanggalLahir:     true,
        tempatLahir:      true,
        agama:            true,
        jenisKelamin:     true,
        pendidikan:       true,
        namaSekolah:      true,
        jurusan:          true,
        tanggalMulaiKerja: true,
        approved:         true,
        createdAt:        true,
        updatedAt:        true,
        centerId:         true,
        departmentId:     true,
        divisionId:       true,
      },
    });

    if (!user) throw new NotFoundException('User tidak ditemukan');

    return {
      ...user,
      umur:      this.hitungUmur(user.tanggalLahir),
      masaKerja: this.hitungMasaKerja(user.tanggalMulaiKerja),
    };
  }

  // ── Lookup user by idKaryawan — untuk form license-certification ──
  async getUserByIdKaryawan(idKaryawan: string) {
    const user = await this.prisma.user.findUnique({
      where: { idKaryawan },
      select: {
        id:          true,
        idKaryawan:  true,
        nama:        true,
        jabatan:     true,
        departemen:  true,
        divisi:      true,
        perusahaan:  true,
      },
    });
    if (!user) return null;
    return user;
  }

  // ────────────────────────────────────────────────────
  // TASK 1: Soft delete — set approved=false
  // ────────────────────────────────────────────────────
  async deactivateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { approved: false },
      select: {
        id: true, idKaryawan: true, nama: true,
        jabatan: true, departemen: true, role: true, approved: true,
      },
    });

    return { message: 'User berhasil dinonaktifkan', user: updated };
  }

  // ── Reactivate user ──
  async activateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { approved: true },
      select: {
        id: true, idKaryawan: true, nama: true,
        jabatan: true, departemen: true, role: true, approved: true,
      },
    });

    return { message: 'User berhasil diaktifkan', user: updated };
  }

  // ────────────────────────────────────────────────────
  // TASK 2: Update user profile
  // ────────────────────────────────────────────────────
  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.nama         !== undefined && { nama: dto.nama }),
        ...(dto.jabatan      !== undefined && { jabatan: dto.jabatan }),
        ...(dto.departemen   !== undefined && { departemen: dto.departemen }),
        ...(dto.divisi       !== undefined && { divisi: dto.divisi }),
        ...(dto.pusat        !== undefined && { pusat: dto.pusat }),
        ...(dto.perusahaan   !== undefined && { perusahaan: dto.perusahaan }),
        ...(dto.email        !== undefined && { email: dto.email }),
        // FK fields baru (nullable — kirim null untuk unset)
        ...(dto.centerId     !== undefined && { centerId: dto.centerId }),
        ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
        ...(dto.divisionId   !== undefined && { divisionId: dto.divisionId }),
      },
      select: {
        id: true, idKaryawan: true, nama: true, jabatan: true,
        departemen: true, divisi: true, pusat: true, perusahaan: true,
        email: true, role: true, approved: true,
        centerId: true, departmentId: true, divisionId: true,
        centerData:     { select: { id: true, name: true, code: true } },
        departmentData: { select: { id: true, name: true, code: true } },
        divisionData:   { select: { id: true, name: true,
          pic: { select: { id: true, idKaryawan: true, nama: true } } } },
      },
    });

    return { message: 'Profil berhasil diperbarui', user: updated };
  }

  // ────────────────────────────────────────────────────
  // TASK 3: Forgot password — generate reset token
  // ────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { idKaryawan: dto.idKaryawan },
    });

    // Jangan reveal apakah user exist atau tidak (security)
    if (!user) {
      return {
        message: 'Jika ID Karyawan terdaftar, token reset telah dibuat.',
        // Dev helper: kembalikan token jika tidak ada email service
        ...(process.env.NODE_ENV !== 'production' && { debug: 'User tidak ditemukan' }),
      };
    }

    // Generate secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 jam

    // Hapus token lama untuk user ini
    for (const [t, data] of resetTokens.entries()) {
      if (data.userId === user.id) resetTokens.delete(t);
    }

    resetTokens.set(token, { userId: user.id, expiresAt });

    // TODO: Kirim email dengan token jika EMAIL_SERVICE dikonfigurasi
    // Untuk sekarang, return token di development mode
    const response: any = {
      message: 'Token reset password berhasil dibuat. Berlaku 1 jam.',
    };

    if (process.env.NODE_ENV !== 'production') {
      response.resetToken = token;
      response.resetUrl   = `/reset-password?token=${token}`;
      response.note       = 'Token ini hanya muncul di development mode';
    }

    return response;
  }

  // ── Validate reset token ──
  async validateResetToken(token: string) {
    const data = resetTokens.get(token);
    if (!data || data.expiresAt < Date.now()) {
      throw new BadRequestException('Token tidak valid atau sudah kedaluwarsa');
    }
    return { valid: true };
  }

  // ── Reset password dengan token ──
  async resetPassword(dto: ResetPasswordDto) {
    const data = resetTokens.get(dto.token);
    if (!data || data.expiresAt < Date.now()) {
      throw new BadRequestException('Token tidak valid atau sudah kedaluwarsa');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: data.userId },
      data: { password: hashedPassword },
    });

    // Hapus token setelah berhasil dipakai
    resetTokens.delete(dto.token);

    return { message: 'Password berhasil direset' };
  }

  // ────────────────────────────────────────────────────
  // TASK 4: Change password (user mengubah password sendiri)
  // ────────────────────────────────────────────────────
  async changePassword(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Password saat ini tidak sesuai');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Password baru tidak boleh sama dengan password lama');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }

  // ── Update role (admin only) ──
  async updateUserRole(userId: string, role: 'admin' | 'supervisor' | 'user') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, idKaryawan: true, nama: true, role: true },
    });
  }
}
