import { assert } from "ts/re/Common";
import { DActionId } from "./DAction";
import { RE_Data_Actor } from "./DActor";
import { DAnnotationReader } from "./DAnnotationReader";
import { DClassId } from "./DClass";
import { DAttackElementId, DEntityKindId, DRaceId } from "./DCommon";
import { DEmittorId, DEmittor } from "./DEmittor";
import { DEnemy } from "./DEnemy";
import { DEntityProperties, DEntityProperties_Default } from "./DEntityProperties";
import { DHelpers } from "./DHelper";
import { DIdentifiedTiming } from "./DIdentifyer";
import { DEquipment, DItem } from "./DItem";
import { DPrefab, DPrefabId } from "./DPrefab";
import { DStateId } from "./DState";
import { DTroopId } from "./DTroop";
import { REBasics } from "./REBasics";
import { DFactionId, REData } from "./REData";

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

export class DReaction {
/*
    [2021/10/6] Cause と Reaction 見直ししたいメモ
    ----------
    現時点では、
    - 巻物は ReadAction で、Activityと効果発動のキーが紐づいている。
    - 草は Cause.Hit で効果発動のキーとする。Activity とは直接は紐づいていない。
    という統一性の無い状態。

    本質的？には「衝突する」というのは Activity ではない。Projectile が衝突した時に発生する特殊なイベント。
    なので Cause と Activity は別物がよさそうであると考えていた。

    巻物では「効果対象を選択する」という必要性が出てきたため、Activity(Read) とそれにより発動される効果が DB 的に紐づいている必要が出てきた。

    完全に汎用を目指す必要はないかもしれないが、しかし少なくとも現状はかなりコードが複雑になっているので、できれば統一したい。

    
    ### ぜんぶ Activity にしてしまう？

    内部的には問題なさそう。コマンドチェーンの内側からの Activity 発行は、すでに AI がやっている。
    「衝突する」という行動ができるようになる、と考える。


    [2021/11/17] Cause と Reaction 見直ししたいメモ
    ----------
    DReaction は、あるアイテムなどに何ができるのかをカスタマイズするためのもの。武器を食べられるようにするとか。
    単に行動を起こせるかどうかを設定するものとしてみたい。

    EmittorSet は、何らかの原因に対する発動効果をマッピングしたもの。

    ここまで整理したとして…
    罠の発動はどうする？

    まず、[踏む] に対して Emittor を割り当てるのは NG.
    なぜなら、罠を発動する Activity は [踏む] [落ちる] あるいは "罠作動の巻物の効果" など様々あるから。

    以下どちらがいいだろう？
    - Activity として [罠発動] する
    - 現行のまま、TrapBehavior 内で Cause を決める

    "罠作動の巻物の効果" について…
    欲を言うなら、LTrapBehavior は知らなくてもよいようにしたい。
    Activity にしておけば、例えば罠の発動を一律封印するような部屋効果を表現することもできるだろう。

    復活の草について…
    Activity でも Cause でもかまわないが、例えば Activity でやるなら
    - <RE-Action: Dead=Main>
    - Player へ post された DeadActivity で、MainEmittor を発動する。
    - CharmBehavior として、DeadActivity をハンドリングする。
    このハンドリングは CommonBehavior とかに実装したいが、 Charm にすると他の様々な通知も CommonBehavior に流れてしまう。
    でも Charm として Activity をハンドリングする専用の Behavior があってもいいかもしれない。
    






*/

    /**
     * Entity が反応する Action.
     * 例えば "Eat" があれば、その Entity は食べることができる。
     */
    private _actionId: DActionId;


    //emittingEffect: DEmittorId; // 0可。その場合、onActivity への通知だけが行われる。

