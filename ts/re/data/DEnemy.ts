
import { DEntity, DEntityId } from "./DEntity";
import { REData } from "./REData";

export type DEnemyId = number;

export class DDropItem {
    entityId: DEntityId;
    denominator: number;
    gold: number;

    public constructor() {
        this.entityId = 0;
        this.denominator = 0;
        this.gold = 0;
    }

    public static makeFromRmmzDropItemList(data: IDataDropItem[], gold: number): DDropItem[] {
        const items = data.filter(x => x.kind > 0).map(x => this.makeFromRmmzDropItem(x));
        if (gold > 0) {
            items.push(this.makeFromRmmzDropGold(gold));
        }
        return items;
    }

    public static makeFromRmmzDropItem(data: IDataDropItem): DDropItem {
        const d = new DDropItem();
        if (data.kind === 1) {
            d.entityId = REData.items[REData.itemDataIdOffset + data.dataId];
        } else if (data.kind === 2) {
            d.entityId = REData.items[REData.weaponDataIdOffset + data.dataId];
        } else if (data.kind === 3) {
            d.entityId = REData.items[REData.armorDataIdOffset + data.dataId];
        } else {
            throw new Error("Unreachable.");
        }
        d.denominator = data.dataId;
        return d;
    }

    public static makeFromRmmzDropGold(gold: number): DDropItem {
        const d = new DDropItem();
        d.entityId = 0;//REData.system.fallbackGoldEntityId;
        d.gold = gold;
        return d;
    }
}


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

    /** @deprecated Dentity.selfTraits に統合していいかも？ */
    traits: IDataTrait[];

    actions: IDataAction[];

    
    dropItems: DDropItem[];

    constructor(id: DEnemyId, entityId: DEntityId) {
        this.id = id;
        this.entityId = entityId;
        this.exp = 0;
        this.traits = [];
        this.actions = [];
        this.dropItems = [];
    }

    public entity(): DEntity {
        return REData.entities[this.entityId];
    }
}

