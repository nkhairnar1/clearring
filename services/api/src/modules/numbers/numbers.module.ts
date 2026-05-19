import { Module } from '@nestjs/common';
import { NumbersController } from './numbers.controller';
import { NumbersService } from './numbers.service';
import { SpamScoringService } from './spam-scoring.service';

@Module({
  controllers: [NumbersController],
  providers: [NumbersService, SpamScoringService],
  exports: [NumbersService, SpamScoringService],
})
export class NumbersModule {}
