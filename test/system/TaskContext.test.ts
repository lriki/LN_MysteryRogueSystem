import { SCommandResponse } from "ts/re/system/RECommand";
import { SCommandContext } from "ts/re/system/SCommandContext";
import { SSequelContext } from "ts/re/system/SSequelContext";

beforeAll(() => {
});

test("system.TaskContext.Basic", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());
    ctx.postTask(_ => {
        result.push(0);
    });
    ctx.postTask(_ => {
        result.push(1);
    });
    ctx.postTask(_ => {
        result.push(2);
    });

    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(3);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(2);
});

test("system.TaskContext.PostInHandler", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());
    ctx.postTask(_ => {
        result.push(0);
        ctx.postTask(_ => {
            result.push(1);
        });
    });
    ctx.postTask(_ => {
        result.push(2);
        ctx.postTask(_ => {
            result.push(3);
        });
    });

    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(4);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(2);
    expect(result[2]).toBe(1);
    expect(result[3]).toBe(3);
});

test("system.TaskContext.SingleThenCatch", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());

    // then 側を実行
    ctx.postTask((c) => {
        result.push(0);
        c.resolve();
    })
    .then2((c) => {
        result.push(1);
    })
    .catch(() => {
        result.push(2);
    });

    // catch 側を実行
    ctx.postTask((c) => {
        result.push(3);
        c.reject();
    })
    .then2((c) => {
        result.push(4);
    })
    .catch(() => {
        result.push(5);
    });

    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(4);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe(5);
});

test("system.TaskContext.SequentialThen", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());

    ctx.postTask((c) => {
        result.push(0);
        c.resolve();
    })
    .then2((c) => {
        c.resolve();
        result.push(1);
    })
    .then2((c) => {
        c.resolve();
        result.push(2);
    })
    .then2((c) => {
        c.resolve();
        result.push(3);
    });
    
    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(4);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(2);
    expect(result[3]).toBe(3);
});


test("system.TaskContext.NearCache", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());

    ctx.postTask((c) => {
        result.push(0);
        c.resolve();
    })
    .then2((c) => {
        c.reject();
        result.push(1);
    })
    .then2((c) => { // 実行されない
        c.resolve();
        result.push(2);
    })
    .catch(() => {
        result.push(3);
    })
    .then2((c) => { // 実行されない
        c.resolve();
        result.push(4);
    })
    .then2((c) => { // 実行されない
        c.resolve();
        result.push(5);
    })
    .catch(() => {  // 実行されない
        result.push(6);
    });
    
    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(3);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(3);
});

test("system.TaskContext.Finally", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());

    ctx.postTask((c) => {
        result.push(0);
        c.resolve();
    })
    .then2((c) => {
        result.push(1);
        c.reject();
    })
    .finally((c) => {
        result.push(2);
        c.next();
    })
    .then2((c) => { // 実行されない
        result.push(3);
        c.resolve();
    })
    .catch((c) => {
        result.push(4);
        c.next();
    })
    .finally((c) => {
        result.push(5);
        c.next();
    })
    .then2((c) => { // 実行されない
        result.push(6);
        c.resolve();
    })
    .then2((c) => { // 実行されない
        result.push(7);
        c.resolve();
    })
    .catch((c) => {  // 実行されない
        result.push(8);
        c.next();
    })
    .finally((c) => {
        result.push(9);
        c.next();
    });
    
    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(6);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(2);
    expect(result[3]).toBe(4);
    expect(result[4]).toBe(5);
    expect(result[5]).toBe(9);
});

test("system.TaskContext.Nesting", () => {
    let result: number[] = [];
    const ctx = new SCommandContext(new SSequelContext());

    ctx.postTask((c) => {
        result.push(0);
        ctx.postTask((c2) => {
            result.push(1);
            c2.resolve();
            c.resolve();    // 最初の Task をここで resolve
        })
        .finally((c2) => {
            result.push(2);
            c2.next();
        });
    })
    .then2((c) => {
        result.push(3);
        c.resolve();
    })
    .finally((c) => {
        result.push(4);
        c.next();
    });
    
    while (ctx.isRunning()) {
        ctx._processCommand();
    }

    expect(result.length).toBe(5);
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(1);
    expect(result[2]).toBe(3);
    expect(result[3]).toBe(4);
    expect(result[4]).toBe(5);
});
