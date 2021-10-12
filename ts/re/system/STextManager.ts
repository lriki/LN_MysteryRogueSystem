import { tr2 } from "../Common";
import { REData } from "../data/REData";


export class STextManager {

    public static basic(basicId: number): string {
        return $dataSystem.terms.basic[basicId] || "";
    }
    
    public static param(paramId: number): string {
        if ($dataSystem.terms.params[paramId]) {
            return $dataSystem.terms.params[paramId];
        }
        else {
            const param = REData.parameters[paramId];
            return param ? param.displayName : "";
        }
    }
    
    public static command(commandId: number): string {
        return $dataSystem.terms.commands[commandId] || "";
    }
    
    public static message(messageId: string): string {
        return ($dataSystem.terms.messages as any)[messageId] || "";
    }

    public static get exp(): string { return this.basic(8); }
    public static get save(): string { return this.command(9); }
    public static get obtainExp(): string { return this.message("obtainExp"); }
    public static get actorDamage(): string { return this.message("actorDamage"); }
    public static get actorRecovery(): string { return this.message("actorRecovery"); }
    public static get actorDrain(): string { return this.message("actorDrain"); }
    public static get actorNoDamage(): string { return this.message("actorNoDamage"); }
    public static get enemyDamage(): string { return this.message("enemyDamage"); }
    public static get enemyRecovery(): string { return this.message("enemyRecovery"); }
    public static get enemyDrain(): string { return this.message("enemyDrain"); }
    public static get enemyNoDamage(): string { return this.message("enemyNoDamage"); }
    public static get buffAdd(): string { return this.message("buffAdd"); }
    public static get debuffAdd(): string { return this.message("debuffAdd"); }
    public static get buffRemove(): string { return this.message("buffRemove"); }
    public static get currencyUnit(): string { return $dataSystem.currencyUnit; }

    //----------

    
    public static weaponStrength(): string { return tr2("武器の強さ"); }
    public static shieldStrength(): string { return tr2("盾の強さ"); }
}
