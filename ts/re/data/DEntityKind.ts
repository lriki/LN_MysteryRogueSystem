import { DEntityKindId } from "./DCommon";

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
export interface DEntityKind
{
    /** ID (0 is Invalid). */
    id: DEntityKindId;

    /** name. */
    name: string;
    /** Name. */
    displayName: string;


    
}
