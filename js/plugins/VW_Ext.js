

/// <reference path="../../data/mr/MysteryRogueSystem.d.ts" />
if (0) var MRModule = require("MysteryRogueSystem");

//MR.VChronusWindow


console.log("MRModule", MRModule);
console.log("MRModule.MRView", MRModule.MRView);
//const bitmap = new Bitmap(816, 624);

const _MR_view_onCreateWindow = MRModule.MRView.ext.onCreateWindow;
MRModule.MRView.ext.setOnCreateWindow((name, rect) => {
    console.log("onCreateWindow", name);
    if (name === "VChronusWindow") {
        console.log("MRModule", MRModule);
        console.log("MRModule.VChronusWindow", MRModule.VChronusWindow);
        //return new MRModule.VChronusWindow(new Rectangle(0, 0, 300, 300));
    }
    _MR_view_onCreateWindow.call(name);
});


