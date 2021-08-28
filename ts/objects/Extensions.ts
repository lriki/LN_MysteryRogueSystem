


declare global {
    interface Array<T> {
        mutableResize(newSize: number, defaultValue: T): void;
        mutableRemove(predicate: (x: T) => boolean): boolean;
        mutableRemoveAll(predicate: (x: T) => boolean): boolean;
        mutableShuffle(): void;
        distinct(): Array<T>;
        immutableSort(compareFn?: (a: T, b: T) => number): Array<T>;
        selectMin(fn: (a: T, b: T) => number): T | undefined;
    }
}

Array.prototype.mutableResize = function<T>(newSize: number, defaultValue: T): void {
    while(this.length > newSize) { this.pop(); }
    while(this.length < newSize) { this.push(defaultValue); }
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

export {}
