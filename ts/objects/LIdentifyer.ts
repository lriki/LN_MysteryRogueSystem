import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { REGame_Entity } from "./REGame_Entity";

enum DescriptionHighlightLevel {
    Identified = 0,         // 識別済み。白テキスト
    Unidentified = 5,       // 未識別。黄テキスト
    UserIdentified = 14,     // ユーザーから名指定済み。緑テキスト
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
        return `\\I[${this._iconIndex}]\\C[${this._highlightLevel}]${this._name}\\C[0]`;
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

    resolveDescription(entity: REGame_Entity): LEntityDescription {
        const itemId = entity.queryProperty(RESystem.properties.itemId) as number;
        if (itemId > 0) {
            const item = REData.items[itemId];
            return new LEntityDescription(item.iconIndex, "白い草", DescriptionHighlightLevel.UserIdentified);
            //return new LEntityDescription(item.iconIndex, item.name, DescriptionHighlightLevel.Identified);
        }
        else {
            throw new Error("NotImplemented");
        }
    }

    // ユーティリティ
    makeDisplayText(entity: REGame_Entity): string {
        return this.resolveDescription(entity).displayText();
    }
}
