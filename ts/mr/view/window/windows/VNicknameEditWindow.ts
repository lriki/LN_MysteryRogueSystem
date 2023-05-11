import { LEntity } from "ts/mr/lively/entity/LEntity";

export class VNicknameEditWindow extends Window_NameEdit {
    constructor(rect: Rectangle) {
        super(rect);
    }

    // Game_Actor ではなく Entity 用の setup。
    public setupFromEntity(entity: LEntity) {
        this._maxLength = 10;
        this._name = "";
        this._index = 0;
        this._defaultName = "";
    }

    // drawActorFace() しないようにする。
    override refresh() {
        this.contents.clear();
        for (let i = 0; i < this._maxLength; i++) {
            this.drawUnderline(i);
        }
        for (let j = 0; j < this._name.length; j++) {
            this.drawChar(j);
        }
        const rect = this.itemRect(this._index);
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    }
}

