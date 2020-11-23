import { TileKind } from "../REGame_Block";
import { LAttributeData, LAttribute } from "./LAttribute";

interface RETileAttributeData extends LAttributeData {
    tileKind: TileKind;
}

export class RETileAttribute extends LAttribute {
    tileKind(): TileKind { return this._data.tileKind; }
    setTileKind(value: TileKind) { this._data.tileKind = value; return this; }

    _data: RETileAttributeData = {
        tileKind: TileKind.Floor,
    };
    data(): LAttributeData {
        return this._data;
    }
}
