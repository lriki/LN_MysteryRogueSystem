import { DBehaviorId, DParameterId } from "./DCommon";
import { DFactionId, MRData } from "./MRData";

/**
 * Behavior のデータクラス。DTrait と同じようなもの。
 * 
 * @note
 * ずっと不要かと考えていたが、
 * - エディタなどから追加の Behavior を指定するときに FrientlyName を使いたい
 * - コード内で識別するときは FullName の方が安定しやすい
 * ということで両方をサポートしていたが、検索や名前の分解などのためにコードが複雑になってきた。
 * 
 */
export class DBehavior {
    /** ID (0 is Invalid). */
    public readonly id: DBehaviorId;

    /** Key */
    public readonly key: string;
    
    /** Key */
    public readonly fullName: string;
    
    /** Key */
    public readonly friendlyName: string;

    //public readonly descriptions: string[];

    public constructor(id: DBehaviorId, key: string, fullName: string, friendlyName: string) {
        this.id = id;
        this.key = key;
        this.fullName = fullName;
        this.friendlyName = friendlyName;
        //this.descriptions = [];
    }

    // public withDescription(value: string): this {
    //     this.descriptions.push(value);
    //     return this;
    // }
}

// IDataTrait や IDataEffect のようなもの。Data に対する Instance 引数。
export class DBehaviorInstantiation {
    /** Behavior の名前。 FullName(LInventoryBehavior) または FriendlyName(Inventory) */
    behaviorId: DBehaviorId;
    props?: DBehaviorProps | undefined;

    public constructor(behaviorId: DBehaviorId, props: DBehaviorProps | undefined) {
        this.behaviorId = behaviorId;
        this.props = props;
    }

    public get data(): DBehavior {
        return MRData.behavior[this.behaviorId];
    }
}

//------------------------------------------------------------------------------
// Props

export type DBehaviorProps =
    DBehaviorProps_Unknown |
    DBehaviorProps_Unit |
    DBehaviorProps_Param |
    DBehaviorProps_Inventory;

export interface DBehaviorProps_Unknown {
    code: "Unknown";
}

export interface DBehaviorProps_Unit {
    code: "Unit";
    factionId: DFactionId;
}

// TODO: 複数パラメータに対する影響を定義できるようにする
export interface DBehaviorProps_Param {
    code: "Param";
    paramId: DParameterId;
    value: number;
}

export interface DBehaviorProps_Inventory {
    code: "Inventory";
    minCapacity: number;
    maxCapacity: number;
    storage: boolean;
}
