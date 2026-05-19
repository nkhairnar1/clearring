import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('public')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check — verifies database and Redis connectivity' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  async check() {
    return this.healthService.check();
  }
}
