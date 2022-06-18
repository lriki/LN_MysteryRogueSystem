import { MRDataManager } from "../data/MRDataManager";
import { RMMZIntegration } from "./RMMZIntegration";
import { RESystem } from "../system/RESystem";
import { REVisual } from "../visual/REVisual";
import { MRData } from "ts/mr/data/MRData";

/*
import { ImGuiIO } from "../imgui-js/imgui";
import * as ImGui from "../imgui-js/imgui";
import * as ImGui_Impl from "./imgui/imgui_impl";

let font: ImGui.ImFont | null = null;

async function LoadArrayBuffer(url: string): Promise<ArrayBuffer> {
    const response: Response = await fetch(url);
    return response.arrayBuffer();
}

async function AddFontFromFileTTF(url: string, size_pixels: number, font_cfg: ImGui.ImFontConfig | null = null, glyph_ranges: number | null = null): Promise<ImGui.ImFont> {
    font_cfg = font_cfg || new ImGui.ImFontConfig();
    font_cfg.Name = font_cfg.Name || `${url.split(/[\\\/]/).pop()}, ${size_pixels.toFixed(0)}px`;
    return ImGui.GetIO().Fonts.AddFontFromMemoryTTF(await LoadArrayBuffer(url), size_pixels, font_cfg, glyph_ranges);
}

async function _init(): Promise<void> {
    console.log("Total allocated space (uordblks) @ _init:", ImGui.bind.mallinfo().uordblks);

    // Setup Dear ImGui binding
    ImGui.IMGUI_CHECKVERSION();
    ImGui.CreateContext();

    const io: ImGuiIO = ImGui.GetIO();
    // io.ConfigFlags |= ImGui.ConfigFlags.NavEnableKeyboard;  // Enable Keyboard Controls

    // Setup style
    ImGui.StyleColorsDark();
    //ImGui.StyleColorsClassic();

    // Load Fonts
    // - If no fonts are loaded, dear imgui will use the default font. You can also load multiple fonts and use ImGui::PushFont()/PopFont() to select them.
    // - AddFontFromFileTTF() will return the ImFont* so you can store it if you need to select the font among multiple.
    // - If the file cannot be loaded, the function will return NULL. Please handle those errors in your application (e.g. use an assertion, or display an error and quit).
    // - The fonts will be rasterized at a given size (w/ oversampling) and stored into a texture when calling ImFontAtlas::Build()/GetTexDataAsXXXX(), which ImGui_ImplXXXX_NewFrame below will call.
    // - Read 'misc/fonts/README.txt' for more instructions and details.
    // - Remember that in C/C++ if you want to include a backslash \ in a string literal you need to write a double backslash \\ !
    io.Fonts.AddFontDefault();
    font = await AddFontFromFileTTF("../imgui/misc/fonts/Roboto-Medium.ttf", 16.0);
    // font = await AddFontFromFileTTF("../imgui/misc/fonts/Cousine-Regular.ttf", 15.0);
    // font = await AddFontFromFileTTF("../imgui/misc/fonts/DroidSans.ttf", 16.0);
    // font = await AddFontFromFileTTF("../imgui/misc/fonts/ProggyTiny.ttf", 10.0);
    // font = await AddFontFromFileTTF("c:\\Windows\\Fonts\\ArialUni.ttf", 18.0, null, io.Fonts.GetGlyphRangesJapanese());
    // font = await AddFontFromFileTTF("https://raw.githubusercontent.com/googlei18n/noto-cjk/master/NotoSansJP-Regular.otf", 18.0, null, io.Fonts.GetGlyphRangesJapanese());
    ImGui.IM_ASSERT(font !== null);

    if (typeof(window) !== "undefined") {
        const output: HTMLElement = document.getElementById("output") || document.body;
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        output.appendChild(canvas);
        canvas.tabIndex = 1;
        canvas.style.position = "absolute";
        canvas.style.left = "0px";
        canvas.style.right = "0px";
        canvas.style.top = "0px";
        canvas.style.bottom = "0px";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        ImGui_Impl.Init(canvas);
    } else {
        ImGui_Impl.Init(null);
    }

    //StartUpImage();
    //StartUpVideo();

    //if (typeof(window) !== "undefined") {
    //    window.requestAnimationFrame(_loop);
    //}
}
*/



var _Scene_Boot_isReady = Scene_Boot.prototype.isReady;
Scene_Boot.prototype.isReady = function() {
    // ベースの isReady の中から onDatabaseLoaded が呼び出される
    const result = _Scene_Boot_isReady.call(this);

    if (!MRDataManager.isImportCompleted()) {
        return false;
    }
    else {
        MRData.verify();
        // Database マップの読み込みが完了
        return result;
    }
}

var _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;
Scene_Boot.prototype.onDatabaseLoaded = function() {
    _Scene_Boot_onDatabaseLoaded.call(this);
    MRDataManager.load();
    
    REVisual.initialize();
    RESystem.integration = new RMMZIntegration();
}
