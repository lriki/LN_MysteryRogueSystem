import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { LEntity } from "./LEntity";

export enum DescriptionHighlightLevel {
    Identified,         // 識別済み。白テキスト
    Unidentified,       // 未識別。黄テキスト
    UserIdentified,     // ユーザーから名指定済み。緑テキスト
    UnitName,       //
    Number,             // ダメージ値などの数字
}

/**
 * LIdentifyer を通して生成される、Entity の説明情報。
 * 
 * GUI に表示するものはすべてこのオブジェクトを通さなければならない。
 * Entity の名前を直接表示したり、DItem の情報を直接参照することは禁止。
 * 
 * これは未識別アイテムや、アイテムに化けるモンスターを表現するために必要な仕組み。
 */
export class LEntityDescription {
    private _iconIndex: number;
    private _name: string;
    private _highlightLevel: DescriptionHighlightLevel;

    private static _levelColorTable: number[] = [
        0,  // Identified
        14,  // Unidentified
        3,  // UserIdentified
        14,  // UnitName
        23,  // Number
    ];
    
    constructor(iconIndex: number, name: string, level: DescriptionHighlightLevel) {
        this._iconIndex = iconIndex;
        this._name = name;
        this._highlightLevel = level;
    }

    public iconIndex(): number {
        return this._iconIndex;
    }
    
    public name(): string {
        return this._name;
    }

    public displayText(): string {
        return `\\I[${this._iconIndex}]${LEntityDescription.makeDisplayText(this._name, this._highlightLevel)}`;
    }
    
    static getColorNumber(level: DescriptionHighlightLevel): number {
        return this._levelColorTable[level];
    }

    static makeDisplayText(name: string, level: DescriptionHighlightLevel): string {
        return `\\C[${this.getColorNumber(level)}]${name}\\C[0]`;
    }
}

// アイテム種別全体を通した識別済み情報
// NOTE: 名前は一度識別するとすべてに適用されるが、呪いの有無や修正値は使ってみないとわからないので、そちらは Entity が持つ。
interface IdentificationStatus {
    nameIdentified: boolean;    // 名前識別済み
    pseudonym: string;          // ランダム割り当てされた名前
    nickname: string;           // ユーザー指定の仮名
}

/**
 * 
 * インスタンスはグローバルで唯一なものとし、必要なタイミングで初期化して使う。
 */
export class LIdentifyer {

    resolveDescription(entity: LEntity): LEntityDescription {
        const displayName = entity.getDisplayName();
        const itemId = entity.queryProperty(RESystem.properties.itemId) as number;
        if (itemId > 0) {
            const item = REData.itemData(itemId);
            //return new LEntityDescription(item.iconIndex, "白い草", DescriptionHighlightLevel.UserIdentified);
            return new LEntityDescription(displayName.iconIndex, displayName.name, DescriptionHighlightLevel.Identified);
        }
        else {
            //return new LEntityDescription(0, "炎", DescriptionHighlightLevel.Identified);
            //throw new Error("NotImplemented");
            return new LEntityDescription(displayName.iconIndex, displayName.name, DescriptionHighlightLevel.Identified);
        }
    }

    // ユーティリティ
    makeDisplayText(entity: LEntity): string {
        return this.resolveDescription(entity).displayText();
    }
}
