import { assert } from "ts/re/Common";
import { DActionId } from "./DAction";
import { RE_Data_Actor } from "./DActor";
import { DEmittorSet, DEmittorId } from "./DEmittor";
import { DEnemy } from "./DEnemy";
import { DEntityProperties, DEntityProperties_Default } from "./DEntityProperties";
import { DHelpers } from "./DHelper";
import { DIdentifiedTiming } from "./DIdentifyer";
import { DEquipment, DItem } from "./DItem";
import { DPrefab, DPrefabId } from "./DPrefab";
import { DStateId } from "./DState";
import { DTroopId } from "./DTroop";
import { REData } from "./REData";

export type DEntityId = number;

export enum DIdentificationDifficulty {
    Clear = 0,          // 呪いなども含めて常に識別済み。お金など。
    NameGuessed = 1,    // 名前は常にわかる。装備品など。修正値や呪いはわからない。
    Obscure = 2,        // 名前もわからない。
    //Individual,
}

export interface DEntityNamePlate {
    name: string;
    stackedName: string;
    iconIndex: number;
}

export interface DReaction {
    actionId: DActionId;
    emittingEffect: DEmittorId; // 0可。その場合、onActivity への通知だけが行われる。
}

export interface DEntityAutoAdditionState {
    stateId: DStateId;
    condition: string;
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

    description: string;

    identificationDifficulty: DIdentificationDifficulty;
    identifiedTiming: DIdentifiedTiming;


    /** 買い値（販売価格） */
    buyingPrice: number;

    /** 売り値 */
    sellingPrice: number;

    /** 祝福・呪い・封印状態になるか。 */
    canModifierState: boolean;

    actor: RE_Data_Actor | undefined;

    itemData: DItem | undefined;

    equipment: DEquipment | undefined;

    enemy: DEnemy | undefined;

    
    /** 
     * 各基本パラメータ。Enemy のパラメータや、Item の使用回数など。
     * Index は rmmz の params とは異なるので注意。
     */
    idealParams: (number | undefined)[];

    /** この Entity が受け付ける Action のリスト */
    reactions: DReaction[];
    
    
    /**
     * 元々 DItem が持っていたが、例えば Entity が何かと衝突したときに発動する効果を定義する、というのは、モンスターの特殊能力でも使いたい。
     * 例えば衝突したら相手にノックバック効果を与えるモンスターもある。
     * 
     * TODO: reactions とまとめられないか考えたいところ。
     */
    emittorSet: DEmittorSet;

    /**
     * 自動追加ステート。
     * これによって、HPが少なくなったら逃げ出したり、自爆したりといったコントロールを行う。
     */
    autoAdditionStates: DEntityAutoAdditionState[];

    constructor(id: DEntityId) {
        this.id = id;
        this.prefabId = 0;
        this.entity = DEntityProperties_Default();
        this.display = { name: "null", stackedName: "null(%1)", iconIndex: 0 };
        this.description = "";
        this.identificationDifficulty = DIdentificationDifficulty.Clear;
        this.identifiedTiming = DIdentifiedTiming.None;
        this.buyingPrice = 0;
        this.sellingPrice = 0;
        this.canModifierState = true;
        this.itemData = undefined;
        this.enemy = undefined;
        this.idealParams = [];
        this.reactions = [];
        this.emittorSet = new DEmittorSet();
        this.autoAdditionStates = [];
    }

    public prefab(): DPrefab {
        return REData.prefabs[this.prefabId];
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

    public addReaction(actionId: DActionId, emittorId: DEmittorId): void {
        if (!this.reactions.find(x => x.actionId == actionId && x.emittingEffect == emittorId)) {
            this.reactions.push({ actionId: actionId, emittingEffect: emittorId });
        }
    }

    public makeDisplayName(stackCont: number): string {
        if (stackCont >= 2)
            return this.display.stackedName.format(stackCont);
        else
            return this.display.name;
    }

    public verify(): void {
        
    }
}




// こっちは Entity 単体の生成引数
export class DEntityCreateInfo {
    //public troopId: DTroopId;
    public entityId: DEntityId;
    public stateIds: DStateId[];
    public debugName: string;
    public stackCount: number;
    public override: boolean;

    public constructor() {
        //this.troopId = 0;
        this.entityId = 0;
        this.stateIds = [];
        this.debugName = "";
        this.stackCount = 1;
        this.override = false;
    }

    public static makeSingle(entityId: DEntityId, stateIds?: DStateId[], debugName?: string): DEntityCreateInfo {
        const data = new DEntityCreateInfo();
        data.entityId = entityId;
        if (stateIds) data.stateIds = stateIds;
        if (debugName) data.debugName = debugName;
        return data;
    }
}

// こっちは Event の metadata としての情報
export class DEntitySpawner2 extends DEntityCreateInfo {
    public troopId: DTroopId;
    //public entityId: DEntityId;
    //public stateIds: DStateId[];

    public constructor() {
        super();
        this.troopId = 0;
        //this.entityId = 0;
        //this.stateIds = [];
    }
    
    public isEnemyKind(): boolean {
        if (this.entityId <= 0) return false;
        return REData.prefabs[REData.entities[this.entityId].prefabId].isEnemyKind();
    }

    public isItemKind(): boolean {
        if (this.entityId <= 0) return false;
        return REData.prefabs[REData.entities[this.entityId].prefabId].isItemKind();
    }

    public isTrapKind(): boolean {
        if (this.entityId <= 0) return false;
        return REData.prefabs[REData.entities[this.entityId].prefabId].isTrapKind();
    }

    public isEntryPoint(): boolean {
        if (this.entityId <= 0) return false;
        return REData.prefabs[REData.entities[this.entityId].prefabId].isEntryPoint();
    }

    public isExitPoint(): boolean {
        if (this.entityId <= 0) return false;
        return REData.prefabs[REData.entities[this.entityId].prefabId].isExitPoint();
    }

    public static makeFromEventData(event: IDataMapEvent): DEntitySpawner2 | undefined {
        return this.makeFromEventPageData(event.id, event.pages[0]);
    }

    public static makeFromEventPageData(eventId: number, page: IDataMapEventPage): DEntitySpawner2 | undefined {
        const entityMetadata = DHelpers.readEntityMetadataFromPage(page, eventId);
        if (!entityMetadata) return undefined;
        
        const entity = new DEntitySpawner2();
        entity.troopId = entityMetadata.troopId;
        entity.entityId = REData.entities.findIndex(x => x.entity.key == entityMetadata.data);
        entity.stackCount = entityMetadata.stackCount;
        entity.override = entityMetadata.override;

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
}

