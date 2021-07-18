


declare global {
    interface Array<T> {
        mutableResize(newSize: number, defaultValue: T): void;
        mutableRemove(predicate: (x: T) => boolean): boolean;
        mutableRemoveAll(predicate: (x: T) => boolean): boolean;
        mutableShuffle(): void;
        distinct(): Array<T>;
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

export {}
