import {
  Controller, Get, Post, Patch, Body, Param, Query, Res, UseGuards
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth('JWT')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  @ApiResponse({ status: 403, description: 'Forbidden — admin role required' })
  async dashboard() {
    return this.adminService.getDashboard();
  }

  @Get('numbers')
  @ApiOperation({ summary: 'List all phone numbers' })
  async numbers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getNumbers(+page, +limit, search);
  }

  @Patch('numbers/:id')
  @ApiOperation({ summary: 'Update phone number record' })
  async updateNumber(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: { id: string },
  ) {
    return this.adminService.updateNumber(id, dto, user.id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'List reports for review' })
  async reports(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
  ) {
    return this.adminService.getReports(+page, +limit, status);
  }

  @Post('reports/:id/approve')
  @ApiOperation({ summary: 'Approve a report' })
  @ApiResponse({ status: 201, description: 'Report approved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async approveReport(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.adminService.reviewReport(id, 'approve', user.id);
  }

  @Post('reports/:id/reject')
  @ApiOperation({ summary: 'Reject a report' })
  @ApiResponse({ status: 201, description: 'Report rejected' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async rejectReport(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.adminService.reviewReport(id, 'reject', user.id);
  }

  @Get('business/pending')
  @ApiOperation({ summary: 'List pending business claims' })
  async pendingBusiness(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status = 'PENDING',
  ) {
    return this.adminService.getBusinessClaims(+page, +limit, status);
  }

  @Post('business/:id/approve')
  @ApiOperation({ summary: 'Approve a business claim' })
  @ApiResponse({ status: 201, description: 'Business claim approved' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async approveBusiness(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.adminService.reviewBusinessClaim(id, 'approve', user.id);
  }

  @Post('business/:id/reject')
  @ApiOperation({ summary: 'Reject a business claim' })
  @ApiResponse({ status: 201, description: 'Business claim rejected' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async rejectBusiness(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.adminService.reviewBusinessClaim(id, 'reject', user.id);
  }

  @Get('disputes')
  @ApiOperation({ summary: 'List disputes' })
  async disputes(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status = 'PENDING',
  ) {
    return this.adminService.getDisputes(+page, +limit, status);
  }

  @Post('disputes/:id/approve')
  @ApiOperation({ summary: 'Approve a dispute (apply correction)' })
  @ApiResponse({ status: 201, description: 'Dispute approved and correction applied' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async approveDispute(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.adminService.reviewDispute(id, 'approve', user.id);
  }

  @Post('disputes/:id/reject')
  @ApiOperation({ summary: 'Reject a dispute' })
  @ApiResponse({ status: 201, description: 'Dispute rejected' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async rejectDispute(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.adminService.reviewDispute(id, 'reject', user.id);
  }

  @Get('users')
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'search', required: false })
  async users(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(+page, +limit, search);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update a user (ban, trust score, role)' })
  async updateUser(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: { id: string },
  ) {
    return this.adminService.updateUser(id, dto, user.id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get admin audit logs' })
  async auditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getAuditLogs(+page, +limit);
  }

  @Get('waitlist')
  @ApiOperation({ summary: 'Get waitlist entries' })
  async waitlist(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getWaitlist(+page, +limit);
  }

  @Get('waitlist/export')
  @ApiOperation({ summary: 'Export waitlist as CSV' })
  async exportWaitlist(@Res() res: Response) {
    const { data } = await this.adminService.getWaitlist(1, 10000);
    const rows = ['email,phone,country,source,signedUp'];
    for (const e of data as any[]) {
      rows.push(`${e.email},${e.phoneNumber ?? ''},${e.country ?? ''},${e.source ?? ''},${e.createdAt}`);
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="clearring-waitlist.csv"');
    res.send(rows.join('\n'));
  }
}
