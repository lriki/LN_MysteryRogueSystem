
export class SMinimapData {
    private _width: number = 0;
    private _height: number = 0;
    private _data: number[] = [];
    private _tilemapResetNeeded: boolean = true;

    public reset(width: number, height: number) {
        this._width = width;
        this._height = height;
        this._data = new Array(this._width * this._height * 4);
        this._tilemapResetNeeded = true;

        this.setData(1, 1, 0, Tilemap.TILE_ID_A5 + 1);
        this.setData(0, 0, 0, Tilemap.TILE_ID_A5 + 1);
    }

    public width(): number {
        return this._width;
    }

    public height(): number {
        return this._height;
    }

    // Tilemap に登録する、 RMMZ と同じフォーマットのマップデータ
    public data(): number[] {
        return this._data;
    }

    public setData(x: number, y: number, z: number, value: number): void {
        if (!this.isValid(x, y, z)) throw new Error();
        this._data[(z * this._height + y) * this._width + x] = value;
    }

    public isValid(x: number, y: number, z: number): boolean {
        return (0 <= x && x < this._width) && (0 <= y && y < this._height) && (0 <= z && z < 4);
    }

    public isTilemapResetNeeded(): boolean {
        return this._tilemapResetNeeded;
    }

    public clearTilemapResetNeeded(): void {
        this._tilemapResetNeeded = false;
    }

}
