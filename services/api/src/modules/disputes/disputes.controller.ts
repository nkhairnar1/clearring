import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a dispute for a number label' })
  async create(@Body() dto: any, @CurrentUser() user: { id: string }) {
    return this.disputesService.createDispute(dto, user.id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my submitted disputes' })
  async getMyDisputes(@CurrentUser() user: { id: string }) {
    return this.disputesService.getMyDisputes(user.id);
  }
}
