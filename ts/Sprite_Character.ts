
const dir8PatternYTable: number[] = [
    0,
    4, 0, 6,
    1, 0, 2,
    5, 3, 7,
];

const _Sprite_Character_characterPatternY = Sprite_Character.prototype.characterPatternY;
Sprite_Character.prototype.characterPatternY = function() {
    if (1) {
        return dir8PatternYTable[this._character.direction()];
    }
    else {
        return _Sprite_Character_characterPatternY.call(this);
    }
};