    /**
     * この Reaction に反応する Emittor。
     * 
     * 複数指定可能。例えば火炎草は、次の2つが登録される。
     * - 使用者に対する FP 回復効果
     * - 目の前の別エンティティに対するダメージ効果
     * 
     * ひとつも登録されていない場合は何も起こらないが、Behavior への通知は行われる。
     * これによって、 Emittor に依らない特殊効果をコードで実装することもできる。
     */
    private _emittorIds: DEmittorId[];

    
    public primariyUse: boolean;

    public constructor(actionId: DActionId) {
        this._actionId = actionId;
        this._emittorIds = [];
        this.primariyUse = false;
    }

    public get actionId(): DActionId {
        return this._actionId;
    }

    public addEmittor(emittor: DEmittor): void {
        this._emittorIds.push(emittor.id);
    }

    public hasEmittor(): boolean {
        return this._emittorIds.length > 0;
    }

    public emittorIds(): readonly DEmittorId[] {
        return this._emittorIds;
    }

    public emittors(): DEmittor[] {
        return this._emittorIds.map(x => REData.getEmittorById(x));
    }
}

export interface DEntityAutoAdditionState {
    stateId: DStateId;
    condition: string;
}

export interface DCounterAction {
    conditionAttackType: DAttackElementId | undefined;
    emitSelf: boolean;
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
    sellingPrice2: number;

    /** 売り値 (買取価格) */
    purchasePrice: number;

    /** 祝福・呪い・封印状態になるか。 */
    canModifierState: boolean;

    actor: RE_Data_Actor | undefined;

    itemData: DItem | undefined;

    equipment: DEquipment | undefined;

    enemy: DEnemy | undefined;

    classId: DClassId;

    raceIds: DRaceId[];

    /** この Entity 自身に対する Trait */
    selfTraits: IDataTrait[];

    /** 装備したときに、装備者に対して適用する Trait */
    equipmentTraits: IDataTrait[];

    /** 持っているだけで affestTraits の効果があるか */
    isTraitCharmItem: boolean;


    /** デフォルトの勢力。 */
    factionId: DFactionId;

    
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
    //emittorSet: DEmittorSet;

    /**
     * RMMZ エディタで指定され Item の効果
     */
    private _mainEmittorId: DEmittorId;

    /**
     * 自動追加ステート。
     * これによって、HPが少なくなったら逃げ出したり、自爆したりといったコントロールを行う。
     */
    autoAdditionStates: DEntityAutoAdditionState[];

    majorActionDeclines: number;

    /** 
     * 強化下限・上限。これらは DParam の情報ではなく Entity データごとに固有のもの。
     * 原作では +値がそのまま攻撃力等に反映されるが、タイトルによっては +値*10 とか、マイナス方向にも有効とかいろいろ考えられる。
     */
    upgradeMin: number = 0;
    upgradeMax: number = 0;

    /** 飛翔体としての移動を終了するとき、地面に落ちずに消滅するか */
    volatilityProjectile: boolean;

    counterActions: DCounterAction[];

    shortcut: boolean = false;

