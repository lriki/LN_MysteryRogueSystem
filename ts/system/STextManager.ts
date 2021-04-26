

export class STextManager {

    public static basic(basicId: number): string {
        return $dataSystem.terms.basic[basicId] || "";
    }
    
    public static param(paramId: number): string {
        return $dataSystem.terms.params[paramId] || "";
    }
    
    public static command(commandId: number): string {
        return $dataSystem.terms.commands[commandId] || "";
    }
    
    public static message(messageId: string): string {
        return ($dataSystem.terms.messages as any)[messageId] || "";
    }

    public static get actorDamage(): string { return this.message("actorDamage"); }
    public static get actorRecovery(): string { return this.message("actorRecovery"); }
    public static get actorDrain(): string { return this.message("actorDrain"); }
    public static get actorNoDamage(): string { return this.message("actorNoDamage"); }
    public static get enemyDamage(): string { return this.message("enemyDamage"); }
    public static get enemyRecovery(): string { return this.message("enemyRecovery"); }
    public static get enemyDrain(): string { return this.message("enemyDrain"); }
    public static get enemyNoDamage(): string { return this.message("enemyNoDamage"); }
}

