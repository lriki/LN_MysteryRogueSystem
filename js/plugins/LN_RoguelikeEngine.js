//=============================================================================
// LN_RoguelikeEngine.js
// ----------------------------------------------------------------------------
// Copyright (c) 2020 lriki
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// [GitHub] : https://github.com/lriki/LN_RoguelikeEngine
// [Twitter]: https://twitter.com/lriki8
//=============================================================================

/*:ja
 * @plugindesc LN_RoguelikeEngine v0.0.1
 * @author lriki
 *
 * @help test.
 *
 * MIT License
 */
 

 
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./ts/index.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./ts/Common.ts":
/*!**********************!*\
  !*** ./ts/Common.ts ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.Log = exports.assert = void 0;\r\nfunction assert(condition, msg) {\r\n    if (!condition) {\r\n        throw new Error(msg);\r\n    }\r\n}\r\nexports.assert = assert;\r\nvar Log = /** @class */ (function () {\r\n    function Log() {\r\n    }\r\n    Log.d = function (text) {\r\n        console.log(text);\r\n    };\r\n    return Log;\r\n}());\r\nexports.Log = Log;\r\n\n\n//# sourceURL=webpack:///./ts/Common.ts?");

/***/ }),

/***/ "./ts/DataManager.ts":
/*!***************************!*\
  !*** ./ts/DataManager.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar REDataManager_1 = __webpack_require__(/*! ./RE/REDataManager */ \"./ts/RE/REDataManager.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./RE/REGame */ \"./ts/RE/REGame.ts\");\r\nvar REGameManager_1 = __webpack_require__(/*! ./RE/REGameManager */ \"./ts/RE/REGameManager.ts\");\r\nvar _DataManager_loadMapData = DataManager.loadMapData;\r\nDataManager.loadMapData = function (mapId) {\r\n    _DataManager_loadMapData.call(DataManager, mapId);\r\n    var land = REDataManager_1.REDataManager.findLand(mapId);\r\n    if (land) {\r\n        // Land マップである場合、関係するマップデータをすべて読み込む\r\n        REDataManager_1.REDataManager.landMapDataLoading = true;\r\n        var eventTable_filename = \"Map\" + land.eventTableMapId.padZero(3) + \".json\";\r\n        var itemTable_filename = \"Map\" + land.itemTableMapId.padZero(3) + \".json\";\r\n        var enemyTable_filename = \"Map\" + land.enemyTableMapId.padZero(3) + \".json\";\r\n        var trapTable_ilename = \"Map\" + land.trapTableMapId.padZero(3) + \".json\";\r\n        this.loadDataFile(\"RE_dataEventTableMap\", eventTable_filename);\r\n        this.loadDataFile(\"RE_dataItemTableMap\", itemTable_filename);\r\n        this.loadDataFile(\"RE_dataEnemyTableMap\", enemyTable_filename);\r\n        this.loadDataFile(\"RE_dataTrapTableMap\", trapTable_ilename);\r\n    }\r\n    else {\r\n        REGame_1.REGame.map.clear();\r\n        REDataManager_1.REDataManager.landMapDataLoading = false;\r\n    }\r\n};\r\nvar _DataManager_isMapLoaded = DataManager.isMapLoaded;\r\nDataManager.isMapLoaded = function () {\r\n    var result = _DataManager_isMapLoaded.call(DataManager);\r\n    if (result) {\r\n        if (REDataManager_1.REDataManager.landMapDataLoading) {\r\n            return !!window[\"RE_dataEventTableMap\"] &&\r\n                !!window[\"RE_dataItemTableMap\"] &&\r\n                !!window[\"RE_dataEnemyTableMap\"] &&\r\n                !!window[\"RE_dataTrapTableMap\"];\r\n        }\r\n        else {\r\n            return true;\r\n        }\r\n    }\r\n    else {\r\n        return false;\r\n    }\r\n};\r\nvar _DataManager_createGameObjects = DataManager.createGameObjects;\r\nDataManager.createGameObjects = function () {\r\n    _DataManager_createGameObjects.call(DataManager);\r\n    REGameManager_1.REGameManager.createGameObjects();\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/DataManager.ts?");

/***/ }),

/***/ "./ts/Game_Event.ts":
/*!**************************!*\
  !*** ./ts/Game_Event.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar _Game_Event_initMembers = Game_Event.prototype.initMembers;\r\nGame_Event.prototype.initMembers = function () {\r\n    _Game_Event_initMembers.call(this);\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Event.ts?");

/***/ }),

/***/ "./ts/Game_Map.ts":
/*!************************!*\
  !*** ./ts/Game_Map.ts ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar REDataManager_1 = __webpack_require__(/*! ./RE/REDataManager */ \"./ts/RE/REDataManager.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./RE/REGame */ \"./ts/RE/REGame.ts\");\r\nvar REGameManager_1 = __webpack_require__(/*! ./RE/REGameManager */ \"./ts/RE/REGameManager.ts\");\r\nvar _Game_Map_setup = Game_Map.prototype.setup;\r\nGame_Map.prototype.setup = function (mapId) {\r\n    _Game_Map_setup.call(this, mapId);\r\n    // この時点ではまだ Player は locate() されていないので、\r\n    // 位置をとりたければ _newX, _newY を見る必要がある。\r\n    //console.log(\"Game_Map initialized.\", $gamePlayer._newX);\r\n    //console.log($gamePlayer);\r\n    if (REDataManager_1.REDataManager.isLandMap(mapId)) {\r\n        if (1) // TODO: 固定マップの場合\r\n         {\r\n            REGame_1.REGame.map.setupFixedMap(mapId);\r\n        }\r\n        $gamePlayer.hideFollowers();\r\n    }\r\n    /*\r\n    console.log(\"OK\");\r\n    console.log($dataMap.data?.length);\r\n    this.setTileData(0, 0, 0, 1);\r\n    this.setTileData(0, 0, 1, 1);\r\n    this.setTileData(0, 0, 2, 1);\r\n    this.setTileData(0, 0, 3, 1);\r\n    this.setTileData(0, 0, 4, 1);\r\n    this.setTileData(0, 0, 5, 1);\r\n    */\r\n};\r\n/*\r\nGame_Map.prototype.setTileData = function(x: number, y: number, z: number, value: number) : void {\r\nconst width = this.width();\r\nconst height = this.height();\r\nassert(0 <= x && x < width && 0 <= y && y < height);\r\n\r\nconst data = $dataMap.data;\r\nif (data) {\r\n    data[(z * height + y) * width + x] = value;\r\n}\r\n}\r\n*/\r\nvar _Game_Map_update = Game_Map.prototype.update;\r\nGame_Map.prototype.update = function (sceneActive) {\r\n    _Game_Map_update.call(this, sceneActive);\r\n    if (this.isRESystemMap()) {\r\n        REGameManager_1.REGameManager.update();\r\n    }\r\n};\r\nGame_Map.prototype.isRESystemMap = function () {\r\n    return REGame_1.REGame.map.isValid();\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Map.ts?");

/***/ }),

/***/ "./ts/Game_Player.ts":
/*!***************************!*\
  !*** ./ts/Game_Player.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar REGame_1 = __webpack_require__(/*! ./RE/REGame */ \"./ts/RE/REGame.ts\");\r\nvar _Game_Player_initMembers = Game_Player.prototype.initMembers;\r\nGame_Player.prototype.initMembers = function () {\r\n    _Game_Player_initMembers.call(this);\r\n};\r\nvar _Game_Player_performTransfer = Game_Player.prototype.performTransfer;\r\nGame_Player.prototype.performTransfer = function () {\r\n    var oldIsTransferring = this.isTransferring();\r\n    // $gameMap.setup() などはオリジナルの処理の中で行われる\r\n    _Game_Player_performTransfer.call(this);\r\n    // RE Floor への移動\r\n    if (oldIsTransferring && REGame_1.REGame.map.isValid()) {\r\n        var playerEntity = REGame_1.REGame.world.entity(REGame_1.REGame.core.mainPlayerEntiyId);\r\n        if (playerEntity) {\r\n            REGame_1.REGame.world._transfarEntity(playerEntity, REGame_1.REGame.map.floorId(), this.x, this.y);\r\n        }\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Player.ts?");

/***/ }),

/***/ "./ts/PrefabEvent.ts":
/*!***************************!*\
  !*** ./ts/PrefabEvent.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar REVisual_1 = __webpack_require__(/*! ./RE/REVisual */ \"./ts/RE/REVisual.ts\");\r\nvar Game_REPrefabEvent = /** @class */ (function (_super) {\r\n    __extends(Game_REPrefabEvent, _super);\r\n    function Game_REPrefabEvent(mapId, eventId) {\r\n        var _this = _super.call(this, mapId, 1) || this;\r\n        _this._rmmzEventId = eventId;\r\n        _this._spritePrepared = false;\r\n        _this.locate(0, 3); // TODO: test\r\n        return _this;\r\n    }\r\n    Game_REPrefabEvent.prototype.rmmzEventId = function () {\r\n        return this._rmmzEventId;\r\n    };\r\n    Game_REPrefabEvent.prototype.isREPrefab = function () {\r\n        return true;\r\n    };\r\n    Game_REPrefabEvent.prototype.isRESpritePrepared = function () {\r\n        return this._spritePrepared;\r\n    };\r\n    Game_REPrefabEvent.prototype.setSpritePrepared = function (value) {\r\n        this._spritePrepared = true;\r\n    };\r\n    return Game_REPrefabEvent;\r\n}(Game_Event));\r\nGame_CharacterBase.prototype.isREPrefab = function () {\r\n    return false;\r\n};\r\nGame_CharacterBase.prototype.isRESpritePrepared = function () {\r\n    return false;\r\n};\r\nGame_Map.prototype.spawnREEvent = function ( /*eventData: IDataMapEvent*/) {\r\n    var eventId = this._events.length;\r\n    var event = new Game_REPrefabEvent(this._mapId, eventId);\r\n    this._events[eventId] = event;\r\n    return event;\r\n};\r\nGame_Map.prototype.getREPrefabEvents = function () {\r\n    return this.events().filter(function (event) {\r\n        return event.isREPrefab();\r\n    });\r\n};\r\nvar _Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;\r\nSpriteset_Map.prototype.createCharacters = function () {\r\n    this._prefabSpriteIdRE = Sprite._counter + 1;\r\n    console.log(\"this._prefabSpriteIdRE\", this._prefabSpriteIdRE);\r\n    _Spriteset_Map_createCharacters.call(this);\r\n};\r\nvar _Spriteset_Map_update = Spriteset_Map.prototype.update;\r\nSpriteset_Map.prototype.update = function () {\r\n    _Spriteset_Map_update.call(this);\r\n    this.updateREPrefabEvent();\r\n};\r\nSpriteset_Map.prototype.updateREPrefabEvent = function () {\r\n    var _this = this;\r\n    $gameMap.getREPrefabEvents().forEach(function (event) {\r\n        if (!event.isRESpritePrepared()) {\r\n            _this.makeREPrefabEventSprite(event);\r\n        }\r\n    });\r\n};\r\nSpriteset_Map.prototype.makeREPrefabEventSprite = function (event) {\r\n    event.setSpritePrepared(true);\r\n    var sprite = new Sprite_Character(event);\r\n    //sprite.spriteId = this._prefabSpriteIdRE;\r\n    var spriteIndex = this._characterSprites.length;\r\n    this._characterSprites.push(sprite);\r\n    var t = this._tilemap;\r\n    t.addChild(sprite);\r\n    // Visual と Sprite を関連付ける\r\n    var visual = REVisual_1.REVisual.manager.findEntityVisualByRMMZEventId(event.rmmzEventId());\r\n    visual === null || visual === void 0 ? void 0 : visual._setSpriteIndex(spriteIndex);\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/PrefabEvent.ts?");

/***/ }),

