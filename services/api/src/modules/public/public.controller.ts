import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PublicService } from './public.service';

class WaitlistDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'IN' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'website' })
  @IsOptional()
  @IsString()
  source?: string;
}

@ApiTags('public')
@Controller('waitlist')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Join the ClearRing waitlist' })
  async joinWaitlist(@Body() dto: WaitlistDto) {
    return this.publicService.joinWaitlist(dto);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get waitlist count' })
  async getCount() {
    return this.publicService.getWaitlistCount();
  }
}
