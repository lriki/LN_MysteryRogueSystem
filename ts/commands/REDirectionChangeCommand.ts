import { RECommand } from "../system/RECommand";


export class REDirectionChangeCommand extends RECommand {
    private _direction: number;   // Numpad based.

    constructor(direction: number) {
        super();
        this._direction = direction;
    }

    direction(): number {
        return this._direction;
    }
}

export class REMoveToAdjacentCommand extends RECommand {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        super();
        this._x = x;
        this._y = y;
    }

    x(): number {
        return this._x;
    }

    y(): number {
        return this._y;
    }
}


