import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check — cek apakah API berjalan' })
  @ApiResponse({ status: 200, description: 'API aktif', schema: { example: 'Hello World!' } })
  getHello(): string {
    return this.appService.getHello();
  }
}