/***/ "./ts/RE/MapDataProvidor.ts":
/*!**********************************!*\
  !*** ./ts/RE/MapDataProvidor.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.MapDataProvidor = void 0;\r\nvar Common_1 = __webpack_require__(/*! ../Common */ \"./ts/Common.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\n/**\r\n * Data_Map をラップして、RE モジュールへ Data_Map への書き込み手段を提供する。\r\n *\r\n * RE モジュールからは、壁を壊した時など Block(Tile) 情報が変わった時に、\r\n * このクラスを通して Data_Map.data への書き込みが行われる。\r\n *\r\n * 単なる書き込みの他、ランダムダンジョンでは Block 種別から壁や床のタイル ID を求めたうえで\r\n * Data_Map.data への書き込んだり、オートタイルの解決などを行う。\r\n */\r\nvar MapDataProvidor = /** @class */ (function () {\r\n    function MapDataProvidor() {\r\n    }\r\n    MapDataProvidor.tileId = function (x, y, z) {\r\n        var _a, _b;\r\n        var width = (_a = $dataMap.width) !== null && _a !== void 0 ? _a : 0;\r\n        var height = (_b = $dataMap.width) !== null && _b !== void 0 ? _b : 0;\r\n        Common_1.assert(0 <= x && x < width && 0 <= y && y < height);\r\n        var data = $dataMap.data;\r\n        if (data) {\r\n            return data[(z * height + y) * width + x];\r\n        }\r\n        else {\r\n            return 0;\r\n        }\r\n    };\r\n    MapDataProvidor.tileIds = function (x, y) {\r\n        var list = new Array(REGame_1.REGame.TILE_LAYER_COUNT);\r\n        for (var i = 0; i < REGame_1.REGame.TILE_LAYER_COUNT; i++) {\r\n            list[i] = this.tileId(x, y, i);\r\n        }\r\n        return list;\r\n    };\r\n    MapDataProvidor.setTileId = function (x, y, z, tileId) {\r\n        var _a, _b;\r\n        var width = (_a = $dataMap.width) !== null && _a !== void 0 ? _a : 0;\r\n        var height = (_b = $dataMap.width) !== null && _b !== void 0 ? _b : 0;\r\n        Common_1.assert(0 <= x && x < width && 0 <= y && y < height);\r\n        var data = $dataMap.data;\r\n        if (data) {\r\n            data[(z * height + y) * width + x] = tileId;\r\n        }\r\n    };\r\n    MapDataProvidor.setTileIds = function (x, y, tileIds) {\r\n        for (var i = 0; i < REGame_1.REGame.TILE_LAYER_COUNT; i++) {\r\n            this.setTileId(x, y, i, tileIds[i]);\r\n        }\r\n    };\r\n    MapDataProvidor.onUpdateBlock = function (block) {\r\n        var tileIds = block.tileIds();\r\n        if (tileIds) {\r\n            this.setTileIds(block.x(), block.y(), tileIds);\r\n        }\r\n    };\r\n    return MapDataProvidor;\r\n}());\r\nexports.MapDataProvidor = MapDataProvidor;\r\n\n\n//# sourceURL=webpack:///./ts/RE/MapDataProvidor.ts?");

/***/ }),

/***/ "./ts/RE/RECommand.ts":
/*!****************************!*\
  !*** ./ts/RE/RECommand.ts ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RECommand = exports.REResponse = void 0;\r\nvar REData_1 = __webpack_require__(/*! ./REData */ \"./ts/RE/REData.ts\");\r\n/** RECommand の処理結果 */\r\nvar REResponse;\r\n(function (REResponse) {\r\n    /** 目的の処理を実行し終え、 RECommand は実行済みであることを示します。後続の Behavior に RECommand は通知されません。 */\r\n    REResponse[REResponse[\"Consumed\"] = 0] = \"Consumed\";\r\n    /** RECommand はハンドリングされませんでした。続けて後続の Behavior に RECommand を通知します。 */\r\n    REResponse[REResponse[\"Pass\"] = 1] = \"Pass\";\r\n    //Aborted,\r\n})(REResponse = exports.REResponse || (exports.REResponse = {}));\r\n/** Command 表現及び引数 */\r\nvar RECommand = /** @class */ (function () {\r\n    function RECommand() {\r\n        this._action = REData_1.REData.actions[0];\r\n    }\r\n    RECommand.prototype.setup = function (action, actor, reactor) {\r\n        this._action = action;\r\n        this._actor = actor;\r\n        this._reactor = reactor;\r\n    };\r\n    /** この Command の発生元となった Action */\r\n    RECommand.prototype.action = function () { return this._action; };\r\n    /** Action 側 Entity */\r\n    RECommand.prototype.actor = function () { return this._actor; };\r\n    /** Reaction 側 Entity */\r\n    RECommand.prototype.reactor = function () { return this._reactor; };\r\n    return RECommand;\r\n}());\r\nexports.RECommand = RECommand;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RECommand.ts?");

/***/ }),

/***/ "./ts/RE/RECommandContext.ts":
/*!***********************************!*\
  !*** ./ts/RE/RECommandContext.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RECommandContext = void 0;\r\nvar RECommand_1 = __webpack_require__(/*! ./RECommand */ \"./ts/RE/RECommand.ts\");\r\nvar RECommandContext = /** @class */ (function () {\r\n    function RECommandContext(owner) {\r\n        this._visualAnimationWaiting = false;\r\n        this._recodingCommandList = [];\r\n        this._runningCommandList = [];\r\n        this._messageIndex = 0;\r\n        this._lastResponce = RECommand_1.REResponse.Pass;\r\n        this._owner = owner;\r\n    }\r\n    RECommandContext.prototype.postAction = function (action, actor, reactor, cmd) {\r\n        var _this = this;\r\n        var actualCommand = cmd ? cmd : new RECommand_1.RECommand();\r\n        actualCommand.setup(action, actor, reactor);\r\n        var m1 = function () {\r\n            return actor._sendPreAction(actualCommand);\r\n        };\r\n        this._recodingCommandList.push(m1);\r\n        var m2 = function () {\r\n            if (_this._lastResponce == RECommand_1.REResponse.Pass) // m1 で未処理なら send\r\n                return reactor._sendPreRection(actualCommand);\r\n            else\r\n                return _this._lastResponce;\r\n        };\r\n        this._recodingCommandList.push(m2);\r\n        var m3 = function () {\r\n            if (_this._lastResponce == RECommand_1.REResponse.Pass) // m2 で未処理なら send\r\n                return actor._sendAction(actualCommand);\r\n            else\r\n                return _this._lastResponce;\r\n        };\r\n        this._recodingCommandList.push(m3);\r\n        var m4 = function () {\r\n            if (_this._lastResponce == RECommand_1.REResponse.Pass) // m3 で未処理なら send\r\n                return reactor._sendReaction(actualCommand);\r\n            else\r\n                return _this._lastResponce;\r\n        };\r\n        this._recodingCommandList.push(m4);\r\n    };\r\n    RECommandContext.prototype.openDialog = function (dialogModel) {\r\n        var _this = this;\r\n        var m1 = function () {\r\n            _this._owner._openDialogModel(dialogModel);\r\n            return RECommand_1.REResponse.Consumed;\r\n        };\r\n        this._recodingCommandList.push(m1);\r\n    };\r\n    RECommandContext.prototype.visualAnimationWaiting = function () {\r\n        return this._visualAnimationWaiting;\r\n    };\r\n    RECommandContext.prototype.clearVisualAnimationWaiting = function () {\r\n        this._visualAnimationWaiting = false;\r\n    };\r\n    RECommandContext.prototype.isRunning = function () {\r\n        return this._messageIndex < this._runningCommandList.length;\r\n    };\r\n    RECommandContext.prototype._process = function () {\r\n        if (this.isRunning()) {\r\n            // コマンドリスト実行中\r\n            this._processCommand();\r\n        }\r\n        if (!this.isRunning() && this._recodingCommandList.length > 0) {\r\n            // _runningCommandList は終了したが、_recodingCommandList に次のコマンドチェーンが溜まっていればそれの実行を始める\r\n            this._submit();\r\n        }\r\n        // _runningCommandList にも _recodingCommandList にもコマンドが無ければ false を返して、スケジューリングフェーズを次に進める\r\n        return this.isRunning();\r\n    };\r\n    RECommandContext.prototype._processCommand = function () {\r\n        if (this.isRunning()) {\r\n            var message = this._runningCommandList[this._messageIndex];\r\n            var response = message();\r\n            if (this._owner._getDialogContext()._hasDialogModel()) {\r\n                // もし command の実行で Dialog が表示されたときは index を進めない。\r\n                // Dialog が閉じたときに進める。\r\n            }\r\n            else {\r\n                this._messageIndex++;\r\n            }\r\n        }\r\n    };\r\n    RECommandContext.prototype._submit = function () {\r\n        var _a;\r\n        // swap\r\n        _a = [this._recodingCommandList, this._runningCommandList], this._runningCommandList = _a[0], this._recodingCommandList = _a[1];\r\n        // clear\r\n        this._recodingCommandList.splice(0);\r\n        this._messageIndex = 0;\r\n    };\r\n    return RECommandContext;\r\n}());\r\nexports.RECommandContext = RECommandContext;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RECommandContext.ts?");

/***/ }),

/***/ "./ts/RE/REData.ts":
/*!*************************!*\
  !*** ./ts/RE/REData.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REData = exports.REFloorMapKind = void 0;\r\nvar REFloorMapKind;\r\n(function (REFloorMapKind) {\r\n    REFloorMapKind[REFloorMapKind[\"FixedMap\"] = 0] = \"FixedMap\";\r\n    REFloorMapKind[REFloorMapKind[\"RandomMap\"] = 1] = \"RandomMap\";\r\n})(REFloorMapKind = exports.REFloorMapKind || (exports.REFloorMapKind = {}));\r\nvar REData = /** @class */ (function () {\r\n    function REData() {\r\n    }\r\n    REData.addEntityKind = function (name) {\r\n        var newId = this.entityKinds.length + 1;\r\n        this.entityKinds.push({\r\n            id: newId,\r\n            name: name\r\n        });\r\n        return newId;\r\n    };\r\n    REData.addLand = function (mapId) {\r\n        var newId = this.lands.length + 1;\r\n        this.lands.push({\r\n            id: newId,\r\n            mapId: mapId,\r\n            eventTableMapId: 0,\r\n            itemTableMapId: 0,\r\n            enemyTableMapId: 0,\r\n            trapTableMapId: 0,\r\n            floorIds: [],\r\n        });\r\n        return newId;\r\n    };\r\n    REData.addAction = function (name) {\r\n        var newId = this.actions.length + 1;\r\n        this.actions.push({\r\n            id: newId,\r\n            name: name\r\n        });\r\n        return newId;\r\n    };\r\n    REData.MAX_DUNGEON_FLOORS = 100;\r\n    // Common defineds.\r\n    REData.ActorDefaultFactionId = 1;\r\n    REData.EnemeyDefaultFactionId = 2;\r\n    REData.actors = [];\r\n    REData.entityKinds = [];\r\n    REData.lands = [];\r\n    REData.floors = []; // 1~マップ最大数までは、MapId と一致する。それより後は Land の Floor.\r\n    REData.factions = [];\r\n    REData.actions = [{ id: 0, name: 'null' }];\r\n    REData.sequels = [{ id: 0, name: 'null' }];\r\n    return REData;\r\n}());\r\nexports.REData = REData;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REData.ts?");

/***/ }),