    constructor(id: DEntityId) {
        this.id = id;
        this.prefabId = 0;
        this.entity = DEntityProperties_Default();
        this.display = { name: "null", stackedName: "null(%1)", iconIndex: 0 };
        this.description = "";
        this.identificationDifficulty = DIdentificationDifficulty.Clear;
        this.identifiedTiming = DIdentifiedTiming.None;
        this.sellingPrice2 = 0;
        this.purchasePrice = 0;
        this.canModifierState = true;
        this.itemData = undefined;
        this.enemy = undefined;
        this.classId = 0;
        this.raceIds = [];
        this.selfTraits = [];
        this.equipmentTraits = [];
        this.isTraitCharmItem = false;
        this.factionId = 0;//REData.system.factions.neutral;
        this.idealParams = [];
        this.reactions = [];
        //this.emittorSet = new DEmittorSet();
        this._mainEmittorId = 0;
        this.autoAdditionStates = [];
        this.majorActionDeclines = 0;
        this.volatilityProjectile = false;
        this.counterActions = [];
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

    public equippedTraits(): readonly IDataTrait[] {
        return (!this.isTraitCharmItem) ? this.equipmentTraits : [];
    }

    public charmedTraits(): readonly IDataTrait[] {
        return (this.isTraitCharmItem) ? this.equipmentTraits : [];
    }

    public addReaction(actionId: DActionId, emittor?: DEmittor, primaryUse?: boolean): void {
        let reaction = this.reactions.find(x => x.actionId == actionId);
        if (!reaction) {
            reaction = new DReaction(actionId);
            this.reactions.push(reaction);
        }

        if (emittor) {
            reaction.addEmittor(emittor);
        }
        if (primaryUse) {
            reaction.primariyUse = primaryUse;
        }
    }

    public findReaction(actionId: DActionId): DReaction | undefined {
        const reaction = this.reactions.find(x => x.actionId == actionId);
        return reaction;
    }

    public getReaction(actionId: DActionId): DReaction {
        const reaction = this.reactions.find(x => x.actionId == actionId);
        assert(reaction);
        return reaction;
    }

    public setMainEmittor(emittor: DEmittor): void {
        this._mainEmittorId = emittor.id;
    }

    public mainEmittor(): DEmittor {
        assert(this._mainEmittorId > 0);
        return REData.emittors[this._mainEmittorId];
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
    public gold: number;

    public constructor() {
        //this.troopId = 0;
        this.entityId = 0;
        this.stateIds = [];
        this.debugName = "";
        this.stackCount = 1;
        this.override = false;
        this.gold = 0;
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
    public overrideEvent: IDataMapEvent | undefined;
    public keeper: boolean;
    //public entityId: DEntityId;
    //public stateIds: DStateId[];
    public xName: string | undefined;//

    public constructor() {
        super();
        this.troopId = 0;
        this.overrideEvent = undefined;
        this.keeper = false;
        //this.entityId = 0;
        //this.stateIds = [];
    }

    public entityData(): DEntity {
        assert(this.entityId > 0);
        return REData.entities[this.entityId];
    }
    
    // public isEnemyKind(): boolean {
    //     if (this.entityId <= 0) return false;
    //     return REData.entities[this.entityId].entity.kindId == REBasics.entityKinds.MonsterKindId;
    // }

    // public isItemKind(): boolean {
    //     if (this.entityId <= 0) return false;
    //     return REData.prefabs[REData.entities[this.entityId].prefabId].isItemKind();
    // }

    // public isTrapKind(): boolean {
    //     if (this.entityId <= 0) return false;
    //     return REData.entities[this.entityId].entity.kindId == REBasics.entityKinds.TrapKindId;
    // }

    // public isEntryPoint(): boolean {
    //     if (this.entityId <= 0) return false;
    //     return REData.prefabs[REData.entities[this.entityId].prefabId].isEntryPoint();
    // }

    // public isExitPoint(): boolean {
    //     if (this.entityId <= 0) return false;
    //     return REData.prefabs[REData.entities[this.entityId].prefabId].isExitPoint();
    // }

    public static makeFromEventData(event: IDataMapEvent): DEntitySpawner2 | undefined {
        return this.makeFromEventPageData(event, event.pages[0]);
    }

    public static makeFromEventPageData(event: IDataMapEvent, page: IDataMapEventPage): DEntitySpawner2 | undefined {
        const entityMetadata = DAnnotationReader.readEntityMetadataFromPage(page);
        if (!entityMetadata) return undefined;
        
        const entity = new DEntitySpawner2();
        entity.troopId = entityMetadata.troopId;
        entity.entityId = REData.entities.findIndex(x => x.entity.key == entityMetadata.data);
        entity.stackCount = entityMetadata.stackCount;
        entity.override = entityMetadata.override;
        entity.gold = entityMetadata.gold;
        entity.overrideEvent = entityMetadata.overrideEvent ? event : undefined;
        entity.keeper = entityMetadata.keeper ?? false;
        entity.xName = entityMetadata.data;

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

