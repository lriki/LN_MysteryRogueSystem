//import { sum } from '../foo';

import { REDataManager } from "ts/RE/REDataManager";

//import "../types/rmmz_data"
//import "types/rmmz_data"
//import "@types/rmmz_data"
//import "rmmz_data"
//import { REDataManager } from "ts/RE/REDataManager";

test('basic', () => {
    console.log("BASIC TEST!!!!");
    const a: IDataTrait = {code: 1, 
        dataId: 3,
        value: 4};

    REDataManager.loadData();
    //expect(sum()).toBe(0);
});

test('basic again', () => {
    //expect(sum(1, 2)).toBe(3);
});