/***/ "./ts/RE/REDataManager.ts":
/*!********************************!*\
  !*** ./ts/RE/REDataManager.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REDataManager = void 0;\r\nvar REData_1 = __webpack_require__(/*! ./REData */ \"./ts/RE/REData.ts\");\r\nvar REDataManager = /** @class */ (function () {\r\n    function REDataManager() {\r\n    }\r\n    REDataManager.loadData = function () {\r\n        var _a, _b, _c, _d, _e;\r\n        REData_1.REData.addEntityKind(\"null\");\r\n        REData_1.REData.WeaponKindId = REData_1.REData.addEntityKind(\"武器\");\r\n        REData_1.REData.ShieldKindId = REData_1.REData.addEntityKind(\"盾\");\r\n        REData_1.REData.ArrowKindId = REData_1.REData.addEntityKind(\"矢\");\r\n        //RE_Data.addEntityKind(\"石\");\r\n        //RE_Data.addEntityKind(\"弾\");\r\n        REData_1.REData.BraceletKindId = REData_1.REData.addEntityKind(\"腕輪\");\r\n        REData_1.REData.FoodKindId = REData_1.REData.addEntityKind(\"食料\");\r\n        REData_1.REData.HerbKindId = REData_1.REData.addEntityKind(\"草\");\r\n        REData_1.REData.ScrollKindId = REData_1.REData.addEntityKind(\"巻物\");\r\n        REData_1.REData.WandKindId = REData_1.REData.addEntityKind(\"杖\");\r\n        REData_1.REData.PotKindId = REData_1.REData.addEntityKind(\"壺\");\r\n        REData_1.REData.DiscountTicketKindId = REData_1.REData.addEntityKind(\"割引券\");\r\n        REData_1.REData.BuildingMaterialKindId = REData_1.REData.addEntityKind(\"材料\");\r\n        REData_1.REData.TrapKindId = REData_1.REData.addEntityKind(\"罠\");\r\n        REData_1.REData.FigurineKindId = REData_1.REData.addEntityKind(\"土偶\");\r\n        REData_1.REData.MonsterKindId = REData_1.REData.addEntityKind(\"モンスター\");\r\n        //REData.addAction();\r\n        // Import Actors\r\n        REData_1.REData.actors = $dataActors.map(function (x) {\r\n            var _a, _b;\r\n            if (x)\r\n                return {\r\n                    id: (_a = x.id) !== null && _a !== void 0 ? _a : 0,\r\n                    name: (_b = x.name) !== null && _b !== void 0 ? _b : \"\",\r\n                };\r\n            else\r\n                return { id: 0, name: \"null\" };\r\n        });\r\n        // Import Lands\r\n        // 最初に Land を作る\r\n        REData_1.REData.addLand(0); // dummy\r\n        for (var i = 0; i < $dataMapInfos.length; i++) {\r\n            var info = $dataMapInfos[i];\r\n            if (info && ((_a = info.name) === null || _a === void 0 ? void 0 : _a.startsWith(\"RELand:\"))) {\r\n                REData_1.REData.addLand(i);\r\n            }\r\n        }\r\n        var _loop_1 = function () {\r\n            var info = $dataMapInfos[i];\r\n            if (info) {\r\n                var land = REData_1.REData.lands.find(function (x) { return info.parentId && x.mapId == info.parentId; });\r\n                if (land) {\r\n                    if ((_b = info.name) === null || _b === void 0 ? void 0 : _b.startsWith(\"Event\")) {\r\n                        land.eventTableMapId = i;\r\n                    }\r\n                    else if ((_c = info.name) === null || _c === void 0 ? void 0 : _c.startsWith(\"Item\")) {\r\n                        land.itemTableMapId = i;\r\n                    }\r\n                    else if ((_d = info.name) === null || _d === void 0 ? void 0 : _d.startsWith(\"Enemy\")) {\r\n                        land.enemyTableMapId = i;\r\n                    }\r\n                    else if ((_e = info.name) === null || _e === void 0 ? void 0 : _e.startsWith(\"Trap\")) {\r\n                        land.trapTableMapId = i;\r\n                    }\r\n                }\r\n            }\r\n        };\r\n        // 次に parent が Land である Map を、データテーブル用のマップとして関連付ける\r\n        for (var i = 0; i < $dataMapInfos.length; i++) {\r\n            _loop_1();\r\n        }\r\n        // Floor 情報を作る\r\n        // ※フロア数を Land マップの width としているが、これは MapInfo から読み取ることはできず、\r\n        //   全マップを一度ロードする必要がある。しかしそうすると処理時間が大きくなってしまう。\r\n        //   ひとまず欠番は多くなるが、最大フロア数でデータを作ってみる。\r\n        {\r\n            // 固定マップ\r\n            REData_1.REData.floors = new Array($dataMapInfos.length + (REData_1.REData.lands.length * REData_1.REData.MAX_DUNGEON_FLOORS));\r\n            for (var i_1 = 0; i_1 < $dataMapInfos.length; i_1++) {\r\n                if (this.isFloorMap(i_1)) {\r\n                    REData_1.REData.floors[i_1] = {\r\n                        id: i_1,\r\n                        mapKind: REData_1.REFloorMapKind.FixedMap,\r\n                    };\r\n                }\r\n                else if (this.isDatabaseMap(i_1)) {\r\n                    this.databaseMapId = i_1;\r\n                }\r\n                else {\r\n                    REData_1.REData.floors[i_1] = undefined;\r\n                }\r\n            }\r\n            // ランダムマップ\r\n            for (var i_2 = 0; i_2 < REData_1.REData.lands.length; i_2++) {\r\n                var beginFloorId = $dataMapInfos.length + (i_2 * REData_1.REData.MAX_DUNGEON_FLOORS);\r\n                REData_1.REData.lands[i_2].floorIds = new Array(REData_1.REData.MAX_DUNGEON_FLOORS);\r\n                for (var iFloor = 0; iFloor < REData_1.REData.MAX_DUNGEON_FLOORS; iFloor++) {\r\n                    var floorId = beginFloorId + iFloor;\r\n                    REData_1.REData.lands[i_2].floorIds[iFloor] = floorId;\r\n                    REData_1.REData.floors[floorId] = {\r\n                        id: floorId,\r\n                        mapKind: REData_1.REFloorMapKind.RandomMap,\r\n                    };\r\n                }\r\n            }\r\n        }\r\n        // Factions\r\n        {\r\n            REData_1.REData.factions = [\r\n                { id: 0, name: '', schedulingOrder: 0 },\r\n                { id: 1, name: 'Friends', schedulingOrder: 1 },\r\n                { id: 2, name: 'Enemy', schedulingOrder: 2 },\r\n            ];\r\n        }\r\n        //console.log(\"lands:\", RE_Data.lands);\r\n    };\r\n    REDataManager.findLand = function (mapId) {\r\n        var land = REData_1.REData.lands.find(function (x) { return x.mapId == mapId; });\r\n        return land;\r\n    };\r\n    REDataManager.isDatabaseMap = function (mapId) {\r\n        var info = $dataMapInfos[mapId];\r\n        if (info && info.name && info.name.startsWith(\"REDatabase\"))\r\n            return true;\r\n        else\r\n            return false;\r\n    };\r\n    REDataManager.isLandMap = function (mapId) {\r\n        var info = $dataMapInfos[mapId];\r\n        if (info && info.name && info.name.startsWith(\"RELand:\"))\r\n            return true;\r\n        else\r\n            return false;\r\n    };\r\n    REDataManager.isFloorMap = function (mapId) {\r\n        var info = $dataMapInfos[mapId];\r\n        if (info && info.name && info.name.startsWith(\"REFloor:\"))\r\n            return true;\r\n        else\r\n            return false;\r\n    };\r\n    REDataManager.dataLandDefinitionMap = function () {\r\n        return this._dataLandDefinitionMap;\r\n    };\r\n    REDataManager.dataEventTableMap = function () {\r\n        return window[\"RE_dataEventTableMap\"];\r\n    };\r\n    REDataManager.dataItemTableMap = function () {\r\n        return window[\"RE_dataItemTableMap\"];\r\n    };\r\n    REDataManager.dataEnemyTableMap = function () {\r\n        return window[\"RE_dataEnemyTableMap\"];\r\n    };\r\n    REDataManager.dataTrapTableMap = function () {\r\n        return window[\"RE_dataTrapTableMap\"];\r\n    };\r\n    REDataManager.databaseMapId = 0;\r\n    REDataManager.landMapDataLoading = false;\r\n    REDataManager._dataLandDefinitionMap = undefined;\r\n    return REDataManager;\r\n}());\r\nexports.REDataManager = REDataManager;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REDataManager.ts?");

/***/ }),

/***/ "./ts/RE/REDialog.ts":
/*!***************************!*\
  !*** ./ts/RE/REDialog.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REDialog = exports.REDialogContext = void 0;\r\nvar Common_1 = __webpack_require__(/*! ts/Common */ \"./ts/Common.ts\");\r\nvar REDialogContext = /** @class */ (function () {\r\n    function REDialogContext(owner, commandContext) {\r\n        this._owner = owner;\r\n        this._commandContext = commandContext;\r\n        this._dialogModel = null;\r\n    }\r\n    REDialogContext.prototype.dialog = function () {\r\n        if (this._dialogModel)\r\n            return this._dialogModel;\r\n        else\r\n            throw new Error(\"_dialogModel\");\r\n    };\r\n    REDialogContext.prototype.closeDialog = function () {\r\n        this._owner._closeDialogModel();\r\n    };\r\n    REDialogContext.prototype._setDialogModel = function (value) {\r\n        this._dialogModel = value;\r\n    };\r\n    REDialogContext.prototype._hasDialogModel = function () {\r\n        return this._dialogModel !== null;\r\n    };\r\n    REDialogContext.prototype._update = function () {\r\n        Common_1.assert(this._dialogModel !== null);\r\n        this._dialogModel.onUpdate(this);\r\n    };\r\n    return REDialogContext;\r\n}());\r\nexports.REDialogContext = REDialogContext;\r\n/**\r\n * GameDialog\r\n *\r\n * Dialog と名前がついているが、必ずしも UI を持つものではない。\r\n * 名前通り、エンドユーザーとの「対話」のためのインターフェイスを実装する。\r\n */\r\nvar REDialog = /** @class */ (function () {\r\n    function REDialog() {\r\n    }\r\n    REDialog.prototype.onUpdate = function (context) { };\r\n    return REDialog;\r\n}());\r\nexports.REDialog = REDialog;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REDialog.ts?");

/***/ }),

/***/ "./ts/RE/REGame.ts":
/*!*************************!*\
  !*** ./ts/RE/REGame.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame = void 0;\r\n/**\r\n * 各 REGame_* インスタンスを保持する。\r\n *\r\n * コアスクリプトの $game* と同じ役割。\r\n */\r\nvar REGame = /** @class */ (function () {\r\n    function REGame() {\r\n    }\r\n    REGame.TILE_LAYER_COUNT = 6;\r\n    REGame.uniqueActorUnits = [];\r\n    return REGame;\r\n}());\r\nexports.REGame = REGame;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame.ts?");

/***/ }),

/***/ "./ts/RE/REGameManager.ts":
/*!********************************!*\
  !*** ./ts/RE/REGameManager.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGameManager = void 0;\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\nvar REGame_EntityFactory_1 = __webpack_require__(/*! ./REGame_EntityFactory */ \"./ts/RE/REGame_EntityFactory.ts\");\r\nvar REGame_Map_1 = __webpack_require__(/*! ./REGame_Map */ \"./ts/RE/REGame_Map.ts\");\r\nvar REGame_World_1 = __webpack_require__(/*! ./REGame_World */ \"./ts/RE/REGame_World.ts\");\r\nvar REGame_Core_1 = __webpack_require__(/*! ./REGame_Core */ \"./ts/RE/REGame_Core.ts\");\r\nvar REData_1 = __webpack_require__(/*! ./REData */ \"./ts/RE/REData.ts\");\r\nvar REScheduler_1 = __webpack_require__(/*! ./REScheduler */ \"./ts/RE/REScheduler.ts\");\r\nvar REGame_Attribute_1 = __webpack_require__(/*! ./REGame_Attribute */ \"./ts/RE/REGame_Attribute.ts\");\r\n/**\r\n */\r\nvar REGameManager = /** @class */ (function () {\r\n    function REGameManager() {\r\n    }\r\n    REGameManager.createGameObjects = function () {\r\n        REGame_1.REGame.scheduler = new REScheduler_1.REScheduler();\r\n        REGame_1.REGame.core = new REGame_Core_1.REGame_Core();\r\n        REGame_1.REGame.world = new REGame_World_1.RE_Game_World();\r\n        REGame_1.REGame.map = new REGame_Map_1.REGame_Map();\r\n        REGame_1.REGame.uniqueActorUnits = [];\r\n        // Create unique units\r\n        REData_1.REData.actors.forEach(function (x) {\r\n            var unit = REGame_EntityFactory_1.REGame_EntityFactory.newActor();\r\n            REGame_1.REGame.uniqueActorUnits.push(unit);\r\n            //const attr = unit.findAttribute(REGame_PositionalAttribute);\r\n            //if (attr) {\r\n            //}\r\n        });\r\n        // 1 番 Actor をデフォルトで操作可能とする\r\n        var firstActor = REGame_1.REGame.uniqueActorUnits[0];\r\n        var unit = firstActor.findAttribute(REGame_Attribute_1.REGame_UnitAttribute);\r\n        if (unit) {\r\n            unit.setManualMovement(true);\r\n        }\r\n        /*\r\n                let a = RE_Game_EntityFactory.newActor();\r\n                let b = a.findAttribute(RE_Game_UnitAttribute);\r\n                let c = a.findAttribute(RE_Game_PositionalAttribute);\r\n                console.log(\"b: \", b);\r\n                console.log(\"c: \", c);\r\n                */\r\n    };\r\n    REGameManager.visualRunning = function () {\r\n        return false;\r\n    };\r\n    REGameManager.update = function () {\r\n        REGame_1.REGame.scheduler.stepSimulation();\r\n    };\r\n    return REGameManager;\r\n}());\r\nexports.REGameManager = REGameManager;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGameManager.ts?");

