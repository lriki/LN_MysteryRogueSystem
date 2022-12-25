import { assert, tr2 } from "../Common";
import { DEntity, DEntityId } from "./DEntity";
import { DHelpers } from "./DHelper";
import { DStateId } from "./DState";
import { DTroopId } from "./DTroop";
import { DValidationHelper } from "./DValidationHelper";
import { DAnnotationReader, DRmmzUniqueSpawnerAnnotation } from "./importers/DAnnotationReader";
import { MRData } from "./MRData";

// こっちは Entity 単体の生成引数
export class DEntityCreateInfo {
    //public troopId: DTroopId;
    public entityId: DEntityId;
    public stateIds: DStateId[];
    public debugName: string;
    public stackCount: number | undefined;
    public override: boolean;
    public gold: number;

    public constructor() {
        //this.troopId = 0;
        this.entityId = 0;
        this.stateIds = [];
        this.debugName = "";
        this.stackCount = undefined;
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
    

    public withStackCount(value: number): this {
        this.stackCount = value;
        return this;
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
    
    /**
     * 出現率
     * 
     * デフォルトは 100。RMMZ だと 1~9 で指定することが多いが、
     * 原作に従って細かく指定したい場合、もっと少ない出現率を指定したいこともあるためこのようにしている。
     * https://oyasen20.tripod.com/torneco_obtainable.html
     */
    public rate: number;

    public constructor() {
        super();
        this.troopId = 0;
        this.overrideEvent = undefined;
        this.keeper = false;
        this.rate = 100;
        //this.entityId = 0;
        //this.stateIds = [];
    }

    public entityData(): DEntity {
        assert(this.entityId > 0);
        return MRData.entities[this.entityId];
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

    public static makeFromEventData(event: IDataMapEvent, rmmzMapId: number): DEntitySpawner2 | undefined {
        return this.makeFromEventPageData(event, event.pages[0], rmmzMapId);
    }

    public static makeFromEventPageData(event: IDataMapEvent, page: IDataMapEventPage, rmmzMapId: number): DEntitySpawner2 | undefined {
        const entityMetadata = DAnnotationReader.readSpawnerAnnotationFromPage(page);
        if (!entityMetadata) return undefined;
        
        const entity = new DEntitySpawner2();
        entity.troopId = entityMetadata.troopId;
        entity.entityId = MRData.entities.findIndex(x => x.entity.key == entityMetadata.entity);
        entity.stackCount = entityMetadata.stackCount;
        entity.override = entityMetadata.override;
        entity.gold = entityMetadata.gold;
        entity.overrideEvent = entityMetadata.overrideEvent ? event : undefined;
        entity.keeper = entityMetadata.keeper ?? false;
        entity.xName = entityMetadata.entity;
        entity.rate = entityMetadata.rate ?? 100;

        if (entityMetadata.entity != "" && entity.entityId <= 0) {
            throw new Error(tr2("@MR-Spawner で指定された Entity Key '%1' が存在しません。 %2 %3").format(
                entityMetadata.entity,
                DValidationHelper.makeRmmzMapName(rmmzMapId),
                DValidationHelper.makeRmmzEventName(event)));
        }

        for (const stateKey of entityMetadata.states) {
            const index = MRData.states.findIndex(s => s.key == stateKey);
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

export enum DUniqueSpawnerMoveType {
    Default,
    Homecoming, // 帰還。元の位置に戻ろうとする。
}

/**
 * @MR-UniqueSpawner の情報。
 * マップに遷移したときにインスタンスを作成する。
 */
export class DUniqueSpawner {
    public readonly entityId: DEntityId;
    public mx: number;
    public my: number;
    public moveType: DUniqueSpawnerMoveType;
    public overrideRmmzEventMapId: number;  // Override している RMMZ のイベントがあるマップ ID。変なイベントを参照しないよう、ガードをかけるために使う。
    public overrideRmmzEventId: number;     

    public static makeFromAnnotation(data: DRmmzUniqueSpawnerAnnotation): DUniqueSpawner {
        const spawner = new DUniqueSpawner(MRData.getEntity(data.entityKey).id);
        spawner.moveType = DHelpers.stringToEnum(data.moveType, {
            "_": DUniqueSpawnerMoveType.Default,
            "Homecoming": DUniqueSpawnerMoveType.Homecoming,
        });
        return spawner;
    }

    public constructor(entityId: DEntityId) {
        this.entityId = entityId;
        this.mx = 0;
        this.my = 0;
        this.moveType = DUniqueSpawnerMoveType.Default;
        this.overrideRmmzEventMapId = 0;
        this.overrideRmmzEventId = 0;
    }
}
