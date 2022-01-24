import { assert } from "../Common";



declare global {
    interface Array<T> {
        pushArray(ary: readonly T[]): void;
        mutableResize(newSize: number, defaultValue: T): void;
        mutableRemoveAt(index: number): void;
        mutableRemove(predicate: (x: T) => boolean): boolean;
        mutableRemoveAll(predicate: (x: T) => boolean): boolean;
        mutableShuffle(): void;
        distinct(): Array<T>;
        immutableSort(compareFn?: (a: T, b: T) => number): Array<T>;
        selectMin(fn: (a: T, b: T) => number): T | undefined;

        isEmpty(): boolean;
        front(): T;
        back(): T;
        backOrUndefined(): T | undefined;
    }

    // interface ReadonlyArray<T> {
    //     countIf(pred: (a: T) => boolean): number;
    // }
}

Array.prototype.pushArray = function<T>(ary: readonly T[]): void {
    for (const i of ary) this.push(i);
}

Array.prototype.mutableResize = function<T>(newSize: number, defaultValue: T): void {
    while(this.length > newSize) { this.pop(); }
    while(this.length < newSize) { this.push(defaultValue); }
}

Array.prototype.mutableRemoveAt = function<T>(index: number): boolean {
    if (index >= 0) {
        this.splice(index, 1);
        return true;
    }
    else {
        return false;
    }
}

Array.prototype.mutableRemove = function<T>(predicate: (x: T) => boolean): boolean {
    const index = this.findIndex(predicate);
    if (index >= 0) {
        this.splice(index, 1);
        return true;
    }
    else {
        return false;
    }
}

Array.prototype.mutableRemoveAll = function<T>(predicate: (x: T) => boolean): boolean {
    let count = 0;
    for (let i = this.length - 1; i >= 0; i--) {
        if (predicate(this[i])) {
            this.splice(i, 1);
            count++;
        }
    }
    return count > 0;
}

Array.prototype.mutableShuffle = function(): void {
    for (var i = (this.length - 1); 0 < i; i--) {
        // 0〜(i+1)の範囲で値を取得
        var r = Math.floor(Math.random() * (i + 1));
    
        // 要素の並び替えを実行
        var tmp = this[i];
        this[i] = this[r];
        this[r] = tmp;
    }
}

Array.prototype.distinct = function<T>(): Array<T> {
    return Array.from(new Set(this));
}


Array.prototype.immutableSort = function<T>(compareFn?: (a: T, b: T) => number): Array<T> {
    return Object.assign([], this).sort(compareFn);
}

Array.prototype.selectMin = function<T>(fn: (a: T, b: T) => number): T | undefined {
    if (this.length <= 0) return undefined;
    let m = this[0];
    for (let i = 1; i < this.length; i++) {
        if (fn(m, this[i])) {
            m = this[i];
        }
    }
    return m;
}

Array.prototype.isEmpty = function(): boolean {
    return this.length == 0;
}

Array.prototype.front = function<T>(): T {
    assert(this.length > 0);
    return this[0];
}

Array.prototype.back = function<T>(): T {
    assert(this.length > 0);
    return this[this.length - 1];
}

Array.prototype.backOrUndefined = function<T>(): T | undefined {
    if (this.length <= 0) return undefined;
    return this[this.length - 1];
}

// ReadonlyArray.prototype.countIf = function<T>(pred: (a: T) => boolean): number {
//     let result = 0;
//     for (const a of this) {
//         if (pred(a)) result++;
//     }
//     return result;
// }

export {}
