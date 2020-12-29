
/*
 [2020/12/29] Trait を Object で表す必要はある？
 ----------
 State はもしかしたら必要ないかもしれないが、Item ではシレン5の新種道具のように効果を後付け & 説明文付きするために必要になる。
*/

import { REData } from "./REData";

export type DStateTraitId = number;

export interface DStateTrait {
    /** ID (0 is Invalid). */
    id: DStateTraitId;

    /** Name */
    name: string;
}
