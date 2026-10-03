import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UpdateUserDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/update-user.dto';
import { BulkCreateUsersRequestDto } from './dto/bulk-create-user.dto';

@ApiTags('Auth & Users')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── POST login ────────────────────────────────────────────────────────────

  @Post('login')
  @ApiOperation({ summary: 'Login dengan ID Karyawan dan password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['idKaryawan', 'password'],
      properties: {
        idKaryawan: { type: 'string', example: 'EMP-001' },
        password:   { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Login berhasil, mengembalikan JWT token' })
  @ApiResponse({ status: 401, description: 'ID Karyawan atau password salah' })
  async login(@Body() body: { idKaryawan: string; password: string }) {
    return this.authService.login(body.idKaryawan, body.password);
  }

  // ── POST bulk create users ────────────────────────────────────────────────

  @Post('bulk-create-users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bulk create users dari Excel import' })
  @ApiBody({ type: BulkCreateUsersRequestDto })
  @ApiResponse({ status: 201, description: 'Users berhasil dibuat' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  async bulkCreateUsers(@Body() body: { users: any[] }) {
    return this.authService.bulkCreateUsers(body.users);
  }

  // ── GET semua users ───────────────────────────────────────────────────────

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get semua user' })
  @ApiResponse({ status: 200, description: 'List semua user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden — hanya admin' })
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  // ── GET user by idKaryawan ────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('users/by-id-karyawan/:idKaryawan')
  @ApiOperation({ summary: 'Lookup user by ID Karyawan' })
  @ApiParam({ name: 'idKaryawan', description: 'ID Karyawan', example: 'EMP-001' })
  @ApiResponse({ status: 200, description: 'User ditemukan' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserByIdKaryawan(@Param('idKaryawan') idKaryawan: string) {
    return this.authService.getUserByIdKaryawan(idKaryawan);
  }

  // ── GET user by ID ────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by UUID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User ditemukan' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  // ── PATCH assign supervisor ───────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('users/:userId/supervisor')
  @ApiOperation({ summary: 'Assign supervisor ke user (admin only)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        supervisorId: {
          type: 'string',
          nullable: true,
          example: 'uuid-supervisor',
          description: 'UUID supervisor, atau null untuk hapus assignment',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Supervisor berhasil di-assign' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async assignSupervisor(
    @Param('userId') userId: string,
    @Body() body: { supervisorId: string | null },
  ) {
    return this.authService.assignSupervisor(userId, body.supervisorId ?? null);
  }

  // ── PATCH deactivate user ─────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (soft delete)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User berhasil di-deactivate' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deactivateUser(@Param('id') id: string) {
    return this.authService.deactivateUser(id);
  }

  // ── PATCH activate user ───────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('users/:id/activate')
  @ApiOperation({ summary: 'Reactivate user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User berhasil di-activate' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activateUser(@Param('id') id: string) {
    return this.authService.activateUser(id);
  }

  // ── PATCH update user ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user profile (nama, jabatan, departemen, dll)' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User berhasil diupdate' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.authService.updateUser(id, dto);
  }

  // ── PATCH update role ─────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('users/:userId/role')
  @ApiOperation({ summary: 'Update role user (admin only)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['admin', 'supervisor', 'user'], example: 'supervisor' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Role berhasil diupdate' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() body: { role: 'admin' | 'supervisor' | 'user' },
  ) {
    return this.authService.updateUserRole(userId, body.role);
  }

  // ── POST forgot password ──────────────────────────────────────────────────

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request reset password token' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Reset token terkirim' })
  @ApiResponse({ status: 404, description: 'User tidak ditemukan' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  // ── GET validate reset token ──────────────────────────────────────────────

  @Get('reset-password/:token/validate')
  @ApiOperation({ summary: 'Validate reset password token' })
  @ApiParam({ name: 'token', description: 'Reset password token' })
  @ApiResponse({ status: 200, description: 'Token valid' })
  @ApiResponse({ status: 400, description: 'Token invalid atau expired' })
  async validateResetToken(@Param('token') token: string) {
    return this.authService.validateResetToken(token);
  }

  // ── POST reset password ───────────────────────────────────────────────────

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password dengan token' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password berhasil direset' })
  @ApiResponse({ status: 400, description: 'Token invalid atau expired' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // ── POST change password (me) ─────────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('me/change-password')
  @ApiOperation({ summary: 'Change password untuk user yang sedang login' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 400, description: 'Password lama salah' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePasswordMe(
    @Request() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }

  // ── POST change password (legacy) ────────────────────────────────────────

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('users/:id/change-password')
  @ApiOperation({ summary: 'Change password (legacy endpoint, gunakan JWT id)' })
  @ApiParam({ name: 'id', description: 'User UUID (diabaikan, menggunakan JWT)' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password berhasil diubah' })
  @ApiResponse({ status: 400, description: 'Password lama salah' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() req: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
