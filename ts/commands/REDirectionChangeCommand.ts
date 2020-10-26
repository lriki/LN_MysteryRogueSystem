import { RECommand } from "ts/RE/RECommand";


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


