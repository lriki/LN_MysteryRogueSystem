import { assert } from "ts/Common";
import { RE_Data_Actor } from "./DActor";
import { DEnemy } from "./DEnemy";
import { DEntityProperties, DEntityProperties_Default } from "./DEntityProperties";
import { DHelpers } from "./DHelper";
import { DItem } from "./DItem";
import { DPrefabId } from "./DPrefab";
import { DStateId } from "./DState";
import { REData } from "./REData";

export type DEntityId = number;

export interface DEntityNamePlate {
    name: string;
    iconIndex: number;
}



/**
 * [2021/6/22] Database 修正について
 * ----------
 * これまでは Prefab の方が偉かった (インスタンス化するときは PrefabID を使った) が、EntityData の方を偉くしてみる。
 * 
 * - 固定のお店を作るときはツクールの [お店の処理] を使いたいが、ここで指定するのは ItemData(EntityData) である。Prefab との関連付けが少し手間。
 *   - お店に限らず、イベントからアイテムIDとして情報をもらうときに、REシステムのほとんどの個所で Prefab を要求していることがツクールとマッチしていない。
 * - 変化の壺や合成の壺などは ItemData として生成物のリストをユーザーが作れるようにしたい。
 *   でもそうすると、処理の中で何らかの新しい Entity をインスタンス化する必要があるときに、Prefab を探しに行くのが手間。
 * - アイテム擬態ステートを作るときに CharacterImage を得るときも、結局 EntityData(Item) から Prefab まで辿る必要があり、ItemData -> Prefab の参照が必要になった。
 * 
 * 基本的に、EntityData と Prefab は 1:1 である。この2つが双方向の参照を持たざるを得なくなったことで、
 * インスタンス化時にはどちらを指定しても問題はなくなった。
 * どちらでもよいなら、エディタから指定しやすい方を使うのがよいだろう。
 * 
 * NOTE: このような仕組みにすると、EntityData と Prefab は 1:n でも良くなる。
 * Prefab は見た目をコントロールするものとみなせるので、例えば同種のアイテムなどは共通の Prefab を使っても構わない。
 * 当初は Prefab の方が偉かったが、Prefab は View の機能なので、Data に対して View が優先されるのはやっぱりちょっと不自然だろう。
 */

export class DEntity {
    id: DEntityId;
    prefabId: DPrefabId;
    
    entity: DEntityProperties;
    
    display: DEntityNamePlate;


    actor: RE_Data_Actor | undefined;

    itemData: DItem | undefined;

    enemy: DEnemy | undefined;

    constructor(id: DEntityId) {
        this.id = id;
        this.prefabId = 0;
        this.entity = DEntityProperties_Default();
        this.display = { name: "null", iconIndex: 0 };
        this.itemData = undefined;
        this.enemy = undefined;
    }
    
    public actorData(): RE_Data_Actor {
        assert(this.actor);
        return this.actor;
    }

    public item(): DItem {
        assert(this.itemData);
        return this.itemData;
    }

    public enemyData(): DEnemy {
        assert(this.enemy);
        return this.enemy;
    }
}





export interface DEntityInstance {
    entityId: DEntityId;
    stateIds: DStateId[];
}

export function DEntityInstance_Default(): DEntityInstance {
    return {
        entityId: 0,
        stateIds: [],
    };
}

export function DEntity_makeFromEventData(event: IDataMapEvent): DEntityInstance | undefined {
    return DEntity_makeFromEventPageData(event.id, event.pages[0]);
}

export function DEntity_makeFromEventPageData(eventId: number, page: IDataMapEventPage): DEntityInstance | undefined {
    const entityMetadata = DHelpers.readEntityMetadataFromPage(page, eventId);
    if (!entityMetadata) return undefined;
    
    const entity: DEntityInstance = {
        entityId: REData.entities.findIndex(x => x.entity.key == entityMetadata.data),
        stateIds: [],
    };

    for (const stateKey of entityMetadata.states) {
        const index = REData.states.findIndex(s => s.key == stateKey);
        if (index > 0) {
            entity.stateIds.push(index);
        }
        else {
            throw new Error(`State "${stateKey}" not found.`);
        }
    }

    return entity;
}

