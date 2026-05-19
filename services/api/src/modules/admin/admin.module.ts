import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NumbersModule } from '../numbers/numbers.module';

@Module({
  imports: [AuditLogsModule, NumbersModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
