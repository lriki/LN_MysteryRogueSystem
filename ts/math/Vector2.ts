
// NOTE: 実行速度よりも書きやすさ・安全性重視で。

export class Vector2 {
    x: number = 0.0;
    y: number = 0.0;

    constructor(x: number = 0.0, y:number = 0.0) {
        this.x = x;
        this.y = y;
    }

    static clone(value: Vector2): Vector2 {
        return new Vector2(value.x, value.y);
    }

    static add(a: Vector2, b: number): Vector2;
    static add(a: Vector2, b: Vector2): Vector2;
    static add(a: Vector2, b: any): Vector2 {
        if (typeof b === "number") {
            return new Vector2(a.x + b, a.y + b);
        }
        else {
            return new Vector2(a.x + b.x, a.y + b.y);
        }
    }

    static sub(a: Vector2, b: number): Vector2;
    static sub(a: Vector2, b: Vector2): Vector2;
    static sub(a: Vector2, b: any): Vector2 {
        if (typeof b === "number") {
            return new Vector2(a.x - b, a.y - b);
        }
        else {
            return new Vector2(a.x - b.x, a.y - b.y);
        }
    }

    static mul(a: Vector2, b: number): Vector2;
    static mul(a: Vector2, b: Vector2): Vector2;
    static mul(a: Vector2, b: any): Vector2 {
        if (typeof b === "number") {
            return new Vector2(a.x * b, a.y * b);
        }
        else {
            return new Vector2(a.x * b.x, a.y * b.y);
        }
    }

    static div(a: Vector2, b: number): Vector2;
    static div(a: Vector2, b: Vector2): Vector2;
    static div(a: Vector2, b: any): Vector2 {
        if (typeof b === "number") {
            return new Vector2(a.x / b, a.y / b);
        }
        else {
            return new Vector2(a.x / b.x, a.y / b.y);
        }
    }
    
    static sign(value: Vector2): Vector2
    {
        return new Vector2(
            (value.x < 0.0) ? -1.0 : ((value.x > 0.0) ? 1.0 : 0.0),
            (value.y < 0.0) ? -1.0 : ((value.y > 0.0) ? 1.0 : 0.0));
    }
}
