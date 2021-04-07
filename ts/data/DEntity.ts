import { DPrefabId } from "./DPrefab";


export interface DEntity {
    prefabId: DPrefabId;

    // TODO:
    // 初期状態異常 (チュートリアルダンジョンで必ず寝ている、麻痺している等)

}

export function DEntity_Default(): DEntity {
    return {
        prefabId: 0,
    };
}
