import { assert } from '../Common';
import { RMMZHelper } from './RMMZHelper';

const _Window_MapName_update = Window_MapName.prototype.update;
Window_MapName.prototype.update = function() {
    if (RMMZHelper.isRESystemMap()) {
        // RESystem マップでは標準のマップ名表示は使わない
    }
    else {
        _Window_MapName_update.call(this);
    }
}
