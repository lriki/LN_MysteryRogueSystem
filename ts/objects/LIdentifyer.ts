import { tr2 } from "ts/Common";
import { DEntity, DEntityId, DIdentificationDifficulty } from "ts/data/DEntity";
import { DLand, DLandId } from "ts/data/DLand";
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
    private _upgrades: number;
    private _capacity: number | undefined;

    private static _levelColorTable: number[] = [
        0,  // Identified
        14,  // Unidentified
        3,  // UserIdentified
        14,  // UnitName
        23,  // Number
    ];
    
    constructor(iconIndex: number, name: string, level: DescriptionHighlightLevel, upgrades: number, capacity: number | undefined) {
        this._iconIndex = iconIndex;
        this._name = name;
        this._highlightLevel = level;
        this._upgrades = upgrades;
        this._capacity = capacity;
    }

    public iconIndex(): number {
        return this._iconIndex;
    }
    
    public name(): string {
        return this._name;
    }

    public displayText(): string {
        const color = LEntityDescription.getColorNumber(this._highlightLevel);
        let text = `\\I[${this._iconIndex}]\\C[${color}]${this._name}`;
        if (this._upgrades != 0) {
            text += (this._upgrades > 0) ? `+${this._upgrades}` : this._upgrades.toString();
        }
        if (this._capacity) {
            text += `[${this._capacity}]`;
        }
        text += `\\C[0]`;
        return text;
    }

    /*
    public displayTextWithoutIcon(): string {
        let text = `${LEntityDescription.makeDisplayText(this._name, this._highlightLevel)}`;
        if (this._capacity) {
            text += `[${this._capacity}]`;
        }
        return text;
    }
    */
    
    private static getColorNumber(level: DescriptionHighlightLevel): number {
        return this._levelColorTable[level];
    }

    public static makeDisplayText(name: string, level: DescriptionHighlightLevel): string {
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
 * - いかすしの巻物は、未識別だと [食べる] コマンドが表示されない。
 * 
 * [食べる] [読む] などはいつどうやって識別する？
 * ----------
 * 
 * コマンド(Activity)の機能として識別するべき？
 * それともアイテム側の機能として「食べられたとき」に識別するべき？
 * 
 * 
 * 
 */
export class LIdentifyer {
    /** 種別としての識別済みフラグ。undefined の場合、その Entity は常に少なくとも名前は識別済み。 Index: DEntityId */
    private _identificationStates: (IdentificationState | undefined)[] = [];

    public reset(land: DLand): void {
        this._identificationStates = [];

        for (const kind of REData.pseudonymous.kinds()) {
            if (this.checkIdentifiedKind(land, kind)) {
                // land 内では、この kind は常に識別状態
            }
            else {
                const names = REData.pseudonymous.getNameList(kind);
                const entities = REData.entities.filter(x => x.entity.kind == kind && x.identificationDifficulty == DIdentificationDifficulty.Obscure);
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
    }

    public checkIdentifiedKind(land: DLand, kind: string): boolean {
        if (land.identifiedKinds.includes("all")) return true;
        return land.identifiedKinds.includes(kind);
    }

    public identifyGlobal(entityDataId: DEntityId): void {
        const state = this._identificationStates[entityDataId];
        if (state) {
            state.nameIdentified = true;
        }
    }

    public resolveDescription(entity: LEntity): LEntityDescription {
        const dataId = entity.dataId();

        const state = this._identificationStates[dataId];
        let individualIdentified = true;
        let globalIdentified = true;
        let pseudonym = "";
        let level = DescriptionHighlightLevel.Identified;

        // 個体識別済み？
        if (!entity.individualIdentified()) {
            individualIdentified = false;
            level = DescriptionHighlightLevel.Unidentified;
        }

        // 種別(名前)識別済みの有無は個体識別済みよりも強い。
        // 仮に個体識別済みでも、種別未識別であれば正しい名前を表示することはできない。
        if (state && !state.nameIdentified) {
            globalIdentified = state.nameIdentified;
            pseudonym = state.pseudonym;
            level = DescriptionHighlightLevel.Unidentified;
        }

        const nameView = entity.getDisplayName();
        let displayName = pseudonym;
        if (globalIdentified) {
            displayName = nameView.name;
        }

        let upgrades = 0;
        if (individualIdentified && globalIdentified) {
            upgrades = nameView.upgrades;
        }

        let capacity = undefined;
        if (nameView.capacity && nameView.initialCapacity) {
            if (!individualIdentified || !globalIdentified) {
                // 何かしら未識別？
                capacity = nameView.capacity - nameView.initialCapacity;
            }
            else {
                // 識別済み
                capacity = nameView.capacity;
            }
        }

        return new LEntityDescription(nameView.iconIndex, displayName, level, upgrades, capacity);
    }

    // ユーティリティ
    makeDisplayText(entity: LEntity): string {
        return this.resolveDescription(entity).displayText();
    }
}
