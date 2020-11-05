
const dir8PatternYTable: number[] = [
    0,
    4, 0, 6,
    1, 0, 2,
    5, 3, 7,
];

const dir4PatternYTable: number[] = [
    0,
    0, 0, 0,
    1, 0, 2,
    3, 3, 3,
];

const _Sprite_Character_characterPatternY = Sprite_Character.prototype.characterPatternY;
Sprite_Character.prototype.characterPatternY = function() {
    if (this._character.characterName().endsWith("-X")) {
        return dir8PatternYTable[this._character.direction()];
    }
    else {
        return dir4PatternYTable[this._character.direction()];
        //return _Sprite_Character_characterPatternY.call(this);
    }
};

