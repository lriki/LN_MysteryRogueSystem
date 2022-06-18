import { DActionId } from "./DCommon";

/**
 * 拾う、投げる、などの行動の種類
 * 
 * Command と密接に関係し、Command の種類 (というより発動の基点) を示すために使用する。
 * また、UI 状に表示される "ひろう" "なげる" といった表示名もここで定義する。
 * 
 * Command は dynamic なデータ構造だが、こちらは static.
 */
export class DAction {
    /** ID (0 is Invalid). */
    id: DActionId;

    /** Name */
    displayName: string;

    /** GUI への表示優先度 (値が大きいほうが先頭に来る) */
    priority: number;

    public constructor(id: DActionId) {
        this.id = id;
        this.displayName = "null";
        this.priority = 0;
    }
}
