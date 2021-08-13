import { assert } from "ts/Common";

// JS の StorageManager と名前衝突するので、再定義したもの
export class RmmzStorageManager {

    public static fileDirectoryPath(): string {
        //assert(process.mainModule);
        const path = require("path");
        const base = process.cwd();//path.dirname(process.mainModule.filename);
        return path.join(base, "save/");
    };
}
