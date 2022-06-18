import { MRSerializable, tr2 } from "ts/mr/Common";
import { DEntityId, DIdentificationDifficulty } from "ts/mr/data/DEntity";
import { DLand } from "ts/mr/data/DLand";
import { MRData } from "ts/mr/data/MRData";
import { SView } from "ts/mr/system/SView";
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
        if (this._capacity !== undefined) {
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
@MRSerializable
export class LIdentifyer {
    /** 種別としての識別済みフラグ。undefined の場合、その Entity は常に少なくとも名前は識別済み。 Index: DEntityId */
    private _identificationStates: (IdentificationState | undefined)[] = [];

    public reset(land: DLand): void {
        this._identificationStates = [];

        for (const kind of MRData.pseudonymous.kinds()) {
            if (land.checkIdentifiedKind(kind)) {
                // land 内では、この kind は常に識別状態
            }
            else {
                const names = MRData.pseudonymous.getNameList(kind.id);
                const entities = MRData.entities.filter(x => x.entity.kindId == kind.id && x.identificationDifficulty == DIdentificationDifficulty.Obscure);
                if (names.length < entities.length) {
                    throw new Error(tr2(`Kind:${kind.name} の pseudonym が不足しています。(c: ${names.length})`));
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

    public identifyGlobal(entityDataId: DEntityId): void {
        const state = this._identificationStates[entityDataId];
        if (state) {
            state.nameIdentified = true;
        }
    }

    public resolveDescription(viewSubject: LEntity, entity: LEntity): LEntityDescription {
        const dataId = entity.dataId;
        const entityData = entity.data;

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
            globalIdentified = false;
            pseudonym = state.pseudonym;
            level = DescriptionHighlightLevel.Unidentified;
        }

        // 呪い状態などを受けないものは、名前識別済みであれば個体識別済みとする
        if (globalIdentified && !entityData.canModifierState) {
            individualIdentified = true;
            level = DescriptionHighlightLevel.Identified;
        }


        const nameView = SView.getLookNames(viewSubject, entity);
        let displayName = pseudonym;
        if (globalIdentified) {
            displayName = nameView.name;
        }

        let upgrades = 0;
        if (individualIdentified && globalIdentified) {
            upgrades = nameView.upgrades;
        }

        let capacity = undefined;
        if (nameView.capacity !== undefined && nameView.initialCapacity) {
            if (!individualIdentified || !globalIdentified) {
                // 何かしら未識別？
                capacity = nameView.capacity - nameView.initialCapacity;

                // 未識別で1回も使用していない場合は回数欄は表示しない
                if (capacity === 0) capacity = undefined;
            }
            else {
                // 識別済み
                capacity = nameView.capacity;
            }
        }

        
        let iconIndex = nameView.iconIndex;
        if (!individualIdentified || !globalIdentified) {
            // 何かしら未識別？
        }
        else if (individualIdentified) {
            // 個体識別済み
            const states = entity.states();
            if (states.length > 0) {
                // 祝福など、アイコン表示したいステートが付いているか？
                const state = states.find(x => x.stateData().displayNameIcon);
                if (state) {
                    iconIndex = state.stateData().iconIndex;
                }
            }
        }

        return new LEntityDescription(iconIndex, displayName, level, upgrades, capacity);
    }

    public checkGlobalIdentified(entity: LEntity): boolean {
        const dataId = entity.dataId;
        const state = this._identificationStates[dataId];
        if (!state)
            return true;
        else
            return state.nameIdentified;
    }

    // ユーティリティ
    makeDisplayText(viewSubject: LEntity, entity: LEntity): string {
        return this.resolveDescription(viewSubject, entity).displayText();
    }
}
