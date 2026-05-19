import { Controller, Get, Patch, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'User profile returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.getMe(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateMe(@CurrentUser() user: { id: string }, @Body() dto: any) {
    return this.usersService.updateMe(user.id, dto);
  }

  @Patch('me/theme')
  @ApiOperation({ summary: 'Update my theme preference' })
  async updateTheme(@CurrentUser() user: { id: string }, @Body() dto: { theme: string; platform?: string }) {
    return this.usersService.updateTheme(user.id, dto.theme, dto.platform);
  }

  @Get('me/reports')
  @ApiOperation({ summary: 'Get my submitted reports' })
  async getMyReports(
    @CurrentUser() user: { id: string },
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.usersService.getMyReports(user.id, +page, +limit);
  }

  @Get('me/blocked')
  @ApiOperation({ summary: 'Get my blocked numbers' })
  async getMyBlocked(@CurrentUser() user: { id: string }) {
    return this.usersService.getMyBlocked(user.id);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete/deactivate my account' })
  @ApiResponse({ status: 200, description: 'Account deleted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAccount(@CurrentUser() user: { id: string }) {
    return this.usersService.deleteAccount(user.id);
  }
}
