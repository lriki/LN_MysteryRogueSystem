import { DLandId } from "./DCommon";
import { DRmmzEffectScope } from "./DEffect";

export interface DConstructionExpr {
    name: string;
    args: any[];
}

export class DHelpers {
    public static TILE_ID_E = 768;
    public static TILE_ID_A5 = 1536;
    public static TILE_ID_A1 = 2048;
    public static TILE_ID_A2 = 2816;
    public static TILE_ID_A3 = 4352;
    public static TILE_ID_A4 = 5888;
    public static TILE_ID_MAX = 8192;

    public static VanillaLandId = 1;
    //public static WorldLandId = 2;
    // NOTE: なぜ Vanilla と World を分けるの？
    //       → お試し中。 World という単位を入れると色々と都合がよいことが分かったが、
    //          Vanilla は従来から「MRシステム管理外」のマップの置き場としていた。
    //          Vanilla と World を一緒にしてしまうと、その置き場がなくなってしまう。

    // public static getMapName(mapId: DMapId): string {
    //     const info = $dataMapInfos[mapId];
    //     return info ? info.name : "";
    // }

    public static isVanillaLand(landId: DLandId): boolean {
        return landId == this.VanillaLandId;
    }

    // public static isWorldLand(landId: DLandId): boolean {
    //     return landId == this.WorldLandId;
    // }

    // public static isDungeonLand(landId: DLandId): boolean {
    //     return landId > 0 && landId != this.VanillaLandId && landId != this.WorldLandId;
    // }

    public static getMapTopTile(mapData: IDataMap, x: number, y: number): number {
        for (let z = 3; z >= 0; z--) {
            const tile = mapData.data[(z * mapData.height + y) * mapData.width + x] || 0;
            if (tile > 0) return tile;
        }
        return 0;
    }

    public static isTileA3(tileId: number): boolean {
        return tileId >= this.TILE_ID_A3 && tileId < this.TILE_ID_A4;
    };
    
    public static isTileA4(tileId: number): boolean {
        return tileId >= this.TILE_ID_A4 && tileId < this.TILE_ID_MAX;
    };

    public static isAutotile(tileId: number): boolean {
        return tileId >= this.TILE_ID_A1;
    }

    public static getAutotileKind(tileId: number): number {
        //if (!this.isAutotile(tileId)) return 0;
        return Math.floor((tileId - this.TILE_ID_A1) / 48);
    }

    public static autotileKindToTileId(autotileKind: number): number {
        return autotileKind * 48 + this.TILE_ID_A1;
    }

    public static isWallSideAutoTile(autotileKind: number): boolean {
        const tileId = this.autotileKindToTileId(autotileKind);
        return (
            (this.isTileA3(tileId) || this.isTileA4(tileId)) &&
            this.getAutotileKind(tileId) % 16 >= 8
        );
    }

    public static stringToEnum<T>(value: string | undefined, pattern: { [key: string]: T }): T {
        if (value) {
            const e = pattern[value];
            if (e !== undefined) {
                return e;
            }
        }
        const d = pattern["_"];
        if (d !== undefined) {
            return d;
        }
        throw new Error(`Unknown value: ${value}`);
    }

    
    
    
    // Game_Action.prototype.checkItemScope
    private static checkItemScope(itemScope: DRmmzEffectScope, list: DRmmzEffectScope[]) {
        return list.includes(itemScope);
    }

    // Game_Action.prototype.isForOpponent
    public static isForOpponent(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Opponent_Single,
            DRmmzEffectScope.Opponent_All,
            DRmmzEffectScope.Opponent_Random_1,
            DRmmzEffectScope.Opponent_Random_2,
            DRmmzEffectScope.Opponent_Random_3,
            DRmmzEffectScope.Opponent_Random_4,
            DRmmzEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForAliveFriend
    public static isForAliveFriend(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Alive,
            DRmmzEffectScope.Friend_All_Alive,
            DRmmzEffectScope.User,
            DRmmzEffectScope.Everyone]);
    }

    // Game_Action.prototype.isForDeadFriend
    public static isForDeadFriend(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Dead,
            DRmmzEffectScope.Friend_All_Dead]);
    }

    public static isForFriend(itemScope: DRmmzEffectScope): boolean {
        return this.isForAliveFriend(itemScope) || this.isForDeadFriend(itemScope);
    }
    
    public static isSingle(itemScope: DRmmzEffectScope): boolean {
        return this.checkItemScope(itemScope, [
            DRmmzEffectScope.Friend_Single_Dead,
            DRmmzEffectScope.Friend_Single_Alive,
            DRmmzEffectScope.Opponent_Single]);
    }


    static countSomeTilesRight_E(mapData: IDataMap, x: number, y: number): number {

        const findEvent = function(x: number, y: number): IDataMapEvent | undefined {
            for (const event of mapData.events) {
                if (event && event.x == x && event.y == y) {
                    return event;
                }
            }
            return undefined;
        }

        const baseTile = DHelpers.getMapTopTile(mapData, x, y);
        let x2 = x + 1;

        // 右へ伸びるタイルをカウントするときは E タイルのみを対象とする
        if (DHelpers.TILE_ID_E <= baseTile && baseTile < DHelpers.TILE_ID_A5) {
            for (; x2 < mapData.width; x2++) {
                if (baseTile != DHelpers.getMapTopTile(mapData, x2, y) || findEvent(x2, y)) {
                    
                    break;
                }
            }
        }

        return (x2 - 1) - x;
    }

    private static extractMetadataRegex = /<([^<>:]+)(:?)([^>]*)>/g;

    public static extractMetadata(data: any): void {
        data.meta = {};
        for (;;) {
            var match = this.extractMetadataRegex.exec(data.note);
            if (match) {
                var value = (match[2] === ':') ? match[3] : true;
                if (data.meta[match[1]]) {
                    if (data.meta[match[1]].constructor === Array) {
                        data.meta[match[1]].push(value);
                    } else {
                        var _value = data.meta[match[1]];
                        data.meta[match[1]] = [_value, value];
                    }
                } else {
                    data.meta[match[1]] = value;
                }
            } else {
                break;
            }
        }
    }

    public static makeRmmzMapDebugName(mapId: number) {
        return `${mapId}:${$dataMapInfos[mapId]?.name}`;
    }
    
    public static isNode(): boolean {
        return (process.title !== 'browser');
    }

    public static parseConstructionExpr(expr: string): DConstructionExpr {

        // "Item(1, 2)" を、 { name: "Item", args: [1, 2] } にする。
        const lp = expr.indexOf("(");
        const rp = expr.lastIndexOf(")");

        if (lp >= 0 && rp >= 0) {
            const expr2 = "[" + expr.substr(lp + 1, rp - lp - 1) + "]";
            const args = eval(expr2);
            return { name: expr.substr(0, lp).trim(), args: args };
        }
        else {
            // 引数省略されている
            return { name: expr.trim(), args: [] };
        }
    }

    public static parseDisplayName(name: string): string {
        const index = name.lastIndexOf(".");
        if (index >= 0)
            return name.substring(0, index);
        else
            return name;
    }
}