/***/ }),

/***/ "./ts/RE/REGame_Attribute.ts":
/*!***********************************!*\
  !*** ./ts/RE/REGame_Attribute.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_UnitAttribute = exports.REGame_Attribute = void 0;\r\n/**\r\n * データのみ保持する。\r\n *\r\n * @note 実装は interface ではなく class にしてみる。\r\n * interface だとシリアライズは楽だが、リフレクションが使えない。\r\n */\r\nvar REGame_Attribute = /** @class */ (function () {\r\n    function REGame_Attribute() {\r\n    }\r\n    REGame_Attribute.prototype.data = function () {\r\n        return {};\r\n    };\r\n    return REGame_Attribute;\r\n}());\r\nexports.REGame_Attribute = REGame_Attribute;\r\nvar REGame_UnitAttribute = /** @class */ (function (_super) {\r\n    __extends(REGame_UnitAttribute, _super);\r\n    function REGame_UnitAttribute() {\r\n        var _this = _super !== null && _super.apply(this, arguments) || this;\r\n        _this._data = {\r\n            factionId: 0,\r\n            speedLevel: 0,\r\n            waitTurnCount: 0,\r\n            manualMovement: false,\r\n            actionTokenCount: 0,\r\n        };\r\n        return _this;\r\n    }\r\n    REGame_UnitAttribute.prototype.factionId = function () { return this._data.factionId; };\r\n    REGame_UnitAttribute.prototype.setFactionId = function (value) { this._data.factionId = value; return this; };\r\n    REGame_UnitAttribute.prototype.speedLevel = function () { return this._data.speedLevel; };\r\n    REGame_UnitAttribute.prototype.setSpeedLevel = function (value) { this._data.speedLevel = value; return this; };\r\n    REGame_UnitAttribute.prototype.waitTurnCount = function () { return this._data.waitTurnCount; };\r\n    REGame_UnitAttribute.prototype.setWaitTurnCount = function (value) { this._data.waitTurnCount = value; return this; };\r\n    REGame_UnitAttribute.prototype.manualMovement = function () { return this._data.manualMovement; };\r\n    REGame_UnitAttribute.prototype.setManualMovement = function (value) { this._data.manualMovement = value; return this; };\r\n    REGame_UnitAttribute.prototype.actionTokenCount = function () { return this._data.actionTokenCount; };\r\n    REGame_UnitAttribute.prototype.setActionTokenCount = function (value) { this._data.actionTokenCount = value; return this; };\r\n    REGame_UnitAttribute.prototype.data = function () {\r\n        return this._data;\r\n    };\r\n    return REGame_UnitAttribute;\r\n}(REGame_Attribute));\r\nexports.REGame_UnitAttribute = REGame_UnitAttribute;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_Attribute.ts?");

/***/ }),

/***/ "./ts/RE/REGame_Behavior.ts":
/*!**********************************!*\
  !*** ./ts/RE/REGame_Behavior.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n/**\r\n *\r\n * [2020/9/29] Behavior の代用\r\n * レンサのワナ、吸収の壺、あくまだんしゃく系\r\n *\r\n *\r\n * @note Attribute と Behavior を分ける必要はあるのか？\r\n * やはり移動がイメージしやすいかな。\r\n * Player, Enemy 共に Position は持つが、それをキー入力で更新するのか、AI で更新するのかは異なる。\r\n */\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_Behavior = exports.DecisionPhase = void 0;\r\nvar RECommand_1 = __webpack_require__(/*! ./RECommand */ \"./ts/RE/RECommand.ts\");\r\nvar DecisionPhase;\r\n(function (DecisionPhase) {\r\n    DecisionPhase[DecisionPhase[\"Manual\"] = 0] = \"Manual\";\r\n    DecisionPhase[DecisionPhase[\"AIMinor\"] = 1] = \"AIMinor\";\r\n    DecisionPhase[DecisionPhase[\"AIMajor\"] = 2] = \"AIMajor\";\r\n})(DecisionPhase = exports.DecisionPhase || (exports.DecisionPhase = {}));\r\n// see: 実装FAQ-Command-Behavior.md\r\nvar REGame_Behavior = /** @class */ (function () {\r\n    function REGame_Behavior() {\r\n    }\r\n    // 従来ver は Command 扱いだった。\r\n    // 行動決定に関係する通知は Scheduler から同期的に送られるが、\r\n    // できればこれを RECommandContext.sendCommand みたいに公開したくないので個別定義にしている。\r\n    // また実行内容も onAction などとは少し毛色が違うので、あえて分離してみる。\r\n    REGame_Behavior.prototype.onDecisionPhase = function (context, phase) { return RECommand_1.REResponse.Pass; };\r\n    REGame_Behavior.prototype.onPreAction = function (cmd) { return RECommand_1.REResponse.Pass; };\r\n    REGame_Behavior.prototype.onPreReaction = function (cmd) { return RECommand_1.REResponse.Pass; };\r\n    REGame_Behavior.prototype.onAction = function (cmd) { return RECommand_1.REResponse.Pass; };\r\n    REGame_Behavior.prototype.onRection = function (cmd) { return RECommand_1.REResponse.Pass; };\r\n    return REGame_Behavior;\r\n}());\r\nexports.REGame_Behavior = REGame_Behavior;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_Behavior.ts?");

/***/ }),

/***/ "./ts/RE/REGame_Block.ts":
/*!*******************************!*\
  !*** ./ts/RE/REGame_Block.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_Block = void 0;\r\nvar MapDataProvidor_1 = __webpack_require__(/*! ./MapDataProvidor */ \"./ts/RE/MapDataProvidor.ts\");\r\n/**\r\n * GameBlock\r\n *\r\n * GameBlock 自体は単なる入れ物。\r\n * これは、例えば壁堀りなどで Tile への更新通知を特別扱いしないようにするための対策。\r\n * アクション発動側は、壁堀り属性の付いた「攻撃コマンド」を「GameBlock」へ送信するだけでよい。\r\n * GameBlock 内にいるエンティティに順番にコマンドを送っていき、Wall な Block がいたらそれを取り除いたりする。\r\n *\r\n * 階段、壁、Item などを Block の中へ入れていくイメージ。\r\n *\r\n * Block 内の同一レイヤーには、複数の Entity が同時に存在することがありえる。\r\n * 貫通属性を持ち、複数同時発射されれる Projectile など。（シレン2のかまいたちの矢等）\r\n *\r\n * [2020/9/28-2] 「Block から離れるAction」「Blockに入るAction」を分けて考える？\r\n * ----------\r\n * 再考。Block の Entity 化とは別件なので。\r\n *\r\n * タイガーウッホ系の投擲を考えるときは必須になりそう。これはたんなるBlock 間移動では済まない。\r\n * [Block から離れる] は他と共通でいいが、[Blockへ向かって投げる] は他のひまガッパ系と同様のルーチンを使う。\r\n * またはね返しの盾ではね返せるので、必ず先方Blockに着地できないケースも出てくる。\r\n * 一時的に、いずれの Block にも属していないような状態を考える必要がある。\r\n *\r\n * 2段階にすることのメリットは、状態異常からではなく、別 Entity から Unit へ、行動制限等がかけられる、ということ。\r\n * ステートレスなトラップ、というより拡張的なギミックを作るのに利用できる。\r\n *\r\n * 周囲の Block に存在する Unit を束縛するような土偶とかが考えられるか。\r\n * トラバサミ状態ではなく、Unit は自分から土偶を壊すこともできる。壊した瞬間解放されるが、状態異常ではないので、\r\n * Unit に Behavior を Attach/Detach する必要もない。(相手側に状態を持たせる必要がない)\r\n *\r\n * [2020/9/28] Block も Entity としてみる？\r\n * ----------\r\n * ひとまず \"しない\" 方向で行ってみる。\r\n *\r\n * もともとトラバサミの検討中に出てきたアイデアで、「Block から離れるAction」「Blockに入るAction」を分けて考えようとしていた。\r\n * Block 内の地形、アイテム、ワナEntityを Blockの関係 Entity とすることで Command の送信側としては相手が何かを考えず 「blockへpost」すればいいことにしてみたい。\r\n *\r\n * ただこれを実装するとなると、2つの Action が結果の依存関係を持って連続実行されることになるため、\r\n * 最初の Action の結果を 後続に通知する必要がある。\r\n * 今は Command 単位ではその仕組みがあるが、さらに Action 単位でも持たせる必要があり、複雑になる。\r\n *\r\n * Note:\r\n * もしこの仕組みで行く場合、Block は例えば「Block に入る Action」によって送信されてくる onPreReaction, onReaction を、\r\n * \"send\" で関係 Entity に橋渡しする必要がある。\"post\" だと Action4Command の実行順のつじつまが合わなくなるのでNG。\r\n *\r\n * ### 何か拡張 Action を作るときは、Block が Entity になっていた方が便利か？\r\n *\r\n * Unit を捕まえた後投げるような、シレン2のタイガーウッホ系を考えてみる。\r\n * 特技によって Unit を任意の Block に「落とす」Action が必要になってくるが、この時の reactor を検索する処理が、Enemyの Behavior 側に必要となる。\r\n * Behavior 側に定型的な処理がたくさん書かれることになるので、Block に対して postAction 出来ればかなり楽なのだが…。\r\n *\r\n * ただこれは、「reactor が何かは考えずにとりあえず Block に対して post したい」ケースがほとんどなので、\r\n * reactor を指定しない postActionToBlock とかを作ってもいいかもしれない。\r\n *\r\n *\r\n * [2020/9/6] Layer\r\n * ----------\r\n * - アイテムとキャラクターは同じマスの上に乗ることができる。\r\n * - キャラクターがすり抜け状態であれば、壁Entityと同じマスに乗ることができる。\r\n * - アイテム・ワナ・階段は同じマスの上に乗ることはできない。\r\n * - キャラクター・土偶は同じマスに乗ることはできない。\r\n * - アイテムや階段は壁に埋まった状態で存在できる。（埋蔵金・黄金の階段）\r\n * 単純に BlockOccupierAttribute で他 Entity を侵入できないようにするだけでは足りない。グループ化の仕組みが必要。\r\n * また攻撃 Action などは基本的に、Block 内に複数の Entity がある場合は「上」から処理していく。\r\n * 例えば、アイアンハンマーを装備して、ワナの上にいるモンスターに攻撃すると、ワナは壊れずモンスターにダメージが行く。\r\n * 単純に Entity のリストを持っているだけだと、並べ替えなどを考慮しなければならなくなる。\r\n * これらをグループ化するために、Layer という仕組みを使ってみる。\r\n *\r\n * - 主に SafetyArea においてマップ移動や通行禁止の Event を、\"すり抜け\" 属性 ON で置けるようにするため、ひとつの Layer には複数の Entity が入れる。\r\n *\r\n * [2020/9/6] 壁も Entity にしたほうがいいの？\r\n * ----------\r\n * しておいた方がいろいろ拡張しやすい。\r\n * 例えば自動修復する壁とかも作れる。\r\n * elona みたいに固定マップの壊した壁が一定時間すると復活するようなものを実装するには必要になる。\r\n *\r\n */\r\nvar REGame_Block = /** @class */ (function () {\r\n    function REGame_Block(map, x, y) {\r\n        this._x = x;\r\n        this._y = y;\r\n    }\r\n    REGame_Block.prototype.x = function () {\r\n        return this._x;\r\n    };\r\n    REGame_Block.prototype.y = function () {\r\n        return this._y;\r\n    };\r\n    REGame_Block.prototype.tileIds = function () {\r\n        return this._tileIds;\r\n    };\r\n    REGame_Block.prototype.setTileIds = function (tileIds) {\r\n        this._tileIds = tileIds;\r\n        MapDataProvidor_1.MapDataProvidor.onUpdateBlock(this);\r\n    };\r\n    return REGame_Block;\r\n}());\r\nexports.REGame_Block = REGame_Block;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_Block.ts?");

