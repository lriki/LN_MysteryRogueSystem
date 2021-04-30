


declare global {
    interface Array<T> {
        mutableRemove(predicate: (x: T) => boolean): boolean;
        distinct(): Array<T>;
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

Array.prototype.distinct = function<T>(): Array<T> {
    return Array.from(new Set(this));
}

export {}
