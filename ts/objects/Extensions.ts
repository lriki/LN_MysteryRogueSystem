


declare global {
    interface Array<T> {
        mutableResize(newSize: number, defaultValue: T): void;
        mutableRemove(predicate: (x: T) => boolean): boolean;
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

Array.prototype.distinct = function<T>(): Array<T> {
    return Array.from(new Set(this));
}

export {}
