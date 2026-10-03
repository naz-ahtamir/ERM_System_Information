import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

@Injectable()
export class InductionService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Helpers ──────────────────────────────────────────────────────────────

  /** Generate kode sesi: SI-YYMM-NNN */
  private async generateKodeSesi(): Promise<string> {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `SI-${yy}${mm}-`;

    const last = await this.prisma.inductionSession.findFirst({
      where: { kodeSesi: { startsWith: prefix } },
      orderBy: { kodeSesi: 'desc' },
    });

    let seq = 1;
    if (last) {
      const parts = last.kodeSesi.split('-');
      seq = parseInt(parts[parts.length - 1], 10) + 1;
    }

    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  /** Generate card code: IC-<sessionKode>-<random 4 hex> */
  private generateCardCode(kodeSesi: string): string {
    const rand = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .toUpperCase()
      .padStart(4, '0');
    return `IC-${kodeSesi}-${rand}`;
  }

  // ── Sessions ─────────────────────────────────────────────────────────────

  async createSession(dto: CreateSessionDto) {
    const kodeSesi = await this.generateKodeSesi();

    const session = await this.prisma.inductionSession.create({
      data: {
        kodeSesi,
        tanggal: new Date(dto.tanggal),
        lokasi: dto.lokasi,
        topik: dto.topik,
        deskripsi: dto.deskripsi,
        picId: dto.picId || null,
        status: dto.status ?? 'INPG', // Default INPG (In Progress)
      },
      include: { pic: { select: { id: true, nama: true, jabatan: true } }, participants: true, media: true },
    });

    return session;
  }

  async findAllSessions(status?: string) {
    return this.prisma.inductionSession.findMany({
      where: status ? { status } : undefined,
      include: {
        pic: { select: { id: true, nama: true, jabatan: true } },
        _count: { select: { participants: true, media: true } },
      },
      orderBy: { tanggal: 'desc' },
    });
  }

  async findSessionByKode(kodeSesi: string) {
    const session = await this.prisma.inductionSession.findUnique({
      where: { kodeSesi },
      include: {
        pic: { select: { id: true, nama: true, jabatan: true } },
        participants: {
          include: { user: { select: { id: true, nama: true, jabatan: true, departemen: true } } },
          orderBy: { scanTime: 'asc' },
        },
        media: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!session) throw new NotFoundException(`Sesi ${kodeSesi} tidak ditemukan`);
    return session;
  }

  async findSessionById(id: string) {
    const session = await this.prisma.inductionSession.findUnique({
      where: { id },
      include: {
        pic: { select: { id: true, nama: true, jabatan: true } },
        participants: {
          include: { user: { select: { id: true, nama: true, jabatan: true, departemen: true } } },
          orderBy: { scanTime: 'asc' },
        },
        media: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!session) throw new NotFoundException(`Sesi tidak ditemukan`);
    return session;
  }

  async updateSession(id: string, dto: Partial<CreateSessionDto> & { status?: string }) {
    await this.findSessionById(id);
    return this.prisma.inductionSession.update({
      where: { id },
      data: {
        ...(dto.tanggal ? { tanggal: new Date(dto.tanggal) } : {}),
        ...(dto.lokasi !== undefined ? { lokasi: dto.lokasi } : {}),
        ...(dto.topik !== undefined ? { topik: dto.topik } : {}),
        ...(dto.deskripsi !== undefined ? { deskripsi: dto.deskripsi } : {}),
        ...(dto.picId !== undefined ? { picId: dto.picId } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
      include: {
        pic: { select: { id: true, nama: true } },
        _count: { select: { participants: true } },
      },
    });
  }

  async deleteSession(id: string) {
    await this.findSessionById(id);
    await this.prisma.inductionSession.delete({ where: { id } });
  }

  // ── Participants ──────────────────────────────────────────────────────────

  /**
   * Cek duplikat berdasarkan identitas (NIK).
   * Return peserta sebelumnya jika ada (lintas sesi), null jika baru.
   */
  async checkDuplicate(identitas: string) {
    if (!identitas) return null;
    const existing = await this.prisma.inductionParticipant.findFirst({
      where: { identitas },
      include: {
        session: { select: { id: true, kodeSesi: true, tanggal: true, lokasi: true } },
      },
      orderBy: { scanTime: 'desc' },
    });
    return existing ?? null;
  }

  async addParticipant(sessionId: string, dto: AddParticipantDto) {
    // Pastikan sesi ada
    const session = await this.findSessionById(sessionId);

    // Cek duplikat dalam sesi ini
    if (dto.identitas) {
      const existingInSession = await this.prisma.inductionParticipant.findUnique({
        where: { sessionId_identitas: { sessionId, identitas: dto.identitas } },
      });
      if (existingInSession) {
        throw new ConflictException(
          `Peserta dengan identitas ${dto.identitas} sudah terdaftar di sesi ini`,
        );
      }
    }
    if (dto.userId) {
      const existingUser = await this.prisma.inductionParticipant.findUnique({
        where: { sessionId_userId: { sessionId, userId: dto.userId } },
      });
      if (existingUser) {
        throw new ConflictException('Karyawan ini sudah terdaftar di sesi ini');
      }
    }

    const cardCode = this.generateCardCode(session.kodeSesi);

    const participant = await this.prisma.inductionParticipant.create({
      data: {
        sessionId,
        userId: dto.userId ?? null,
        nama: dto.nama,
        perusahaan: dto.perusahaan ?? null,
        identitas: dto.identitas ?? null,
        noTelp: dto.noTelp ?? null,
        email: dto.email ?? null,
        jabatan: dto.jabatan ?? null,
        jenisKelamin: dto.jenisKelamin ?? null,
        tipe: dto.tipe ?? 'EXTERNAL',
        scanMethod: dto.scanMethod ?? 'MANUAL',
        scanTime: new Date(),
        statusHadir: 'HADIR',
        cardCode,
        cardIssuedAt: new Date(),
      },
    });

    return participant;
  }

  async updateParticipantStatus(participantId: string, statusHadir: string) {
    return this.prisma.inductionParticipant.update({
      where: { id: participantId },
      data: { statusHadir },
    });
  }

  async removeParticipant(participantId: string) {
    await this.prisma.inductionParticipant.delete({ where: { id: participantId } });
  }

  async getParticipantByCardCode(cardCode: string) {
    const p = await this.prisma.inductionParticipant.findFirst({
      where: { cardCode },
      include: {
        session: { select: { id: true, kodeSesi: true, tanggal: true, lokasi: true, topik: true } },
      },
    });
    if (!p) throw new NotFoundException('Kartu induksi tidak ditemukan');
    return p;
  }

  // ── Media ─────────────────────────────────────────────────────────────────

  async addMedia(
    sessionId: string,
    type: string,
    fileUrl: string,
    fileName: string,
    fileSize: number,
    mimeType: string,
    uploadedBy: string,
  ) {
    await this.findSessionById(sessionId);
    return this.prisma.inductionMedia.create({
      data: { sessionId, type, fileUrl, fileName, fileSize, mimeType, uploadedBy },
    });
  }

  async removeMedia(mediaId: string) {
    await this.prisma.inductionMedia.delete({ where: { id: mediaId } });
  }

  // ── QR self-register (endpoint publik) ───────────────────────────────────

  /**
   * Dipakai halaman scan publik — tidak perlu JWT.
   * Scan QR → cek sesi aktif → cek duplikat → daftarkan peserta.
   */
  async selfRegister(kodeSesi: string, dto: AddParticipantDto) {
    const session = await this.findSessionByKode(kodeSesi);

    if (session.status !== 'INPG') {
      throw new ConflictException(`Sesi ${kodeSesi} tidak sedang berlangsung (status: ${session.status})`);
    }

    // Cek duplikat dalam sesi
    if (dto.identitas) {
      const dup = await this.prisma.inductionParticipant.findUnique({
        where: { sessionId_identitas: { sessionId: session.id, identitas: dto.identitas } },
      });
      if (dup) {
        throw new ConflictException('Anda sudah terdaftar di sesi ini');
      }
    }

    const cardCode = this.generateCardCode(session.kodeSesi);

    return this.prisma.inductionParticipant.create({
      data: {
        sessionId: session.id,
        nama: dto.nama,
        perusahaan: dto.perusahaan ?? null,
        identitas: dto.identitas ?? null,
        noTelp: dto.noTelp ?? null,
        email: dto.email ?? null,
        jabatan: dto.jabatan ?? null,
        jenisKelamin: dto.jenisKelamin ?? null,
        tipe: dto.tipe ?? 'EXTERNAL',
        scanMethod: 'QR',
        scanTime: new Date(),
        statusHadir: 'HADIR',
        cardCode,
        cardIssuedAt: new Date(),
      },
    });
  }
}
