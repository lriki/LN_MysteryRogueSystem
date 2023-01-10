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
export class DEntitySpawner extends DEntityCreateInfo {
    // entityId と troopId は共存しないが、どちらかは必須。
    public readonly entityId: DEntityId;
    public readonly troopId: DTroopId;

    public overrideEvent: IDataMapEvent | undefined;
    public keeper: boolean;
    public xName: string | undefined;//
    
    /**
     * 出現率
     * 
     * デフォルトは 100。RMMZ だと 1~9 で指定することが多いが、
     * 原作に従って細かく指定したい場合、もっと少ない出現率を指定したいこともあるためこのようにしている。
     * https://oyasen20.tripod.com/torneco_obtainable.html
     */
    public rate: number;
    
    public mx: number;
    public my: number;
    public moveType: DUniqueSpawnerMoveType;
    public overrideRmmzEventMapId: number;  // Override している RMMZ のイベントがあるマップ ID。変なイベントを参照しないよう、ガードをかけるために使う。
    public overrideRmmzEventId: number;
    public displayName: string | undefined;
    public reactions: ({ key: string, name: string }[]) | undefined;

    public static makeFromAnnotation(data: DRmmzUniqueSpawnerAnnotation): DEntitySpawner {
        const spawner = new DEntitySpawner(MRData.getEntity(data.entityKey).id, 0);
        spawner.moveType = DHelpers.stringToEnum(data.moveType, {
            "_": DUniqueSpawnerMoveType.Default,
            "Homecoming": DUniqueSpawnerMoveType.Homecoming,
        });
        return spawner;
    }


    public static makeFromEventData(event: IDataMapEvent, rmmzMapId: number): DEntitySpawner | undefined {
        return this.makeFromEventPageData(event, event.pages[0], rmmzMapId);
    }

    public static makeFromEventPageData(event: IDataMapEvent, page: IDataMapEventPage, rmmzMapId: number): DEntitySpawner | undefined {
        const entityMetadata = DAnnotationReader.readSpawnerAnnotationFromPage(page);
        if (!entityMetadata) return undefined;

        const entityId = MRData.entities.findIndex(x => x.entity.key == entityMetadata.entity);
        const troopId = entityMetadata.troopId;
        
        const spawner = new DEntitySpawner(entityId, troopId);
        spawner.stackCount = entityMetadata.stackCount;
        spawner.override = entityMetadata.override;
        spawner.gold = entityMetadata.gold;
        spawner.overrideEvent = entityMetadata.overrideEvent ? event : undefined;
        spawner.keeper = entityMetadata.keeper ?? false;
        spawner.xName = entityMetadata.entity;
        spawner.rate = entityMetadata.rate ?? 100;
        spawner.displayName = entityMetadata.name;
        spawner.reactions = entityMetadata.reactions;

        if (entityMetadata.entity != "" && spawner.entityId <= 0) {
            throw new Error(tr2("@MR-Spawner で指定された Entity Key '%1' が存在しません。 %2 %3").format(
                entityMetadata.entity,
                DValidationHelper.makeRmmzMapName(rmmzMapId),
                DValidationHelper.makeRmmzEventName(event)));
        }

        for (const stateKey of entityMetadata.states) {
            const index = MRData.states.findIndex(s => s.key == stateKey);
            if (index > 0) {
                spawner.stateIds.push(index);
            }
            else {
                throw new Error(`State "${stateKey}" not found.`);
            }
        }

        return spawner;
    }

    public constructor(entityId: DEntityId, troopId: DTroopId) {
        super();
        this.entityId = entityId;
        this.troopId = troopId;
        this.overrideEvent = undefined;
        this.keeper = false;
        this.rate = 100;
        //this.entityId = 0;
        //this.stateIds = [];
        this.mx = 0;
        this.my = 0;
        this.moveType = DUniqueSpawnerMoveType.Default;
        this.overrideRmmzEventMapId = 0;
        this.overrideRmmzEventId = 0;
    }

    public entityData(): DEntity {
        assert(this.entityId > 0);
        return MRData.entities[this.entityId];
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
// export class DUniqueSpawner {
//     public readonly entityId: DEntityId;
//     public mx: number;
//     public my: number;
//     public moveType: DUniqueSpawnerMoveType;
//     public overrideRmmzEventMapId: number;  // Override している RMMZ のイベントがあるマップ ID。変なイベントを参照しないよう、ガードをかけるために使う。
//     public overrideRmmzEventId: number;     

//     public static makeFromAnnotation(data: DRmmzUniqueSpawnerAnnotation): DUniqueSpawner {
//         const spawner = new DUniqueSpawner(MRData.getEntity(data.entityKey).id);
//         spawner.moveType = DHelpers.stringToEnum(data.moveType, {
//             "_": DUniqueSpawnerMoveType.Default,
//             "Homecoming": DUniqueSpawnerMoveType.Homecoming,
//         });
//         return spawner;
//     }

//     public constructor(entityId: DEntityId) {
//         this.entityId = entityId;
//         this.mx = 0;
//         this.my = 0;
//         this.moveType = DUniqueSpawnerMoveType.Default;
//         this.overrideRmmzEventMapId = 0;
//         this.overrideRmmzEventId = 0;
//     }
// }
