
export type DEntityKindId = number;

/**
 * Entity の種別
 * 
 * Prefab 検索やソートキーなどで使われる。
 * 持ち物一覧のアイコンと考えるとわかりやすい。
 * 武器、巻物といった一般的なアイテムの他、モンスターを持ち歩くこともできる。
 * 
 * アイテム化け能力をもつモンスターなどにより、適宜オーバーライドされることはあるが、
 * Entity 1つに対して一意の表現となる。（「武器かつ盾」といった表現に使うものではない）
 * 
 * 勢力を表すものではない点に注意。例えば種別 "Monster" は、敵にも味方にもなれる。
 * 
 * 
 * 
 * [2020/9/6] 
 * ----------
 * 元々は ItemGroup としていたが、もっと抽象的なものにする必要があった。
 */
export interface DEntityKind
{
    /** ID (0 is Invalid). */
    id: DEntityKindId;

    /** Name. */
    displayName: string;

    /** prefabKind. */
    prefabKind: string;

    
}
