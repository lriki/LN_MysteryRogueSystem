import { tr2 } from "ts/Common";
import { REData } from "ts/data/REData";
import { RESystem } from "ts/system/RESystem";
import { LEntity } from "./LEntity";
import { REGame } from "./REGame";

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
interface IdentificationState {
    nameIdentified: boolean;    // 名前識別済み
    pseudonym: string;          // ランダム割り当てされた名前
    nickname: string | undefined;           // ユーザー指定の仮名
}

/**
 * 
 * インスタンスはグローバルで唯一なものとし、必要なタイミングで初期化して使う。
 * 
 * 
 * 仕様メモ
 * ----------
 * 
 * - 新種道具は常に識別済み。
 * 
 * - ダンジョン突入時、持っているアイテムは識別済み。
 * 
 * - 識別済みは次の２つで現される。
 *      - グローバルな識別済みフラグ: 種類の識別。名前がわかる。
 *      - ローカルな識別済みフラグ: Entity 単位の識別。杖の使用回数がわかる。
 * 
 */
export class LIdentifyer {
    /** 種別としての識別済みフラグ. Index: DEntityId */
    private _identificationStates: (IdentificationState | undefined)[] = [];

    public reset(): void {
        this._identificationStates = [];

        for (const kind of REData.pseudonymous.kinds()) {
            const names = REData.pseudonymous.getNameList(kind);
            const entities = REData.entities.filter(x => x.entity.kind == kind);
            if (names.length < entities.length) {
                throw new Error(tr2(`Kind:${kind} の pseudonym が不足しています。(c: ${names.length})`));
            }

            names.mutableShuffle();

            for (let i = 0; i < entities.length; i++) {
                const entity = entities[i];
                this._identificationStates[entity.id] = {
                    nameIdentified: false,
                    pseudonym: names[i],
                    nickname: undefined,
                };
            }
        }
    }

    public resolveDescription(entity: LEntity): LEntityDescription {
        const dataId = entity.dataId();

        const state = this._identificationStates[dataId];
        let globalIdentified = true;
        let pseudonym = "";
        let level = DescriptionHighlightLevel.Identified;
        if (state) {
            globalIdentified = state.nameIdentified;
            pseudonym = state.pseudonym;
            level = DescriptionHighlightLevel.Unidentified;
        }

        const display = entity.getDisplayName();
        let displayName = pseudonym;
        if (globalIdentified) {
            displayName = display.name;
        }

        return new LEntityDescription(display.iconIndex, displayName, level);
    }

    // ユーティリティ
    makeDisplayText(entity: LEntity): string {
        return this.resolveDescription(entity).displayText();
    }
}
