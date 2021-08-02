import { assert } from "ts/Common";
import { LFloorId } from "ts/objects/LFloorId";
import { DAction, DActionId } from "./DAction";
import { RE_Data_Actor } from "./DActor";
import { DEffectSet, DEmittorId } from "./DEffect";
import { DEnemy } from "./DEnemy";
import { DEntityProperties, DEntityProperties_Default } from "./DEntityProperties";
import { DHelpers } from "./DHelper";
import { DIdentifiedTiming } from "./DIdentifyer";
import { DItem } from "./DItem";
import { DParameterId } from "./DParameter";
import { DPrefabDataSource, DPrefabId } from "./DPrefab";
import { DStateId } from "./DState";
import { DTroop, DTroopId } from "./DTroop";
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

    /** 祝福・呪い・封印状態になるか。 */
    canModifierState: boolean;

    actor: RE_Data_Actor | undefined;

    itemData: DItem | undefined;

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
    effectSet: DEffectSet;

    constructor(id: DEntityId) {
        this.id = id;
        this.prefabId = 0;
        this.entity = DEntityProperties_Default();
        this.display = { name: "null", stackedName: "null(%1)", iconIndex: 0 };
        this.description = "";
        this.identificationDifficulty = DIdentificationDifficulty.Clear;
        this.identifiedTiming = DIdentifiedTiming.None;
        this.canModifierState = true;
        this.itemData = undefined;
        this.enemy = undefined;
        this.idealParams = [];
        this.reactions = [];
        this.effectSet = new DEffectSet();
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

    public addReaction(actionId: DActionId, effectId: DEmittorId): void {
        if (!this.reactions.find(x => x.actionId == actionId && x.emittingEffect == effectId)) {
            this.reactions.push({ actionId: actionId, emittingEffect: effectId });
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

    public constructor() {
        //this.troopId = 0;
        this.entityId = 0;
        this.stateIds = [];
        this.debugName = "";
        this.stackCount = 1;
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

