import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './shared/prisma/prisma.module';
import { RedisModule } from './shared/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NumbersModule } from './modules/numbers/numbers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { BusinessModule } from './modules/business/business.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { HealthModule } from './modules/health/health.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ThrottlerModule.forRoot([
      { name: 'global', ttl: 60000, limit: 100 },
      { name: 'auth', ttl: 60000, limit: 5 },    // strict: OTP endpoints
      { name: 'lookup', ttl: 60000, limit: 30 },  // moderate: phone lookups
    ]),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    NumbersModule,
    ReportsModule,
    BusinessModule,
    DisputesModule,
    AdminModule,
    AnalyticsModule,
    AuditLogsModule,
    HealthModule,
    PublicModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
