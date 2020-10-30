import { REData } from "ts/data/REData";
import { BlockLayerKind } from "ts/RE/REGame_Block";

export interface EntityProperty {
    id: number;
    defaultValue: any;
}

// Entity の基本プロパティのうち、Behavior によってオーバーライドされることがあるもの
export interface EntityProperties {
    // Entity が Map に配置されるとき、どのレイヤーを基本とするか。
    // Ground, Unit, System のいずれか。
    // NOTE: Entity の種別等で決定できないので、フィールドで持たせている。
    //       代表的なのはアイテム擬態モンスター。自分の状態によってレイヤーが変わる。
    homeLayer: number;
}

export interface BasicParameters {
    hp: number;         // HP
    atk: number;        // ちから, 武器攻撃力
    def: number;        // 防具防御力
    satiety: number;    // 満腹度
}

export interface BasicAttributes {
    tile: number;
    unit: number;
}

export interface BasicBehaviors {
    decision: number;
    unit: number;
}

export class RESystem {
    static propertyData:EntityProperty[] = [
        { id: 0, defaultValue: undefined },
        { id: 1, defaultValue: BlockLayerKind.Unit }
    ];

    static properties: EntityProperties = {
        homeLayer: 1,
    }

    static parameters: BasicParameters;
    static attributes: BasicAttributes;
    static behaviors: BasicBehaviors;

    static createAttribute(dataId: number) {
        const i = REData._attributeFactories[dataId]();
        i.dataId = dataId;
        return i;
    }

    static createBehavior(dataId: number) {
        const i = REData._behaviorFactories[dataId]();
        i.dataId = dataId;
        return i;
    }
}