/***/ }),

/***/ "./ts/RE/REGame_Core.ts":
/*!******************************!*\
  !*** ./ts/RE/REGame_Core.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_Core = void 0;\r\nvar REGame_Core = /** @class */ (function () {\r\n    function REGame_Core() {\r\n        // experimental: \"場所移動\" 等の基準となる、メインプレイヤーの Entity.\r\n        // もし仲間がいるような場合、MainPlayerEntity がマップ移動したらついてきたりする。\r\n        this.mainPlayerEntiyId = 0;\r\n    }\r\n    return REGame_Core;\r\n}());\r\nexports.REGame_Core = REGame_Core;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_Core.ts?");

/***/ }),

/***/ "./ts/RE/REGame_Entity.ts":
/*!********************************!*\
  !*** ./ts/RE/REGame_Entity.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_Entity = void 0;\r\nvar RECommand_1 = __webpack_require__(/*! ./RECommand */ \"./ts/RE/RECommand.ts\");\r\nvar BlockLayer;\r\n(function (BlockLayer) {\r\n    /** 地形情報。壁・水路など。 */\r\n    BlockLayer[BlockLayer[\"Terrain\"] = 0] = \"Terrain\";\r\n    /** 地表に落ちているもの。アイテム・ワナ・階段など。 */\r\n    BlockLayer[BlockLayer[\"Surface\"] = 1] = \"Surface\";\r\n    /** ユニット。PC・仲間・モンスター・土偶など。 */\r\n    BlockLayer[BlockLayer[\"Unit\"] = 2] = \"Unit\";\r\n    /** 発射物。矢、魔法弾、吹き飛ばされたUnitなど。 */\r\n    BlockLayer[BlockLayer[\"Projectile\"] = 3] = \"Projectile\";\r\n})(BlockLayer || (BlockLayer = {}));\r\n/**\r\n * システムを構成する最も原始的な要素。\r\n * プレイヤー、仲間、モンスター、アイテム、ワナ、地形、飛翔体（矢、魔法弾）などの、状態をもちえるすべての要素のベースクラス。\r\n *\r\n * 複数の Attribute や Behavior をアタッチすることで、動作を定義していく。\r\n *\r\n * Entity のライフサイクル\r\n * ----------\r\n * - インスタンスの作成は newEntity() で行う。\r\n *   - すべての Entity は必ず World に存在することになる。\r\n * - 破棄は destroy()。 ※直ちにインスタンスが削除されるのではなく、削除マークが付けられ、後で削除される。\r\n *\r\n * @note\r\n * BlockLayer は種別のような他の情報から求めるべきかもしれないが、Entity によっては固定されることは無い。\r\n * - アイテム変化するモンスターは自身の種別を変更することになるが、それだと BlockLayer を変更することと変わらない。\r\n * - アイテムとして持っている土偶を立てたときは、振舞いは Item から Unit に変わる。これも結局状態変更することと変わらない。\r\n */\r\nvar REGame_Entity = /** @class */ (function () {\r\n    function REGame_Entity() {\r\n        this.attrbutes = [];\r\n        this._behaviors = [];\r\n        this._id = 0;\r\n        this._destroyed = false;\r\n        // HC3 で作ってた CommonAttribute はこっちに持ってきた。\r\n        // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。\r\n        // Attribute よりはこっちに置いた方がいいだろう。\r\n        this._displayName = '';\r\n        this._iconName = '';\r\n        this._blockLayer = BlockLayer.Unit;\r\n        // HC3 までは PositionalAttribute に持たせていたが、こっちに持ってきた。\r\n        // お店のセキュリティシステムなど、これらを使わない Entity もあるのだが、\r\n        // ほとんどの Entity が持つことになるパラメータなので、Attribute にするとコードが複雑になりすぎる。\r\n        this.floorId = 0; /**< Entity が存在しているフロア。0 は無効値 & 異常値。直接変更禁止。transfarMap を使うこと */\r\n        this.x = 0; /**< 論理 X 座標 */\r\n        this.y = 0; /**< 論理 Y 座標 */\r\n        this._eventData = undefined;\r\n        // TODO: Test\r\n        this._eventData = {\r\n            id: 0,\r\n            name: \"dynamc event\",\r\n            note: \"\",\r\n            pages: [\r\n                {\r\n                    conditions: {\r\n                        actorId: 1,\r\n                        actorValid: false,\r\n                        itemId: 1,\r\n                        itemValid: false,\r\n                        selfSwitchCh: \"A\",\r\n                        selfSwitchValid: false,\r\n                        switch1Id: 1,\r\n                        switch1Valid: false,\r\n                        switch2Id: 1,\r\n                        switch2Valid: false,\r\n                        variableId: 1,\r\n                        variableValid: false,\r\n                        variableValue: 1,\r\n                    },\r\n                    directionFix: false,\r\n                    image: {\r\n                        tileId: 0,\r\n                        characterName: \"Actor1\",\r\n                        direction: 2,\r\n                        pattern: 0,\r\n                        characterIndex: 1\r\n                    },\r\n                    list: [],\r\n                    moveFrequency: 3,\r\n                    moveRoute: {\r\n                        list: [],\r\n                        repeat: true,\r\n                        skippable: false,\r\n                        wait: false,\r\n                    },\r\n                    moveSpeed: 3,\r\n                    moveType: 0,\r\n                    priorityType: 1,\r\n                    stepAnime: false,\r\n                    through: false,\r\n                    trigger: 0,\r\n                    walkAnime: true,\r\n                }\r\n            ],\r\n            x: 0,\r\n            y: 0,\r\n        };\r\n    }\r\n    //static newEntity(): REGame_Entity {\r\n    //    const e = new REGame_Entity();\r\n    //    REGame.world._addEntity(e);\r\n    //    return e;\r\n    //}\r\n    REGame_Entity.prototype.behaviors = function () {\r\n        return this._behaviors;\r\n    };\r\n    REGame_Entity.prototype.addBehavior = function (value) {\r\n        this._behaviors.push(value);\r\n    };\r\n    /**\r\n     * 動的に生成した Game_Event が参照する EventData.\r\n     * 頻繁にアクセスされる可能性があるので Attribute ではなくこちらに持たせている。\r\n     */\r\n    REGame_Entity.prototype.eventData = function () {\r\n        return this._eventData;\r\n    };\r\n    REGame_Entity.prototype.isDestroyed = function () {\r\n        return this._destroyed;\r\n    };\r\n    REGame_Entity.prototype.destroy = function () {\r\n        this._destroyed = true;\r\n    };\r\n    REGame_Entity.prototype.findAttribute = function (ctor) {\r\n        for (var i = 0; i < this.attrbutes.length; i++) {\r\n            var a = this.attrbutes[i];\r\n            if (a instanceof ctor) {\r\n                return a;\r\n            }\r\n        }\r\n        return undefined;\r\n        /*\r\n        const r = this.attrbutes.find(x => x.constructor.toString() === Text.name);\r\n        if (r)\r\n            return r as unknown as T;\r\n        else\r\n            return undefined;\r\n            */\r\n    };\r\n    REGame_Entity.prototype._callBehaviorIterationHelper = function (func) {\r\n        for (var i = 0; i < this._behaviors.length; i++) {\r\n            var r = func(this._behaviors[i]); //this._behaviors[i].onPreAction(cmd);\r\n            if (r != RECommand_1.REResponse.Pass) {\r\n                return r;\r\n            }\r\n        }\r\n        return RECommand_1.REResponse.Pass;\r\n    };\r\n    REGame_Entity.prototype._callDecisionPhase = function (context, phase) {\r\n        return this._callBehaviorIterationHelper(function (b) { return b.onDecisionPhase(context, phase); });\r\n    };\r\n    REGame_Entity.prototype._sendPreAction = function (cmd) {\r\n        return this._callBehaviorIterationHelper(function (b) { return b.onPreAction(cmd); });\r\n    };\r\n    REGame_Entity.prototype._sendPreRection = function (cmd) {\r\n        return this._callBehaviorIterationHelper(function (b) { return b.onPreReaction(cmd); });\r\n    };\r\n    REGame_Entity.prototype._sendAction = function (cmd) {\r\n        return this._callBehaviorIterationHelper(function (b) { return b.onPreAction(cmd); });\r\n    };\r\n    REGame_Entity.prototype._sendReaction = function (cmd) {\r\n        return this._callBehaviorIterationHelper(function (b) { return b.onPreReaction(cmd); });\r\n    };\r\n    return REGame_Entity;\r\n}());\r\nexports.REGame_Entity = REGame_Entity;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_Entity.ts?");

/***/ }),

/***/ "./ts/RE/REGame_EntityFactory.ts":
/*!***************************************!*\
  !*** ./ts/RE/REGame_EntityFactory.ts ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_EntityFactory = void 0;\r\nvar REGame_Attribute_1 = __webpack_require__(/*! ./REGame_Attribute */ \"./ts/RE/REGame_Attribute.ts\");\r\nvar REData_1 = __webpack_require__(/*! ./REData */ \"./ts/RE/REData.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\nvar REDecisionBehavior_1 = __webpack_require__(/*! ../behaviors/REDecisionBehavior */ \"./ts/behaviors/REDecisionBehavior.ts\");\r\nvar REGame_EntityFactory = /** @class */ (function () {\r\n    function REGame_EntityFactory() {\r\n    }\r\n    REGame_EntityFactory.newActor = function () {\r\n        var e = REGame_1.REGame.world.spawnEntity(1, 0, 0); //REGame_Entity.newEntity();\r\n        e.attrbutes = [\r\n            new REGame_Attribute_1.REGame_UnitAttribute()\r\n                .setFactionId(REData_1.REData.ActorDefaultFactionId),\r\n        ];\r\n        e.addBehavior(new REDecisionBehavior_1.REGame_DecisionBehavior());\r\n        return e;\r\n    };\r\n    return REGame_EntityFactory;\r\n}());\r\nexports.REGame_EntityFactory = REGame_EntityFactory;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_EntityFactory.ts?");

/***/ }),

