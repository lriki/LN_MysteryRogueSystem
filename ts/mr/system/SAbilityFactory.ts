import { DAbilityId } from "ts/mr/data/DAbility";
import { LAbility } from "ts/mr/objects/abilities/LAbility";

export class SAbilityFactory {
    public static newAbility(abilityId: DAbilityId): LAbility {
        
        const ability = new LAbility();
        ability.setup(abilityId);
        return ability;
    }
}
