import { tr2 } from "../Common";

export class DValidationHelper {

    public static makeDataName(typeName: string, id: number, dataName: string): string {
        return `<${typeName} ${id}:${dataName}>: `;
    }
    
    public static makeRmmzTroopName(rmmzTrppoId: number): string {
        const data = $dataTroops[rmmzTrppoId];
        return tr2("敵グループ(%1:%2)").format(data.id, data.name);
    }

    public static makeRmmzEnemyName(rmmzEnemyId: number): string {
        const data = $dataEnemies[rmmzEnemyId];
        return tr2("敵キャラ(%1:%2)").format(data.id, data.name);
    }
}

