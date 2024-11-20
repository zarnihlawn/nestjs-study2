import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BedsService } from './beds.service';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';
import { CreateBedPayloadPipe } from './pipes/create-bed-payload.pipe';
import { BedsGateway } from './beds.gateway';
import { BedsAdminGateway } from './beds-admin.gateway';
import {
  CurrentUser,
  RegisterExternalPolicy,
  RegisterRule,
} from 'src/guards/policy/decorator/policy.decorator';
import {
  BuildExternalPolicyFactory,
  ReadBedsRule,
  WriteBedsRule,
} from './policy/beds-external.policy';
import { User } from '../users/entities/user.entity';
import { BedInternalPolicy } from './policy/beds-internal.policy';
import { ForbiddenError } from '@casl/ability';
import { CaslActionsEnum } from 'src/resources/enums/casl-actions.enum';
import { Bed } from './entities/bed.entity';

@Controller('beds')
@RegisterExternalPolicy(BuildExternalPolicyFactory)
export class BedsController {
  constructor(
    private bedsAdminGateway: BedsAdminGateway,
    private bedsGateway: BedsGateway,
    private bedsService: BedsService,
    private bedInternalPolicy: BedInternalPolicy,
  ) {
    // bed request from client
    this.bedsGateway.bedRequestSub.asObservable().subscribe({
      next: ({ client, bedNo }) => {
        if (client) {
          this.bedsAdminGateway.sendBedRequstToAdminPortal(client.id, bedNo);
        }
      },
    });

    // admin accept bed no
    this.bedsAdminGateway.bedNoAcceptedSub.asObservable().subscribe({
      next: ({ adminClient, clientId, bedNo }) => {
        if (adminClient) {
          this.bedsGateway.notifyClientBedNoAccepted(clientId, bedNo);
        }
      },
    });
  }

  @Post()
  // @RegisterRule(WriteBedsRule)
  create(
    @Body(CreateBedPayloadPipe) createBedDto: CreateBedDto,
    @CurrentUser() user: User,
  ) {
    const ability = this.bedInternalPolicy.definePolicy(user, createBedDto);

    try {
      ForbiddenError.from(ability).throwUnlessCan(CaslActionsEnum.WRITE, Bed);
      return this.bedsService.create(createBedDto);
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }

  @Get()
  @RegisterRule(ReadBedsRule)
  findAll() {
    return this.bedsService.findAll();
  }

  @Get(':id')
  @RegisterRule(ReadBedsRule)
  findOne(@Param('id') id: string) {
    return this.bedsService.findOne(+id);
  }

  @Patch(':id')
  @RegisterRule(WriteBedsRule)
  update(@Param('id') id: string, @Body() updateBedDto: UpdateBedDto) {
    return this.bedsService.update(+id, updateBedDto);
  }

  @Delete(':id')
  @RegisterRule(WriteBedsRule)
  remove(@Param('id') id: string) {
    return this.bedsService.remove(+id);
  }
}
