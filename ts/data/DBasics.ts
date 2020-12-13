import { DEntityKindId } from "./DEntityKind";
import { DBasicActions } from "./predefineds/DBasicActions";
import { BasicEntityKinds } from "./predefineds/DBasicEntityKinds";


/**
 * ゲームシステムとして重要な定義済みデータを保持する
 */
export class DBasics
{
    static actions: DBasicActions;
    static entityKinds: BasicEntityKinds;
}

