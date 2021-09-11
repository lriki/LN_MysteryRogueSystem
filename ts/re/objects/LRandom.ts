import { assert } from "../Common";


export class LRandom {
    private _x: number;
    private _y: number;
    private _z: number;
    private _w: number;

    constructor(seed: number) {
        this._x = 123456789;
        this._y = 362436069;
        this._z = 521288629;
        this._w = seed;
    }

    public resetSeed(seed: number) {
        this._x = 123456789;
        this._y = 362436069;
        this._z = 521288629;
        this._w = seed;
    }

    nextInt(): number {
        const t = this._x ^ (this._x << 11);
        this._x = this._y;
        this._y = this._z;
        this._z = this._w;
        this._w = (this._w ^ (this._w >> 19)) ^ (t ^ (t >> 8));

        return this._w;
    }
    
    // 0~(maxValue-1)
    nextIntWithMax(maxValue: number): number  {
        if (maxValue == 0) {
            return 0;
        }
        let r = this.nextInt();
        r %= maxValue;
        return r;
    }

    // minValue~(maxValue-1)
    nextIntWithMinMax(minValue: number, maxValue: number): number  {
        if (maxValue - minValue == 0) {
            return 0;
        }
        let r = this.nextInt();
        r %= maxValue - minValue;
        r += minValue;
        return r;
    }

    nextIntWithWidth(median: number, width: number): number {
        return this.nextIntWithMinMax(median - width, median + width);
    }

    public select<T>(ary: Array<T>): T {
        assert(ary.length > 0);
        return ary[this.nextIntWithMax(ary.length)];
    }

    public selectOrUndefined<T>(ary: Array<T>): T | undefined {
        if (ary.length > 0)
            return ary[this.nextIntWithMax(ary.length)];
        else
            return undefined;
    }
/*
    public shuffleArray<T>(array: Array<T>): void {
        for(var i = (array.length - 1); 0 < i; i--){
      
          // 0〜(i+1)の範囲で値を取得
          var r = this.nextIntWithMax(i + 2);//Math.floor(Math.random() * (i + 1));
      
          // 要素の並び替えを実行
          var tmp = array[i];
          array[i] = array[r];
          array[r] = tmp;
        }
      }
      */
}
