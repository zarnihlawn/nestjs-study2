import { Module } from '@nestjs/common';
import { SnacksService } from './snacks.service';
import { SnacksController } from './snacks.controller';

@Module({
  controllers: [SnacksController],
  providers: [SnacksService],
})
export class SnacksModule {}
