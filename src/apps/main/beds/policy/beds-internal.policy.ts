import { AbilityBuilder, AbilityClass, PureAbility } from '@casl/ability';
import { BedsAbilityType } from './beds-external.policy';
import { Injectable } from '@nestjs/common';
import { CaslActionsEnum } from 'src/resources/enums/casl-actions.enum';
import { Bed } from '../entities/bed.entity';
import { User } from '../../users/entities/user.entity';
import { CreateBedDto } from '../dto/create-bed.dto';

@Injectable()
export class BedInternalPolicy {
  constructor() {}

  definePolicy(user: User, obj: CreateBedDto) {
    const ability = new AbilityBuilder(
      PureAbility as AbilityClass<BedsAbilityType>,
    );

    if (user?.isAdmin) {
      ability.can(CaslActionsEnum.MANAGE, Bed);
    } else {
      if (obj.bedNo?.startsWith('2')) {
        ability.can(CaslActionsEnum.WRITE, Bed);
      } else {
        ability
          .cannot(CaslActionsEnum.WRITE, Bed)
          .because(
            `You are not admin and you can create only bed no starts with 2`,
          );
      }
    }

    return ability.build();
  }
}
