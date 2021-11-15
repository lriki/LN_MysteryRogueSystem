import { DAbilityId } from "ts/re/data/DAbility";
import { LAbility } from "ts/re/objects/abilities/LAbility";

export class SAbilityFactory {
    public static newAbility(abilityId: DAbilityId): LAbility {
        
        const ability = new LAbility();
        ability.setup(abilityId);
        return ability;
    }
}