/***/ "./ts/RE/REGame_Map.ts":
/*!*****************************!*\
  !*** ./ts/RE/REGame_Map.ts ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_Map = void 0;\r\nvar Common_1 = __webpack_require__(/*! ../Common */ \"./ts/Common.ts\");\r\nvar MapDataProvidor_1 = __webpack_require__(/*! ./MapDataProvidor */ \"./ts/RE/MapDataProvidor.ts\");\r\nvar REGame_Block_1 = __webpack_require__(/*! ./REGame_Block */ \"./ts/RE/REGame_Block.ts\");\r\nvar REData_1 = __webpack_require__(/*! ./REData */ \"./ts/RE/REData.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\n/**\r\n * アクティブなマップオブジェクト。インスタンスは1つだけ存在する。\r\n *\r\n * Map 遷移が行われたとき、World に存在する Entity のうち、\r\n * この Map 上にいることになっている Entity は、自動的に追加される。\r\n *\r\n * このクラスのメソッドによる登場や移動は Sequel を伴わない。そういったものは Command 処理側で対応すること。\r\n */\r\nvar REGame_Map = /** @class */ (function () {\r\n    function REGame_Map() {\r\n        this._floorId = 0;\r\n        this._width = 0;\r\n        this._height = 0;\r\n        this._blocks = [];\r\n        this._entityIds = []; // マップ内に登場している Entity\r\n        this._borderWall = new REGame_Block_1.REGame_Block(this, -1, -1); // マップ有効範囲外に存在するダミー要素\r\n    }\r\n    REGame_Map.prototype.setupEmptyMap = function (floorId, width, height) {\r\n        this._floorId = floorId;\r\n        this._width = width;\r\n        this._height = height;\r\n        var count = this._width * this._height;\r\n        this._blocks = new Array(count);\r\n        for (var i = 0; i < count; i++) {\r\n            this._blocks[i] = new REGame_Block_1.REGame_Block(this, i % this._width, i / this._width);\r\n        }\r\n    };\r\n    /**\r\n     * 現在の $dataMap の情報をもとに、固定マップを作る。\r\n     */\r\n    REGame_Map.prototype.setupFixedMap = function (floorId) {\r\n        var _a, _b;\r\n        this.setupEmptyMap(floorId, (_a = $dataMap.width) !== null && _a !== void 0 ? _a : 1, (_b = $dataMap.height) !== null && _b !== void 0 ? _b : 1);\r\n        this._blocks.forEach(function (block) {\r\n            block.setTileIds(MapDataProvidor_1.MapDataProvidor.tileIds(block.x(), block.y()));\r\n        });\r\n    };\r\n    REGame_Map.prototype.clear = function () {\r\n        this._width = 0;\r\n        this._height = 0;\r\n        this._blocks = [];\r\n    };\r\n    REGame_Map.prototype.isValid = function () {\r\n        return this._width > 0;\r\n    };\r\n    REGame_Map.prototype.floorId = function () {\r\n        return this._floorId;\r\n    };\r\n    REGame_Map.prototype.width = function () {\r\n        return this._width;\r\n    };\r\n    REGame_Map.prototype.height = function () {\r\n        return this._height;\r\n    };\r\n    REGame_Map.prototype.isFixedMap = function () {\r\n        var _a;\r\n        return ((_a = REData_1.REData.floors[this._floorId]) === null || _a === void 0 ? void 0 : _a.mapKind) == REData_1.REFloorMapKind.FixedMap;\r\n    };\r\n    REGame_Map.prototype.isRandomMap = function () {\r\n        var _a;\r\n        return ((_a = REData_1.REData.floors[this._floorId]) === null || _a === void 0 ? void 0 : _a.mapKind) == REData_1.REFloorMapKind.RandomMap;\r\n    };\r\n    REGame_Map.prototype.block = function (x, y) {\r\n        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {\r\n            return this._borderWall;\r\n        }\r\n        else {\r\n            return this._blocks[y * this._width + x];\r\n        }\r\n    };\r\n    REGame_Map.prototype.entities = function () {\r\n        return this._entityIds\r\n            .map(function (id) { return REGame_1.REGame.world.entity(id); })\r\n            .filter(function (e) { return e != undefined; });\r\n    };\r\n    REGame_Map.prototype._addEntity = function (entity) {\r\n        Common_1.assert(entity.floorId != this.floorId());\r\n        this._entityIds.push(entity._id);\r\n        entity.floorId = this.floorId();\r\n        if (this.signalEntityEntered) {\r\n            this.signalEntityEntered(entity);\r\n        }\r\n    };\r\n    REGame_Map.prototype._removeEntity = function (entity) {\r\n        Common_1.assert(entity.floorId == this.floorId());\r\n        this._entityIds = this._entityIds.filter(function (x) { return x != entity._id; });\r\n        entity.floorId = 0;\r\n        if (this.signalEntityLeaved) {\r\n            this.signalEntityLeaved(entity);\r\n        }\r\n    };\r\n    // TODO: Fuzzy とかで、x, y に配置できなければ周辺を探すとか\r\n    REGame_Map.prototype._locateEntityFuzzy = function (entity, x, y) {\r\n        Common_1.assert(entity.floorId == this.floorId());\r\n        entity.x = x;\r\n        entity.y = y;\r\n    };\r\n    return REGame_Map;\r\n}());\r\nexports.REGame_Map = REGame_Map;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_Map.ts?");

/***/ }),

/***/ "./ts/RE/REGame_World.ts":
/*!*******************************!*\
  !*** ./ts/RE/REGame_World.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_World = void 0;\r\nvar REGame_Entity_1 = __webpack_require__(/*! ./REGame_Entity */ \"./ts/RE/REGame_Entity.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\n/**\r\n * 1ゲーム内に1インスタンス存在する。\r\n */\r\nvar RE_Game_World = /** @class */ (function () {\r\n    function RE_Game_World() {\r\n        this._entities = [];\r\n    }\r\n    RE_Game_World.prototype.entity = function (id) {\r\n        return this._entities[id];\r\n    };\r\n    RE_Game_World.prototype.spawnEntity = function (floorId, x, y) {\r\n        var entity = new REGame_Entity_1.REGame_Entity();\r\n        //entity.floorId = floorId;\r\n        //entity.x = x;\r\n        //entity.y = y;\r\n        this._registerEntity(entity);\r\n        this._transfarEntity(entity, floorId, x, y);\r\n        return entity;\r\n    };\r\n    RE_Game_World.prototype._registerEntity = function (entity) {\r\n        // TODO: 空き場所を愚直に線形探索。\r\n        // 大量の Entity を扱うようになったら最適化する。\r\n        var index = this._entities.findIndex(function (x) { return x == undefined; });\r\n        if (index < 0) {\r\n            entity._id = this._entities.length;\r\n            this._entities.push(entity);\r\n        }\r\n        else {\r\n            entity._id = index;\r\n            this._entities[index] = entity;\r\n        }\r\n    };\r\n    /**\r\n     * Entity を指定した位置に移動する。\r\n     * - 現在表示中のマップへ移動した場合、そのマップへ登場する。\r\n     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。\r\n     * - 表示中以外のマップ(固定マップ)へ移動した場合、\r\n     *   - 移動先の同一 BlockLayer に別の Entity がいた場合、移動は失敗する。\r\n     * - 表示中以外のマップ(ランダムマップ)へ移動した場合、\r\n     *   - 座標は常に 0,0 へ移動し、成功する。ほかの Entity とは重なるが、ランダムマップ生成時に再配置される。\r\n     */\r\n    RE_Game_World.prototype._transfarEntity = function (entity, floorId, x, y) {\r\n        if (REGame_1.REGame.map.floorId() != floorId && REGame_1.REGame.map.floorId() == entity.floorId) {\r\n            // 現在マップからの離脱\r\n            REGame_1.REGame.map._removeEntity(entity);\r\n        }\r\n        if (REGame_1.REGame.map.floorId() == floorId) {\r\n            x;\r\n            // 現在表示中のマップへの移動\r\n            REGame_1.REGame.map._addEntity(entity);\r\n            REGame_1.REGame.map._locateEntityFuzzy(entity, x, y);\r\n            return true; // TODO: 移動できないときの処理\r\n        }\r\n        else {\r\n            entity.floorId = floorId;\r\n            entity.x = y;\r\n            entity.x = y;\r\n            return true;\r\n        }\r\n    };\r\n    RE_Game_World.prototype.update = function () {\r\n        this._removeDestroyesEntities();\r\n    };\r\n    RE_Game_World.prototype._removeDestroyesEntities = function () {\r\n        for (var i = 0; i < this._entities.length; i++) {\r\n            var entity = this._entities[i];\r\n            if (entity && entity.isDestroyed()) {\r\n                this._entities[i] = undefined;\r\n            }\r\n        }\r\n    };\r\n    return RE_Game_World;\r\n}());\r\nexports.RE_Game_World = RE_Game_World;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REGame_World.ts?");

/***/ }),

