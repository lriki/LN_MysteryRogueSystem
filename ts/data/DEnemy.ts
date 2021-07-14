import { DEntity, DEntityId } from "./DEntity";
import { REData } from "./REData";

export type DEnemyId = number;


/**
 * モンスターデータ。
 * 
 * RMMZ の Enemy と同じ意味のデータだが、味方勢力に属することもあるので "Enemy" という言葉の意味とちょっと違くなる。
 * ひとまず "Monster" という言葉を採用。
 * ↑
 * やっぱりナシ。
 * ツクールと連携するので、Enemy という名前の方がデータの対応がわかりやすい。
 */
export class DEnemy {
    /** ID (0 is Invalid). */
    id: DEnemyId;

    entityId: DEntityId;

    /** 取得経験値 */
    exp: number;


    traits: IDataTrait[];

    actions: IDataAction[];

    constructor(id: DEnemyId, entityId: DEntityId) {
        this.id = id;
        this.entityId = entityId;
        this.exp = 0;
        this.traits = [];
        this.actions = [];
    }

    public entity(): DEntity {
        return REData.entities[this.entityId];
    }
}

