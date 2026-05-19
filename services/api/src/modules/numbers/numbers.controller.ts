import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  Optional,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { NumbersService } from './numbers.service';
import { ReportNumberDto, MarkSafeDto, BlockNumberDto, SuggestCorrectionDto } from './numbers.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';

@ApiTags('numbers')
@Controller('numbers')
export class NumbersController {
  constructor(private readonly numbersService: NumbersService) {}

  @Get('lookup')
  @Throttle({ lookup: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Look up caller intelligence for a phone number' })
  @ApiQuery({ name: 'number', example: '+919876543210', description: 'Phone number to look up' })
  @ApiResponse({ status: 200, description: 'Caller intelligence data returned successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number format' })
  @ApiResponse({ status: 429, description: 'Too many requests — rate limited' })
  async lookup(@Query('number') number: string, @Request() req: any) {
    const userId = req.user?.id;
    return this.numbersService.lookup(number, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get phone number record by ID' })
  async getById(@Param('id') id: string) {
    return this.numbersService.getNumberById(id);
  }

  @Get(':id/reports')
  @ApiOperation({ summary: 'Get approved reports for a number' })
  async getReports(
    @Param('id') id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.numbersService.getReports(id, +page, +limit);
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Report a phone number' })
  @ApiResponse({ status: 201, description: 'Report submitted for review' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async report(@Body() dto: ReportNumberDto, @CurrentUser() user: { id: string }) {
    return this.numbersService.reportNumber(dto, user.id);
  }

  @Post('mark-safe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mark a phone number as safe' })
  async markSafe(@Body() dto: MarkSafeDto, @CurrentUser() user: { id: string }) {
    return this.numbersService.markSafe(dto, user.id);
  }

  @Post('block')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Block a phone number' })
  @ApiResponse({ status: 201, description: 'Number blocked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async block(@Body() dto: BlockNumberDto, @CurrentUser() user: { id: string }) {
    return this.numbersService.blockNumber(dto, user.id);
  }

  @Post('suggest-correction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Suggest a correction for a number label' })
  async suggestCorrection(@Body() dto: SuggestCorrectionDto, @CurrentUser() user: { id: string }) {
    return this.numbersService.suggestCorrection(dto, user.id);
  }
}
