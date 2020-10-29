import { TileKind } from "../RE/REGame_Block";
import { REGame_AttributeData, REGame_Attribute } from "../RE/REGame_Attribute";

interface RETileAttributeData extends REGame_AttributeData {
    tileKind: TileKind;
}

export class RETileAttribute extends REGame_Attribute {
    tileKind(): TileKind { return this._data.tileKind; }
    setTileKind(value: TileKind) { this._data.tileKind = value; return this; }

    _data: RETileAttributeData = {
        tileKind: TileKind.Floor,
    };
    data(): REGame_AttributeData {
        return this._data;
    }
}
