import { Module } from '@nestjs/common';
import { BedsAdminGateway } from './beds-admin.gateway';
import { BedsController } from './beds.controller';
import { BedsGateway } from './beds.gateway';
import { BedsService } from './beds.service';
import { BedInternalPolicy } from './policy/beds-internal.policy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bed } from './entities/bed.entity';

@Module({
  controllers: [BedsController],
  providers: [BedsService, BedsGateway, BedsAdminGateway, BedInternalPolicy],
  imports: [TypeOrmModule.forFeature([Bed])],
})
export class BedsModule {}