/***/ "./ts/RE/REScheduler.ts":
/*!******************************!*\
  !*** ./ts/RE/REScheduler.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REScheduler = void 0;\r\nvar Common_1 = __webpack_require__(/*! ../Common */ \"./ts/Common.ts\");\r\nvar RECommandContext_1 = __webpack_require__(/*! ./RECommandContext */ \"./ts/RE/RECommandContext.ts\");\r\nvar REData_1 = __webpack_require__(/*! ./REData */ \"./ts/RE/REData.ts\");\r\nvar REDialog_1 = __webpack_require__(/*! ./REDialog */ \"./ts/RE/REDialog.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\nvar REGameManager_1 = __webpack_require__(/*! ./REGameManager */ \"./ts/RE/REGameManager.ts\");\r\nvar REGame_Attribute_1 = __webpack_require__(/*! ./REGame_Attribute */ \"./ts/RE/REGame_Attribute.ts\");\r\nvar REGame_Behavior_1 = __webpack_require__(/*! ./REGame_Behavior */ \"./ts/RE/REGame_Behavior.ts\");\r\n;\r\n;\r\nvar SchedulerPhase;\r\n(function (SchedulerPhase) {\r\n    SchedulerPhase[SchedulerPhase[\"TurnStarting\"] = 0] = \"TurnStarting\";\r\n    SchedulerPhase[SchedulerPhase[\"RunStarting\"] = 1] = \"RunStarting\";\r\n    /**\r\n     * マニュアル入力\r\n     * Dialog が close すると、次の Phase に進む。\r\n     */\r\n    SchedulerPhase[SchedulerPhase[\"ManualAction\"] = 2] = \"ManualAction\";\r\n    /**\r\n     * AI 行動フェーズ 1\r\n     */\r\n    SchedulerPhase[SchedulerPhase[\"AIMinorAction\"] = 3] = \"AIMinorAction\";\r\n    /**\r\n     * AI 行動フェーズ 2\r\n     */\r\n    SchedulerPhase[SchedulerPhase[\"AIMajorAction\"] = 4] = \"AIMajorAction\";\r\n    SchedulerPhase[SchedulerPhase[\"RunEnding\"] = 5] = \"RunEnding\";\r\n    SchedulerPhase[SchedulerPhase[\"TurnEnding\"] = 6] = \"TurnEnding\";\r\n})(SchedulerPhase || (SchedulerPhase = {}));\r\n/**\r\n * see Scheduler.md\r\n */\r\nvar REScheduler = /** @class */ (function () {\r\n    function REScheduler() {\r\n        this._phase = SchedulerPhase.TurnStarting;\r\n        this._units = [];\r\n        this._runs = [];\r\n        this._currentRun = 0;\r\n        this._currentUnit = 0;\r\n        this._commandContext = new RECommandContext_1.RECommandContext(this);\r\n        this._dialogContext = new REDialog_1.REDialogContext(this, this._commandContext);\r\n    }\r\n    REScheduler.prototype.stepSimulation = function () {\r\n        while (true) {\r\n            // Sequel 終了待ち\r\n            if (this._commandContext.visualAnimationWaiting()) {\r\n                if (REGameManager_1.REGameManager.visualRunning()) {\r\n                    // Sequel 実行中\r\n                    break;\r\n                }\r\n                else {\r\n                    // Sequel 終了\r\n                    this._commandContext.clearVisualAnimationWaiting();\r\n                }\r\n            }\r\n            // 現在のコマンドリストの実行は終了しているが、Visual 側がアニメーション中であれば完了を待ってから次の Unit の行動を始めたい\r\n            if (!this._commandContext.isRunning() && REGameManager_1.REGameManager.visualRunning()) {\r\n                break;\r\n            }\r\n            // Dialog の処理はイベント実行よりも優先する。\r\n            // 行商人の処理など。\r\n            if (this._dialogContext._hasDialogModel()) {\r\n                this._dialogContext._update();\r\n                // Dialog 表示中は後続コマンドを実行しない\r\n                break;\r\n            }\r\n            if (this._commandContext._process()) {\r\n                // コマンド実行中\r\n            }\r\n            else {\r\n                //sweepCollapseList();\r\n                //m_commandContext->beginCommandChain();\r\n                this.stepSimulationInternal();\r\n            }\r\n        }\r\n    };\r\n    REScheduler.prototype.stepSimulationInternal = function () {\r\n        switch (this._phase) {\r\n            case SchedulerPhase.TurnStarting:\r\n                this.update_TurnStarting();\r\n                break;\r\n            case SchedulerPhase.RunStarting:\r\n                this.update_RunStarting();\r\n                break;\r\n            case SchedulerPhase.ManualAction:\r\n                this.update_ManualAction();\r\n                break;\r\n            case SchedulerPhase.AIMinorAction:\r\n                this.update_AIMinorAction();\r\n                break;\r\n            case SchedulerPhase.AIMajorAction:\r\n                this.update_AIMajorAction();\r\n                break;\r\n            case SchedulerPhase.RunEnding:\r\n                this.update_RunEnding();\r\n                break;\r\n            case SchedulerPhase.TurnEnding:\r\n                this.update_TurnEnding();\r\n                break;\r\n            default:\r\n                Common_1.assert(0);\r\n                break;\r\n        }\r\n    };\r\n    REScheduler.prototype.update_TurnStarting = function () {\r\n        Common_1.Log.d(\"s update_TurnStarting\");\r\n        this.buildOrderTable();\r\n        // ターン開始時の各 unit の設定更新\r\n        this._units.forEach(function (unit) {\r\n            var attr = unit.attr;\r\n            // 鈍足状態の対応。待ちターン数を更新\r\n            if (attr.speedLevel() < 0) {\r\n                if (attr.waitTurnCount() == 0) {\r\n                    attr.setWaitTurnCount(1);\r\n                }\r\n                else {\r\n                    attr.setWaitTurnCount(attr.waitTurnCount() - 1);\r\n                }\r\n            }\r\n            // 行動トークンを更新\r\n            if (attr.waitTurnCount() == 0) {\r\n                // 行動トークンを、速度の分だけ配る。鈍足状態でも 1 つ配る。\r\n                // リセットではなく追加である点に注意。借金している場合に備える。\r\n                attr.setActionTokenCount(attr.actionTokenCount() + Math.max(1, attr.speedLevel()));\r\n            }\r\n            else {\r\n                // 鈍足状態。このターンは行動トークンをもらえない。\r\n            }\r\n        });\r\n        this._currentRun = 0;\r\n        this._phase = SchedulerPhase.RunStarting;\r\n        Common_1.Log.d(\"e update_TurnStarting\");\r\n    };\r\n    REScheduler.prototype.update_RunStarting = function () {\r\n        Common_1.Log.d(\"s update_RunStarting\");\r\n        this._currentUnit = 0;\r\n        this._phase = SchedulerPhase.ManualAction;\r\n        Common_1.Log.d(\"e update_RunStarting\");\r\n    };\r\n    REScheduler.prototype.update_ManualAction = function () {\r\n        Common_1.Log.d(\"update_ManualAction started.\");\r\n        var run = this._runs[this._currentRun];\r\n        var action = run.actions[this._currentUnit];\r\n        var unit = action.unit;\r\n        if (unit.unit) {\r\n            if (unit.attr.manualMovement()) {\r\n                unit.unit._callDecisionPhase(this._commandContext, REGame_Behavior_1.DecisionPhase.Manual);\r\n            }\r\n        }\r\n        // 全 Unit 分処理を終えたら次の Phase へ\r\n        this._currentUnit++;\r\n        if (this._currentUnit >= run.actions.length) {\r\n            this._currentUnit = 0;\r\n            this._phase = SchedulerPhase.AIMinorAction;\r\n            Common_1.Log.d(\"update_ManualAction finish.\");\r\n        }\r\n        else {\r\n            Common_1.Log.d(\"update_ManualAction continued.\");\r\n        }\r\n    };\r\n    REScheduler.prototype.update_AIMinorAction = function () {\r\n        var run = this._runs[this._currentRun];\r\n        var action = run.actions[this._currentUnit];\r\n        var unit = action.unit;\r\n        if (unit.unit) {\r\n            if (!unit.attr.manualMovement()) {\r\n                // TODO:\r\n                Common_1.assert(0);\r\n            }\r\n        }\r\n        // 全 Unit 分処理を終えたら次の Phase へ\r\n        this._currentUnit++;\r\n        if (this._currentUnit >= run.actions.length) {\r\n            this._currentUnit = 0;\r\n            this._phase = SchedulerPhase.AIMajorAction;\r\n        }\r\n    };\r\n    REScheduler.prototype.update_AIMajorAction = function () {\r\n        var run = this._runs[this._currentRun];\r\n        var action = run.actions[this._currentUnit];\r\n        var unit = action.unit;\r\n        if (unit.unit) {\r\n            if (!unit.attr.manualMovement()) {\r\n                // TODO:\r\n                Common_1.assert(0);\r\n            }\r\n        }\r\n        // 全 Unit 分処理を終えたら次の Phase へ\r\n        this._currentUnit++;\r\n        if (this._currentUnit >= run.actions.length) {\r\n            this._currentUnit = 0;\r\n            this._phase = SchedulerPhase.RunEnding;\r\n        }\r\n    };\r\n    REScheduler.prototype.update_RunEnding = function () {\r\n        this._currentRun++;\r\n        if (this._currentRun >= this._runs.length) {\r\n            this._phase = SchedulerPhase.TurnEnding;\r\n        }\r\n        else {\r\n            this._phase = SchedulerPhase.RunStarting;\r\n        }\r\n    };\r\n    REScheduler.prototype.update_TurnEnding = function () {\r\n        // ターン終了時に、Animation が残っていればすべて掃き出す\r\n        //executeAnimationQueue(true);\r\n        this._phase = SchedulerPhase.TurnStarting;\r\n    };\r\n    REScheduler.prototype.buildOrderTable = function () {\r\n        var _this = this;\r\n        this._units = [];\r\n        var runCount = 0;\r\n        // 行動できるすべての entity を集める\r\n        {\r\n            REGame_1.REGame.map.entities().forEach(function (entity) {\r\n                var attr = entity.findAttribute(REGame_Attribute_1.REGame_UnitAttribute);\r\n                if (attr) {\r\n                    var actionCount = attr.speedLevel() + 1;\r\n                    // 鈍足状態の対応\r\n                    if (actionCount <= 0) {\r\n                        actionCount = 1;\r\n                    }\r\n                    _this._units.push({\r\n                        unit: entity,\r\n                        attr: attr,\r\n                        actionCount: actionCount\r\n                    });\r\n                    // このターン内の最大行動回数 (phase 数) を調べる\r\n                    runCount = Math.max(runCount, actionCount);\r\n                }\r\n            });\r\n        }\r\n        // 勢力順にソート\r\n        this._units = this._units.sort(function (a, b) { return REData_1.REData.factions[a.attr.factionId()].schedulingOrder - REData_1.REData.factions[b.attr.factionId()].schedulingOrder; });\r\n        this._runs = new Array(runCount);\r\n        for (var i = 0; i < this._runs.length; i++) {\r\n            this._runs[i] = { actions: [] };\r\n        }\r\n        // Faction にかかわらず、マニュアル操作 Unit は最優先で追加する\r\n        this._units.forEach(function (unit) {\r\n            if (unit.attr.manualMovement()) {\r\n                for (var i = 0; i < unit.actionCount; i++) {\r\n                    _this._runs[i].actions.push({\r\n                        unit: unit,\r\n                        actionCount: 1,\r\n                    });\r\n                }\r\n            }\r\n        });\r\n        // 次は倍速以上の NPC. これは前から詰めていく。\r\n        this._units.forEach(function (unit) {\r\n            if (!unit.attr.manualMovement() && unit.actionCount >= 2) {\r\n                for (var i = 0; i < unit.actionCount; i++) {\r\n                    _this._runs[i].actions.push({\r\n                        unit: unit,\r\n                        actionCount: 1,\r\n                    });\r\n                }\r\n            }\r\n        });\r\n        // 最後に等速以下の NPC を後ろから詰めていく\r\n        this._units.forEach(function (unit) {\r\n            if (!unit.attr.manualMovement() && unit.actionCount < 2) {\r\n                for (var i = 0; i < unit.actionCount; i++) {\r\n                    _this._runs[_this._runs.length - 1 - i].actions.push({\r\n                        unit: unit,\r\n                        actionCount: 1,\r\n                    });\r\n                }\r\n            }\r\n        });\r\n        //console.log(\"unis:\", this._units);\r\n        //console.log(\"runs:\", this._runs);\r\n        // TODO: Merge\r\n    };\r\n    REScheduler.prototype._openDialogModel = function (value) {\r\n        this._dialogContext._setDialogModel(value);\r\n        if (this.signalDialogOpend) {\r\n            this.signalDialogOpend(this._dialogContext);\r\n        }\r\n    };\r\n    REScheduler.prototype._closeDialogModel = function () {\r\n        this._dialogContext._setDialogModel(null);\r\n        if (this.signalDialogClosed) {\r\n            this.signalDialogClosed(this._dialogContext);\r\n        }\r\n    };\r\n    REScheduler.prototype._getDialogContext = function () {\r\n        return this._dialogContext;\r\n    };\r\n    return REScheduler;\r\n}());\r\nexports.REScheduler = REScheduler;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REScheduler.ts?");

/***/ }),

/***/ "./ts/RE/REVisual.ts":
/*!***************************!*\
  !*** ./ts/RE/REVisual.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REVisual = void 0;\r\nvar REVisual_Manager_1 = __webpack_require__(/*! ./REVisual_Manager */ \"./ts/RE/REVisual_Manager.ts\");\r\n/**\r\n */\r\nvar REVisual = /** @class */ (function () {\r\n    function REVisual() {\r\n    }\r\n    REVisual.initialize = function () {\r\n        this.manager = new REVisual_Manager_1.REVisual_Manager();\r\n    };\r\n    REVisual.finalize = function () {\r\n        if (this.manager) {\r\n            this.manager._finalize();\r\n        }\r\n    };\r\n    return REVisual;\r\n}());\r\nexports.REVisual = REVisual;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REVisual.ts?");

/***/ }),

/***/ "./ts/RE/REVisual_Entity.ts":
/*!**********************************!*\
  !*** ./ts/RE/REVisual_Entity.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REVisual_Entity = void 0;\r\n/**\r\n */\r\nvar REVisual_Entity = /** @class */ (function () {\r\n    function REVisual_Entity(entity, rmmzEventId) {\r\n        this._entity = entity;\r\n        this._rmmzEventId = rmmzEventId;\r\n        this._spriteIndex = -1;\r\n    }\r\n    REVisual_Entity.prototype.entity = function () {\r\n        return this._entity;\r\n    };\r\n    REVisual_Entity.prototype.rmmzEventId = function () {\r\n        return this._rmmzEventId;\r\n    };\r\n    REVisual_Entity.prototype._setSpriteIndex = function (value) {\r\n        this._spriteIndex = value;\r\n    };\r\n    REVisual_Entity.prototype._update = function () {\r\n    };\r\n    return REVisual_Entity;\r\n}());\r\nexports.REVisual_Entity = REVisual_Entity;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REVisual_Entity.ts?");

/***/ }),

