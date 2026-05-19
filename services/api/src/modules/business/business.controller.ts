import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post('claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Submit a business verification claim' })
  @ApiResponse({ status: 201, description: 'Claim submitted for review' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async claim(@Body() dto: any, @CurrentUser() user: { id: string }) {
    return this.businessService.claimBusiness(dto, user.id);
  }

  @Get('my-claims')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get my business claims' })
  @ApiResponse({ status: 200, description: 'List of business claims' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async myClaims(@CurrentUser() user: { id: string }) {
    return this.businessService.getMyClaims(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get business profile by ID' })
  async getProfile(@Param('id') id: string) {
    return this.businessService.getProfile(id);
  }

  @Post(':id/call-reasons')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Add call reason to business profile' })
  async addCallReason(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: { id: string },
  ) {
    return this.businessService.addCallReason(id, dto, user.id);
  }
}
