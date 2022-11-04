import { DEntityCategoryId } from "./DCommon";
import { DEntity } from "./DEntity";
import { MRBasics } from "./MRBasics";

/**
 * Entity の種別
 * 
 * ソートキーなどで使われる。
 * 持ち物一覧のアイコンと考えるとわかりやすい。
 * 
 * アイテム化け能力をもつモンスターなどにより、適宜オーバーライドされることはあるが、
 * Entity 1つに対して一意の表現となる。
 * 「武器かつ盾」といった表現はできない。そういった場合は、どちらかに分類しなければならない。
 * 
 * 勢力を表すものではない点に注意。例えば種別 "Monster" は、敵にも味方にもなれる。
 * 
 * 
 * 
 */
export class DEntityCategory {
    /** ID (0 is Invalid). */
    public readonly id: DEntityCategoryId;

    /** key. */
    public readonly key: string;

    /** Name. */
    displayName: string;

    
    public constructor(id: DEntityCategoryId, key: string) {
        this.id = id;
        this.key = key;
        this.displayName = "";
    }
    
    // Enemy とは区別する。
    // Enemy は敵対という意味も含むため。
    // Monster は仲間になることもある。
    public static isMonster(entity: DEntity): boolean {
        return entity.entity.kindId == MRBasics.entityCategories.MonsterKindId;
    }

    public static isTrap(entity: DEntity): boolean {
        return entity.entity.kindId == MRBasics.entityCategories.TrapKindId;
    }

    public static isEntryPoint(entity: DEntity): boolean {
        return entity.entity.kindId == MRBasics.entityCategories.entryPoint;
    }

    public static isExitPoint(entity: DEntity): boolean {
        return entity.entity.kindId == MRBasics.entityCategories.exitPoint;
    }

    public static isOrnament(entity: DEntity): boolean {
        return entity.entity.kindId == MRBasics.entityCategories.Ornament;
    }

    public static isItem(entity: DEntity): boolean {
        return  !this.isMonster(entity) &&
                !this.isEntryPoint(entity) &&
                !this.isExitPoint(entity) &&
                !this.isOrnament(entity);
    }
    
    public applyProps(props: IEntityCategoryProps): void {

    }
}

//------------------------------------------------------------------------------
// Props

export interface IEntityCategoryProps {
}

