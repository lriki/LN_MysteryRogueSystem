
(() => {

//==============================================================================
// Window
//==============================================================================

Object.defineProperty(Window.prototype, "backOpacity", {
    get: function() {
        return this._backSprite.alpha * 255;
    },
    set: function(value) {
        const alpha = value.clamp(0, 255) / 255;
        this._backSprite.alpha = alpha;
        if (this._lnBack9Sprites) {
            for (const sprite of this._lnBack9Sprites) {
                sprite.alpha = alpha;
            }
        }
    },
    configurable: true
});

const _Window_loadWindowskin = Window.prototype.loadWindowskin;
Window_Base.prototype.loadWindowskin = function() {
    this.windowskin = ImageManager.loadSystem("MR-Window2");
};

const _Window__createBackSprite = Window.prototype._createBackSprite;
Window.prototype._createBackSprite = function() {
    _Window__createBackSprite.call(this);
    this._lnBack9Sprites = [];
    for (let i = 0; i < 9; i++) {
        const sprite = new Sprite();
        this._container.addChild(sprite);
        this._lnBack9Sprites.push(sprite);
    }

    // オリジナルの _backSprite は使わない (拡大された背景が表示されてしまうので)
    this._container.removeChild(this._backSprite);
};

const _Window__refreshBack = Window.prototype._refreshBack;
Window.prototype._refreshBack = function() {
    _Window__refreshBack.call(this);
    if (!this._lnBack9Sprites) return;

    for (const sprite of this._lnBack9Sprites) {
        sprite.bitmap = this._windowskin;
    }

    // margin
    const m = 24;  // see: Window.prototype._refreshFrame

    // source rect
    const sx = 0;
    const sy = 0;
    const sw = 96;
    const sh = 96;
    const smw = sw - m * 2;
    const smh = sh - m * 2;

    // dest rect
    const dx = 0;
    const dy = 0;
    const dw = this._width;
    const dh = this._height;
    const dmw = dw - m * 2;
    const dmh = dh - m * 2;

    // Top-Left
    let sprite = this._lnBack9Sprites[0];
    sprite.setFrame(sx, sy, m, m);
    sprite.move(dx, dy);

    // Top
    sprite = this._lnBack9Sprites[1];
    sprite.setFrame(sx + m, sy, smw, m);
    sprite.move(dx + m, dy);
    sprite.scale.x = dmw / smw;

    // Top-Right
    sprite = this._lnBack9Sprites[2];
    sprite.setFrame(sw - m, sy, m, m);
    sprite.move(dw - m, dy);
    
    // Left
    sprite = this._lnBack9Sprites[3];
    sprite.setFrame(sx, sy + m, m, smh);
    sprite.move(dx, dy + m);
    sprite.scale.y = dmh / smh;
    
    // Center
    sprite = this._lnBack9Sprites[4];
    sprite.setFrame(sx + m, sy + m, smw, smh);
    sprite.move(dx + m, dy + m);
    sprite.scale.x = dmw / smw;
    sprite.scale.y = dmh / smh
    
    // Right
    sprite = this._lnBack9Sprites[5];
    sprite.setFrame(sw - m, sy + m, m, smh);
    sprite.move(dw - m, dy + m);
    sprite.scale.y = dmh / smh;
    
    // Bottom-Left
    sprite = this._lnBack9Sprites[6];
    sprite.setFrame(sx, sh - m, m, m);
    sprite.move(dx, dh - m);
    
    // Bottom
    sprite = this._lnBack9Sprites[7];
    sprite.setFrame(sx + m, sh - m, smw, m);
    sprite.move(dx + m, dh - m);
    sprite.scale.x = dmw / smw;
    
    // Bottom-Right
    sprite = this._lnBack9Sprites[8];
    sprite.setFrame(sw - m, sh - m, m, m);
    sprite.move(dw - m, dh - m);
};


//==============================================================================
// Window
//==============================================================================
// const _Window_Base_setBackgroundType = Window_Base.prototype.setBackgroundType;
// Window_Base.prototype.setBackgroundType = function(type) {
//     _Window_Base_setBackgroundType.call(this, 0);
// };

})();