/***/ "./ts/RE/REVisual_Manager.ts":
/*!***********************************!*\
  !*** ./ts/RE/REVisual_Manager.ts ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REVisual_Manager = void 0;\r\nvar Common_1 = __webpack_require__(/*! ts/Common */ \"./ts/Common.ts\");\r\nvar REManualDecisionDialog_1 = __webpack_require__(/*! ts/dialogs/REManualDecisionDialog */ \"./ts/dialogs/REManualDecisionDialog.ts\");\r\nvar REManualActionDialogVisual_1 = __webpack_require__(/*! ts/visual/REManualActionDialogVisual */ \"./ts/visual/REManualActionDialogVisual.ts\");\r\nvar REGame_1 = __webpack_require__(/*! ./REGame */ \"./ts/RE/REGame.ts\");\r\nvar REVisual_Entity_1 = __webpack_require__(/*! ./REVisual_Entity */ \"./ts/RE/REVisual_Entity.ts\");\r\n/**\r\n */\r\nvar REVisual_Manager = /** @class */ (function () {\r\n    function REVisual_Manager() {\r\n        var _this = this;\r\n        this._visualEntities = [];\r\n        this._dialogVisual = null;\r\n        REGame_1.REGame.map.signalEntityEntered = function (x) { return _this.handlleEntityEnteredMap(x); };\r\n        REGame_1.REGame.map.signalEntityLeaved = function (x) { return _this.handlleEntityLeavedMap(x); };\r\n        REGame_1.REGame.scheduler.signalDialogOpend = function (x) { return _this.handleDialogOpend(x); };\r\n        REGame_1.REGame.scheduler.signalDialogClosed = function () { return _this.handleDialogClosed(); };\r\n        // init 時点の map 上にいる Entity から Visual を作る\r\n        REGame_1.REGame.map.entities().forEach(function (x) {\r\n            _this.createVisual(x);\r\n        });\r\n    }\r\n    REVisual_Manager.prototype.findEntityVisualByRMMZEventId = function (rmmzEventId) {\r\n        return this._visualEntities.find(function (x) { return x.rmmzEventId() == rmmzEventId; });\r\n    };\r\n    REVisual_Manager.prototype.visualRunning = function () {\r\n        return false;\r\n    };\r\n    REVisual_Manager.prototype.update = function () {\r\n        this._visualEntities.forEach(function (x) {\r\n            x._update();\r\n        });\r\n        if (this._dialogVisual !== null) {\r\n            this._dialogVisual.onUpdate(REGame_1.REGame.scheduler._getDialogContext());\r\n        }\r\n    };\r\n    REVisual_Manager.prototype._finalize = function () {\r\n        REGame_1.REGame.map.signalEntityEntered = undefined;\r\n        REGame_1.REGame.map.signalEntityLeaved = undefined;\r\n        REGame_1.REGame.scheduler.signalDialogOpend = undefined;\r\n        REGame_1.REGame.scheduler.signalDialogClosed = undefined;\r\n    };\r\n    REVisual_Manager.prototype.handlleEntityEnteredMap = function (entity) {\r\n        this.createVisual(entity);\r\n    };\r\n    REVisual_Manager.prototype.handlleEntityLeavedMap = function (entity) {\r\n        var index = this._visualEntities.findIndex(function (x) { return x.entity() == entity; });\r\n        if (index >= 0) {\r\n            this._visualEntities.splice(index, 1);\r\n        }\r\n    };\r\n    REVisual_Manager.prototype.handleDialogOpend = function (context) {\r\n        Common_1.assert(!this._dialogVisual);\r\n        var d = context.dialog();\r\n        if (d instanceof REManualDecisionDialog_1.REManualActionDialog)\r\n            this._dialogVisual = new REManualActionDialogVisual_1.REManualActionDialogVisual();\r\n        // AI 用の Dialog を開いた時など、UI を伴わないものもある\r\n    };\r\n    REVisual_Manager.prototype.handleDialogClosed = function () {\r\n        if (this._dialogVisual) {\r\n            this._dialogVisual.onClose();\r\n            this._dialogVisual = null;\r\n        }\r\n    };\r\n    REVisual_Manager.prototype.createVisual = function (entity) {\r\n        var event = $gameMap.spawnREEvent();\r\n        var visual = new REVisual_Entity_1.REVisual_Entity(entity, event.rmmzEventId());\r\n        this._visualEntities.push(visual);\r\n    };\r\n    return REVisual_Manager;\r\n}());\r\nexports.REVisual_Manager = REVisual_Manager;\r\n\n\n//# sourceURL=webpack:///./ts/RE/REVisual_Manager.ts?");

/***/ }),

/***/ "./ts/Scene_Boot.ts":
/*!**************************!*\
  !*** ./ts/Scene_Boot.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar REDataManager_1 = __webpack_require__(/*! ./RE/REDataManager */ \"./ts/RE/REDataManager.ts\");\r\nvar _Scene_Boot_isReady = Scene_Boot.prototype.isReady;\r\nScene_Boot.prototype.isReady = function () {\r\n    // ベースの isReady の中から onDatabaseLoaded が呼び出される\r\n    var result = _Scene_Boot_isReady.call(this);\r\n    if (!window[\"RE_databaseMap\"]) {\r\n        return false;\r\n    }\r\n    else {\r\n        // Database マップの読み込みが完了\r\n        return result;\r\n    }\r\n};\r\nvar _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;\r\nScene_Boot.prototype.onDatabaseLoaded = function () {\r\n    _Scene_Boot_onDatabaseLoaded.call(this);\r\n    REDataManager_1.REDataManager.loadData();\r\n    // Database マップ読み込み開始\r\n    var filename = \"Map\" + REDataManager_1.REDataManager.databaseMapId.padZero(3) + \".json\";\r\n    DataManager.loadDataFile(\"RE_databaseMap\", filename);\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Scene_Boot.ts?");

/***/ }),

/***/ "./ts/Scene_Map.ts":
/*!*************************!*\
  !*** ./ts/Scene_Map.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar REDataManager_1 = __webpack_require__(/*! ./RE/REDataManager */ \"./ts/RE/REDataManager.ts\");\r\nvar REVisual_1 = __webpack_require__(/*! ./RE/REVisual */ \"./ts/RE/REVisual.ts\");\r\nvar _Scene_Map_isReady = Scene_Map.prototype.isReady;\r\nScene_Map.prototype.isReady = function () {\r\n    if (REDataManager_1.REDataManager.landMapDataLoading) {\r\n        if (DataManager.isMapLoaded()) {\r\n            // Land 定義マップの読み込みがすべて終わった\r\n            // 元の遷移先マップをバックアップ (Land 定義マップとして使う)\r\n            REDataManager_1.REDataManager._dataLandDefinitionMap = $dataMap;\r\n            // 固定マップを読み込む\r\n            DataManager.loadMapData(1); // TODO: id\r\n            // Reload. まだ読み込み完了していない扱いにする\r\n            return false;\r\n        }\r\n        else {\r\n            // Land 定義マップの読み込み中\r\n            return false;\r\n        }\r\n    }\r\n    else {\r\n        return _Scene_Map_isReady.call(this);\r\n    }\r\n};\r\nvar _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;\r\nScene_Map.prototype.onMapLoaded = function () {\r\n    return _Scene_Map_onMapLoaded.call(this);\r\n};\r\nvar _Scene_Map_start = Scene_Map.prototype.start;\r\nScene_Map.prototype.start = function () {\r\n    _Scene_Map_start.call(this);\r\n    REVisual_1.REVisual.initialize();\r\n};\r\n/*\r\nvar _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;\r\nScene_Map.prototype.createDisplayObjects = function() {\r\n    _Scene_Map_createDisplayObjects.call(this);\r\n\r\n    REVisual.initialize();\r\n};\r\n*/\r\nvar _Scene_Map_terminate = Scene_Map.prototype.terminate;\r\nScene_Battle.prototype.terminate = function () {\r\n    _Scene_Map_terminate.call(this);\r\n    REVisual_1.REVisual.finalize();\r\n};\r\nvar _Scene_Map_update = Scene_Map.prototype.update;\r\nScene_Map.prototype.update = function () {\r\n    _Scene_Map_update.call(this);\r\n    REVisual_1.REVisual.manager.update();\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Scene_Map.ts?");

/***/ }),

/***/ "./ts/behaviors/REDecisionBehavior.ts":
/*!********************************************!*\
  !*** ./ts/behaviors/REDecisionBehavior.ts ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REGame_DecisionBehavior = void 0;\r\nvar REManualDecisionDialog_1 = __webpack_require__(/*! ts/dialogs/REManualDecisionDialog */ \"./ts/dialogs/REManualDecisionDialog.ts\");\r\nvar RECommand_1 = __webpack_require__(/*! ../RE/RECommand */ \"./ts/RE/RECommand.ts\");\r\nvar REGame_Behavior_1 = __webpack_require__(/*! ../RE/REGame_Behavior */ \"./ts/RE/REGame_Behavior.ts\");\r\nvar REGame_DecisionBehavior = /** @class */ (function (_super) {\r\n    __extends(REGame_DecisionBehavior, _super);\r\n    function REGame_DecisionBehavior() {\r\n        return _super !== null && _super.apply(this, arguments) || this;\r\n    }\r\n    REGame_DecisionBehavior.prototype.onDecisionPhase = function (context, phase) {\r\n        console.log(\"onDecisionPhase\");\r\n        context.openDialog(new REManualDecisionDialog_1.REManualActionDialog());\r\n        return RECommand_1.REResponse.Consumed;\r\n    };\r\n    return REGame_DecisionBehavior;\r\n}(REGame_Behavior_1.REGame_Behavior));\r\nexports.REGame_DecisionBehavior = REGame_DecisionBehavior;\r\n\n\n//# sourceURL=webpack:///./ts/behaviors/REDecisionBehavior.ts?");

/***/ }),

/***/ "./ts/dialogs/REManualDecisionDialog.ts":
/*!**********************************************!*\
  !*** ./ts/dialogs/REManualDecisionDialog.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REManualActionDialog = void 0;\r\nvar REDialog_1 = __webpack_require__(/*! ../RE/REDialog */ \"./ts/RE/REDialog.ts\");\r\nvar REManualActionDialog = /** @class */ (function (_super) {\r\n    __extends(REManualActionDialog, _super);\r\n    function REManualActionDialog() {\r\n        return _super !== null && _super.apply(this, arguments) || this;\r\n    }\r\n    REManualActionDialog.prototype.onUpdate = function (context) {\r\n        //console.log(\"REManualActionDialog.update\");\r\n    };\r\n    return REManualActionDialog;\r\n}(REDialog_1.REDialog));\r\nexports.REManualActionDialog = REManualActionDialog;\r\n\n\n//# sourceURL=webpack:///./ts/dialogs/REManualDecisionDialog.ts?");

/***/ }),

/***/ "./ts/index.ts":
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n__webpack_require__(/*! ./PrefabEvent */ \"./ts/PrefabEvent.ts\");\r\n__webpack_require__(/*! ./DataManager */ \"./ts/DataManager.ts\");\r\n__webpack_require__(/*! ./Game_Player */ \"./ts/Game_Player.ts\");\r\n__webpack_require__(/*! ./Game_Event */ \"./ts/Game_Event.ts\");\r\n__webpack_require__(/*! ./Game_Map */ \"./ts/Game_Map.ts\");\r\n__webpack_require__(/*! ./RE/REData */ \"./ts/RE/REData.ts\");\r\n__webpack_require__(/*! ./RE/REDataManager */ \"./ts/RE/REDataManager.ts\");\r\n__webpack_require__(/*! ./RE/REGame_Entity */ \"./ts/RE/REGame_Entity.ts\");\r\n__webpack_require__(/*! ./RE/REGame_EntityFactory */ \"./ts/RE/REGame_EntityFactory.ts\");\r\n__webpack_require__(/*! ./RE/REGame_Map */ \"./ts/RE/REGame_Map.ts\");\r\n__webpack_require__(/*! ./RE/REGame_Core */ \"./ts/RE/REGame_Core.ts\");\r\n__webpack_require__(/*! ./Scene_Boot */ \"./ts/Scene_Boot.ts\");\r\n__webpack_require__(/*! ./Scene_Map */ \"./ts/Scene_Map.ts\");\r\n\n\n//# sourceURL=webpack:///./ts/index.ts?");

/***/ }),

/***/ "./ts/visual/REDialogVisual.ts":
/*!*************************************!*\
  !*** ./ts/visual/REDialogVisual.ts ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REDialogVisual = void 0;\r\nvar REDialogVisual = /** @class */ (function () {\r\n    function REDialogVisual() {\r\n    }\r\n    REDialogVisual.prototype.onUpdate = function (context) {\r\n    };\r\n    REDialogVisual.prototype.onClose = function () {\r\n    };\r\n    return REDialogVisual;\r\n}());\r\nexports.REDialogVisual = REDialogVisual;\r\n\n\n//# sourceURL=webpack:///./ts/visual/REDialogVisual.ts?");

/***/ }),

/***/ "./ts/visual/REManualActionDialogVisual.ts":
/*!*************************************************!*\
  !*** ./ts/visual/REManualActionDialogVisual.ts ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.REManualActionDialogVisual = void 0;\r\nvar REDialogVisual_1 = __webpack_require__(/*! ./REDialogVisual */ \"./ts/visual/REDialogVisual.ts\");\r\nvar REManualActionDialogVisual = /** @class */ (function (_super) {\r\n    __extends(REManualActionDialogVisual, _super);\r\n    function REManualActionDialogVisual() {\r\n        return _super !== null && _super.apply(this, arguments) || this;\r\n    }\r\n    REManualActionDialogVisual.prototype.onUpdate = function (context) {\r\n        console.log(\"REManualActionDialogVisual.update\");\r\n    };\r\n    return REManualActionDialogVisual;\r\n}(REDialogVisual_1.REDialogVisual));\r\nexports.REManualActionDialogVisual = REManualActionDialogVisual;\r\n\n\n//# sourceURL=webpack:///./ts/visual/REManualActionDialogVisual.ts?");

/***/ })

/******/ });