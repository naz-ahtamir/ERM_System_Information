import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Pakai ConfigService agar secret konsisten dengan yang dipakai saat sign
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'your-secret-key',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user || !user.approved) {
      throw new UnauthorizedException('User tidak valid');
    }

    return {
      id: user.id,
      idKaryawan: user.idKaryawan,
      nama: user.nama,
      role: user.role,
      departemen: user.departemen,
      supervisorId: user.supervisorId,
    };
  }
}
