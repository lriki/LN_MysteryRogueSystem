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
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.assert = void 0;\r\nfunction assert(condition, msg) {\r\n    if (!condition) {\r\n        throw new Error(msg);\r\n    }\r\n}\r\nexports.assert = assert;\r\n\n\n//# sourceURL=webpack:///./ts/Common.ts?");

/***/ }),

/***/ "./ts/DataManager.ts":
/*!***************************!*\
  !*** ./ts/DataManager.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar RE_DataManager_1 = __webpack_require__(/*! ./RE/RE_DataManager */ \"./ts/RE/RE_DataManager.ts\");\r\nvar RE_Game_1 = __webpack_require__(/*! ./RE/RE_Game */ \"./ts/RE/RE_Game.ts\");\r\nvar _DataManager_loadMapData = DataManager.loadMapData;\r\nDataManager.loadMapData = function (mapId) {\r\n    _DataManager_loadMapData.call(DataManager, mapId);\r\n    var land = RE_DataManager_1.RE_DataManager.findLand(mapId);\r\n    if (land) {\r\n        // Land マップである場合、関係するマップデータをすべて読み込む\r\n        RE_DataManager_1.RE_DataManager.landMapDataLoading = true;\r\n        var eventTable_filename = \"Map\" + land.eventTableMapId.padZero(3) + \".json\";\r\n        var itemTable_filename = \"Map\" + land.itemTableMapId.padZero(3) + \".json\";\r\n        var enemyTable_filename = \"Map\" + land.enemyTableMapId.padZero(3) + \".json\";\r\n        var trapTable_ilename = \"Map\" + land.trapTableMapId.padZero(3) + \".json\";\r\n        this.loadDataFile(\"RE_dataEventTableMap\", eventTable_filename);\r\n        this.loadDataFile(\"RE_dataItemTableMap\", itemTable_filename);\r\n        this.loadDataFile(\"RE_dataEnemyTableMap\", enemyTable_filename);\r\n        this.loadDataFile(\"RE_dataTrapTableMap\", trapTable_ilename);\r\n    }\r\n    else {\r\n        RE_DataManager_1.RE_DataManager.landMapDataLoading = false;\r\n    }\r\n};\r\nvar _DataManager_isMapLoaded = DataManager.isMapLoaded;\r\nDataManager.isMapLoaded = function () {\r\n    var result = _DataManager_isMapLoaded.call(DataManager);\r\n    if (result) {\r\n        if (RE_DataManager_1.RE_DataManager.landMapDataLoading) {\r\n            return !!window[\"RE_dataEventTableMap\"] &&\r\n                !!window[\"RE_dataItemTableMap\"] &&\r\n                !!window[\"RE_dataEnemyTableMap\"] &&\r\n                !!window[\"RE_dataTrapTableMap\"];\r\n        }\r\n        else {\r\n            return true;\r\n        }\r\n    }\r\n    else {\r\n        return false;\r\n    }\r\n};\r\nvar _DataManager_createGameObjects = DataManager.createGameObjects;\r\nDataManager.createGameObjects = function () {\r\n    _DataManager_createGameObjects.call(DataManager);\r\n    RE_Game_1.RE_Game.createGameObjects();\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/DataManager.ts?");

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
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar Common_1 = __webpack_require__(/*! ./Common */ \"./ts/Common.ts\");\r\nvar _Game_Map_setup = Game_Map.prototype.setup;\r\nGame_Map.prototype.setup = function (mapId) {\r\n    _Game_Map_setup.call(this, mapId);\r\n    // この時点ではまだ Player は locate() されていないので、\r\n    // 位置をとりたければ _newX, _newY を見る必要がある。\r\n    //console.log(\"Game_Map initialized.\", $gamePlayer._newX);\r\n    //console.log($gamePlayer);\r\n    console.log(\"OK\");\r\n    this.setTileData(0, 0, 0, 1);\r\n};\r\nGame_Map.prototype.setTileData = function (x, y, z, value) {\r\n    var width = this.width();\r\n    var height = this.height();\r\n    Common_1.assert(0 <= x && x < width && 0 <= y && y < height);\r\n    var data = $dataMap.data;\r\n    if (data) {\r\n        data[(z * height + y) * width + x] = value;\r\n    }\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Map.ts?");

/***/ }),

/***/ "./ts/Game_Player.ts":
/*!***************************!*\
  !*** ./ts/Game_Player.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar _Game_Player_initMembers = Game_Player.prototype.initMembers;\r\nGame_Player.prototype.initMembers = function () {\r\n    _Game_Player_initMembers.call(this);\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Player.ts?");

/***/ }),

/***/ "./ts/RE/RE_Data.ts":
/*!**************************!*\
  !*** ./ts/RE/RE_Data.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Data.ts?");

/***/ }),

/***/ "./ts/RE/RE_DataManager.ts":
/*!*********************************!*\
  !*** ./ts/RE/RE_DataManager.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_DataManager = exports.RE_Data = void 0;\r\nvar RE_Data = /** @class */ (function () {\r\n    function RE_Data() {\r\n    }\r\n    RE_Data.addEntityKind = function (name) {\r\n        var newId = this.entityKinds.length + 1;\r\n        this.entityKinds.push({\r\n            id: newId,\r\n            name: name\r\n        });\r\n        return newId;\r\n    };\r\n    RE_Data.addLand = function (mapId) {\r\n        var newId = this.lands.length + 1;\r\n        this.lands.push({\r\n            id: newId,\r\n            mapId: mapId,\r\n            eventTableMapId: 0,\r\n            itemTableMapId: 0,\r\n            enemyTableMapId: 0,\r\n            trapTableMapId: 0,\r\n        });\r\n        return newId;\r\n    };\r\n    RE_Data.actors = [];\r\n    RE_Data.entityKinds = [];\r\n    RE_Data.lands = [];\r\n    RE_Data.floors = [];\r\n    return RE_Data;\r\n}());\r\nexports.RE_Data = RE_Data;\r\nvar RE_DataManager = /** @class */ (function () {\r\n    function RE_DataManager() {\r\n    }\r\n    RE_DataManager.loadData = function () {\r\n        var _a, _b, _c, _d, _e;\r\n        RE_Data.addEntityKind(\"null\");\r\n        RE_Data.WeaponKindId = RE_Data.addEntityKind(\"武器\");\r\n        RE_Data.ShieldKindId = RE_Data.addEntityKind(\"盾\");\r\n        RE_Data.ArrowKindId = RE_Data.addEntityKind(\"矢\");\r\n        //RE_Data.addEntityKind(\"石\");\r\n        //RE_Data.addEntityKind(\"弾\");\r\n        RE_Data.BraceletKindId = RE_Data.addEntityKind(\"腕輪\");\r\n        RE_Data.FoodKindId = RE_Data.addEntityKind(\"食料\");\r\n        RE_Data.HerbKindId = RE_Data.addEntityKind(\"草\");\r\n        RE_Data.ScrollKindId = RE_Data.addEntityKind(\"巻物\");\r\n        RE_Data.WandKindId = RE_Data.addEntityKind(\"杖\");\r\n        RE_Data.PotKindId = RE_Data.addEntityKind(\"壺\");\r\n        RE_Data.DiscountTicketKindId = RE_Data.addEntityKind(\"割引券\");\r\n        RE_Data.BuildingMaterialKindId = RE_Data.addEntityKind(\"材料\");\r\n        RE_Data.TrapKindId = RE_Data.addEntityKind(\"罠\");\r\n        RE_Data.FigurineKindId = RE_Data.addEntityKind(\"土偶\");\r\n        RE_Data.MonsterKindId = RE_Data.addEntityKind(\"モンスター\");\r\n        // Import Actors\r\n        RE_Data.actors = $dataActors.map(function (x) {\r\n            var _a, _b;\r\n            if (x)\r\n                return {\r\n                    id: (_a = x.id) !== null && _a !== void 0 ? _a : 0,\r\n                    name: (_b = x.name) !== null && _b !== void 0 ? _b : \"\",\r\n                };\r\n            else\r\n                return { id: 0, name: \"null\" };\r\n        });\r\n        // Import Lands\r\n        // 最初に Land を作る\r\n        RE_Data.addLand(0); // dummy\r\n        for (var i = 0; i < $dataMapInfos.length; i++) {\r\n            var info = $dataMapInfos[i];\r\n            if (info && ((_a = info.name) === null || _a === void 0 ? void 0 : _a.startsWith(\"RELand:\"))) {\r\n                RE_Data.addLand(i);\r\n            }\r\n        }\r\n        var _loop_1 = function () {\r\n            var info = $dataMapInfos[i];\r\n            if (info) {\r\n                var land = RE_Data.lands.find(function (x) { return info.parentId && x.mapId == info.parentId; });\r\n                if (land) {\r\n                    if ((_b = info.name) === null || _b === void 0 ? void 0 : _b.startsWith(\"Event\")) {\r\n                        land.eventTableMapId = i;\r\n                    }\r\n                    else if ((_c = info.name) === null || _c === void 0 ? void 0 : _c.startsWith(\"Item\")) {\r\n                        land.itemTableMapId = i;\r\n                    }\r\n                    else if ((_d = info.name) === null || _d === void 0 ? void 0 : _d.startsWith(\"Enemy\")) {\r\n                        land.enemyTableMapId = i;\r\n                    }\r\n                    else if ((_e = info.name) === null || _e === void 0 ? void 0 : _e.startsWith(\"Trap\")) {\r\n                        land.trapTableMapId = i;\r\n                    }\r\n                }\r\n            }\r\n        };\r\n        // 次に parent が Land である Map から Floor 情報を作る\r\n        for (var i = 0; i < $dataMapInfos.length; i++) {\r\n            _loop_1();\r\n        }\r\n        //console.log(\"lands:\", RE_Data.lands);\r\n    };\r\n    RE_DataManager.findLand = function (mapId) {\r\n        var land = RE_Data.lands.find(function (x) { return x.mapId == mapId; });\r\n        return land;\r\n    };\r\n    RE_DataManager.isLandMap = function (mapId) {\r\n        var info = $dataMapInfos[mapId];\r\n        if (info && info.name && info.name.startsWith(\"RELand:\"))\r\n            return true;\r\n        else\r\n            return false;\r\n    };\r\n    RE_DataManager.dataLandDefinitionMap = function () {\r\n        return this._dataLandDefinitionMap;\r\n    };\r\n    RE_DataManager.dataEventTableMap = function () {\r\n        return window[\"RE_dataEventTableMap\"];\r\n    };\r\n    RE_DataManager.dataItemTableMap = function () {\r\n        return window[\"RE_dataItemTableMap\"];\r\n    };\r\n    RE_DataManager.dataEnemyTableMap = function () {\r\n        return window[\"RE_dataEnemyTableMap\"];\r\n    };\r\n    RE_DataManager.dataTrapTableMap = function () {\r\n        return window[\"RE_dataTrapTableMap\"];\r\n    };\r\n    RE_DataManager.landMapDataLoading = false;\r\n    RE_DataManager._dataLandDefinitionMap = undefined;\r\n    return RE_DataManager;\r\n}());\r\nexports.RE_DataManager = RE_DataManager;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_DataManager.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game.ts":
/*!**************************!*\
  !*** ./ts/RE/RE_Game.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game = void 0;\r\nvar RE_Game_Map_1 = __webpack_require__(/*! ./RE_Game_Map */ \"./ts/RE/RE_Game_Map.ts\");\r\nvar RE_Game_EntityFactory_1 = __webpack_require__(/*! ./RE_Game_EntityFactory */ \"./ts/RE/RE_Game_EntityFactory.ts\");\r\nvar RE_DataManager_1 = __webpack_require__(/*! ./RE_DataManager */ \"./ts/RE/RE_DataManager.ts\");\r\nvar RE_Game_World_1 = __webpack_require__(/*! ./RE_Game_World */ \"./ts/RE/RE_Game_World.ts\");\r\nvar RE_Game = /** @class */ (function () {\r\n    function RE_Game() {\r\n    }\r\n    RE_Game.createGameObjects = function () {\r\n        var _this = this;\r\n        this.world = new RE_Game_World_1.RE_Game_World();\r\n        this.map = new RE_Game_Map_1.RE_Game_Map();\r\n        // Create unique units\r\n        RE_DataManager_1.RE_Data.actors.forEach(function (x) {\r\n            var unit = RE_Game_EntityFactory_1.RE_Game_EntityFactory.newActor();\r\n            _this.actorUnits.push(unit);\r\n        });\r\n        /*\r\n                let a = RE_Game_EntityFactory.newActor();\r\n                let b = a.findAttribute(RE_Game_UnitAttribute);\r\n                let c = a.findAttribute(RE_Game_PositionalAttribute);\r\n                console.log(\"b: \", b);\r\n                console.log(\"c: \", c);\r\n                */\r\n    };\r\n    RE_Game.actorUnits = [];\r\n    return RE_Game;\r\n}());\r\nexports.RE_Game = RE_Game;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game_Attribute.ts":
/*!************************************!*\
  !*** ./ts/RE/RE_Game_Attribute.ts ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar __extends = (this && this.__extends) || (function () {\r\n    var extendStatics = function (d, b) {\r\n        extendStatics = Object.setPrototypeOf ||\r\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\r\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\r\n        return extendStatics(d, b);\r\n    };\r\n    return function (d, b) {\r\n        extendStatics(d, b);\r\n        function __() { this.constructor = d; }\r\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\r\n    };\r\n})();\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_UnitAttribute = exports.RE_Game_PositionalAttribute = exports.RE_Game_Attribute = void 0;\r\n/**\r\n * データのみ保持する。\r\n *\r\n * @note 実装は interface ではなく class にしてみる。\r\n * interface だとシリアライズは楽だが、リフレクションが使えない。\r\n */\r\nvar RE_Game_Attribute = /** @class */ (function () {\r\n    function RE_Game_Attribute() {\r\n    }\r\n    RE_Game_Attribute.prototype.data = function () {\r\n        return {};\r\n    };\r\n    return RE_Game_Attribute;\r\n}());\r\nexports.RE_Game_Attribute = RE_Game_Attribute;\r\nvar RE_Game_PositionalAttribute = /** @class */ (function (_super) {\r\n    __extends(RE_Game_PositionalAttribute, _super);\r\n    function RE_Game_PositionalAttribute() {\r\n        var _this = _super !== null && _super.apply(this, arguments) || this;\r\n        _this._data = {\r\n            x: 0,\r\n            y: 0,\r\n            floorId: 0,\r\n        };\r\n        return _this;\r\n    }\r\n    RE_Game_PositionalAttribute.prototype.data = function () {\r\n        return this._data;\r\n    };\r\n    return RE_Game_PositionalAttribute;\r\n}(RE_Game_Attribute));\r\nexports.RE_Game_PositionalAttribute = RE_Game_PositionalAttribute;\r\n/**\r\n * 行動順ルールのもと、1ターンの間に何らかの行動を起こす可能性があるもの。\r\n *\r\n * - 一般的なキャラクター (Player, Enemy, NPC)\r\n */\r\nvar RE_Game_UnitAttribute = /** @class */ (function (_super) {\r\n    __extends(RE_Game_UnitAttribute, _super);\r\n    function RE_Game_UnitAttribute() {\r\n        return _super !== null && _super.apply(this, arguments) || this;\r\n    }\r\n    return RE_Game_UnitAttribute;\r\n}(RE_Game_PositionalAttribute));\r\nexports.RE_Game_UnitAttribute = RE_Game_UnitAttribute;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game_Attribute.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game_Block.ts":
/*!********************************!*\
  !*** ./ts/RE/RE_Game_Block.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_Block = void 0;\r\n/**\r\n * GameBlock\r\n *\r\n * GameBlock 自体は単なる入れ物。\r\n * これは、例えば壁堀りなどで Tile への更新通知を特別扱いしないようにするための対策。\r\n * アクション発動側は、壁堀り属性の付いた「攻撃コマンド」を「GameBlock」へ送信するだけでよい。\r\n * GameBlock 内にいるエンティティに順番にコマンドを送っていき、Wall な Block がいたらそれを取り除いたりする。\r\n *\r\n * 階段、壁、Item などを Block の中へ入れていくイメージ。\r\n *\r\n * @note\r\n *\t\t\tなお、このシステムを作るのに参考にした caves-of-zircon-tutorial では、\r\n *\t\t\tTile はキャラクターの見た目である記号や色を持つため、Lumino でいうところのスプライトと考えられる。\r\n *\r\n * @note Layer\r\n * - アイテムとキャラクターは同じマスの上に乗ることができる。\r\n * - キャラクターがすり抜け状態であれば、壁Entityと同じマスに乗ることができる。\r\n * - アイテム・ワナ・階段は同じマスの上に乗ることはできない。\r\n * - キャラクター・土偶は同じマスに乗ることはできない。\r\n * - アイテムや階段は壁に埋まった状態で存在できる。（埋蔵金・黄金の階段）\r\n * 単純に BlockOccupierAttribute で他 Entity を侵入できないようにするだけでは足りない。グループ化の仕組みが必要。\r\n * また攻撃 Action などは基本的に、Block 内に複数の Entity がある場合は「上」から処理していく。\r\n * 例えば、アイアンハンマーを装備して、ワナの上にいるモンスターに攻撃すると、ワナは壊れずモンスターにダメージが行く。\r\n * 単純に Entity のリストを持っているだけだと、並べ替えなどを考慮しなければならなくなる。\r\n * これらをグループ化するために、Layer という仕組みを使ってみる。\r\n *\r\n * - 主に SafetyArea においてマップ移動や通行禁止の Event を、\"すり抜け\" 属性 ON で置けるようにするため、ひとつの Layer には複数の Entity が入れる。\r\n *\r\n * [2020/9/6] 壁も Entity にしたほうがいいの？\r\n * ----------\r\n * しておいた方がいろいろ拡張しやすい。\r\n * 例えば自動修復する壁とかも作れる。\r\n * elona みたいに固定マップの壊した壁が一定時間すると復活するようなものを実装するには必要になる。\r\n *\r\n */\r\nvar RE_Game_Block = /** @class */ (function () {\r\n    function RE_Game_Block(map) {\r\n    }\r\n    return RE_Game_Block;\r\n}());\r\nexports.RE_Game_Block = RE_Game_Block;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game_Block.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game_Entity.ts":
/*!*********************************!*\
  !*** ./ts/RE/RE_Game_Entity.ts ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_Entity = void 0;\r\nvar RE_Game_1 = __webpack_require__(/*! ./RE_Game */ \"./ts/RE/RE_Game.ts\");\r\nvar BlockLayer;\r\n(function (BlockLayer) {\r\n    /** 地形情報。壁・水路など。 */\r\n    BlockLayer[BlockLayer[\"Terrain\"] = 0] = \"Terrain\";\r\n    /** 地表に落ちているもの。アイテム・ワナ・階段など。 */\r\n    BlockLayer[BlockLayer[\"Surface\"] = 1] = \"Surface\";\r\n    /** ユニット。PC・仲間・モンスター・土偶など。 */\r\n    BlockLayer[BlockLayer[\"Unit\"] = 2] = \"Unit\";\r\n    /** 発射物。矢、魔法弾、吹き飛ばされたUnitなど。 */\r\n    BlockLayer[BlockLayer[\"Projectile\"] = 3] = \"Projectile\";\r\n})(BlockLayer || (BlockLayer = {}));\r\n/**\r\n * システムを構成する最も原始的な要素。\r\n * プレイヤー、仲間、モンスター、アイテム、ワナ、地形、飛翔体（矢、魔法弾）などの、状態をもちえるすべての要素のベースクラス。\r\n *\r\n * 複数の Attribute や Behavior をアタッチすることで、動作を定義していく。\r\n *\r\n * Entity のライフサイクル\r\n * ----------\r\n * - インスタンスの作成は newEntity() で行う。\r\n *   - すべての Entity は必ず World に存在することになる。\r\n * - 破棄は destroy()。 ※直ちにインスタンスが削除されるのではなく、削除マークが付けられ、後で削除される。\r\n *\r\n * @note\r\n * BlockLayer は種別のような他の情報から求めるべきかもしれないが、Entity によっては固定されることは無い。\r\n * - アイテム変化するモンスターは自身の種別を変更することになるが、それだと BlockLayer を変更することと変わらない。\r\n * - アイテムとして持っている土偶を立てたときは、振舞いは Item から Unit に変わる。これも結局状態変更することと変わらない。\r\n */\r\nvar RE_Game_Entity = /** @class */ (function () {\r\n    // 継承 & 誤用防止\r\n    function RE_Game_Entity() {\r\n        this.attrbutes = [];\r\n        this.behaviors = [];\r\n        this._id = 0;\r\n        this._destroyed = false;\r\n        // HC3 で作ってた CommonAttribute はこっちに持ってきた。\r\n        // これらは Entity ごとに一意であるべきで、Framework が必要としている必須パラメータ。\r\n        // Attribute よりはこっちに置いた方がいいだろう。\r\n        this._displayName = '';\r\n        this._iconName = '';\r\n        this._blockLayer = BlockLayer.Unit;\r\n        this._eventData = undefined;\r\n        // TODO: Test\r\n        this._eventData = {\r\n            id: 0,\r\n            name: \"dynamc  event\",\r\n            note: \"\",\r\n            pages: [\r\n                {\r\n                    conditions: {\r\n                        actorId: 1,\r\n                        actorValid: false,\r\n                        itemId: 1,\r\n                        itemValid: false,\r\n                        selfSwitchCh: \"A\",\r\n                        selfSwitchValid: false,\r\n                        switch1Id: 1,\r\n                        switch1Valid: false,\r\n                        switch2Id: 1,\r\n                        switch2Valid: false,\r\n                        variableId: 1,\r\n                        variableValid: false,\r\n                        variableValue: 1,\r\n                    },\r\n                    directionFix: false,\r\n                    image: {\r\n                        tileId: 0,\r\n                        characterName: \"Actor1\",\r\n                        direction: 2,\r\n                        pattern: 0,\r\n                        characterIndex: 1\r\n                    },\r\n                    list: [],\r\n                    moveFrequency: 3,\r\n                    moveRoute: {\r\n                        list: [],\r\n                        repeat: true,\r\n                        skippable: false,\r\n                        wait: false,\r\n                    },\r\n                    moveSpeed: 3,\r\n                    moveType: 0,\r\n                    priorityType: 1,\r\n                    stepAnime: false,\r\n                    through: false,\r\n                    trigger: 0,\r\n                    walkAnime: true,\r\n                }\r\n            ],\r\n            x: 0,\r\n            y: 0,\r\n        };\r\n    }\r\n    RE_Game_Entity.newEntity = function () {\r\n        var e = new RE_Game_Entity();\r\n        RE_Game_1.RE_Game.world._addEntity(e);\r\n        return e;\r\n    };\r\n    /**\r\n     * 動的に生成した Game_Event が参照する EventData.\r\n     * 頻繁にアクセスされる可能性があるので Attribute ではなくこちらに持たせている。\r\n     */\r\n    RE_Game_Entity.prototype.eventData = function () {\r\n        return this._eventData;\r\n    };\r\n    RE_Game_Entity.prototype.isDestroyed = function () {\r\n        return this._destroyed;\r\n    };\r\n    RE_Game_Entity.prototype.destroy = function () {\r\n        this._destroyed = true;\r\n    };\r\n    RE_Game_Entity.prototype.findAttribute = function (ctor) {\r\n        for (var i = 0; i < this.attrbutes.length; i++) {\r\n            var a = this.attrbutes[i];\r\n            if (a instanceof ctor) {\r\n                return a;\r\n            }\r\n        }\r\n        return undefined;\r\n        /*\r\n        const r = this.attrbutes.find(x => x.constructor.toString() === Text.name);\r\n        if (r)\r\n            return r as unknown as T;\r\n        else\r\n            return undefined;\r\n            */\r\n    };\r\n    return RE_Game_Entity;\r\n}());\r\nexports.RE_Game_Entity = RE_Game_Entity;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game_Entity.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game_EntityFactory.ts":
/*!****************************************!*\
  !*** ./ts/RE/RE_Game_EntityFactory.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_EntityFactory = void 0;\r\nvar RE_Game_Entity_1 = __webpack_require__(/*! ./RE_Game_Entity */ \"./ts/RE/RE_Game_Entity.ts\");\r\nvar RE_Game_Attribute_1 = __webpack_require__(/*! ./RE_Game_Attribute */ \"./ts/RE/RE_Game_Attribute.ts\");\r\nvar RE_Game_EntityFactory = /** @class */ (function () {\r\n    function RE_Game_EntityFactory() {\r\n    }\r\n    RE_Game_EntityFactory.newActor = function () {\r\n        var e = RE_Game_Entity_1.RE_Game_Entity.newEntity();\r\n        e.attrbutes = [\r\n            new RE_Game_Attribute_1.RE_Game_UnitAttribute(),\r\n        ];\r\n        return e;\r\n    };\r\n    return RE_Game_EntityFactory;\r\n}());\r\nexports.RE_Game_EntityFactory = RE_Game_EntityFactory;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game_EntityFactory.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game_Map.ts":
/*!******************************!*\
  !*** ./ts/RE/RE_Game_Map.ts ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_Map = void 0;\r\nvar RE_Game_Block_1 = __webpack_require__(/*! ./RE_Game_Block */ \"./ts/RE/RE_Game_Block.ts\");\r\n/**\r\n * アクティブなマップオブジェクト。\r\n * インスタンスは1つだけ存在する。\r\n */\r\nvar RE_Game_Map = /** @class */ (function () {\r\n    function RE_Game_Map() {\r\n        this._width = 0;\r\n        this._height = 0;\r\n        this._blocks = [];\r\n        this._borderWall = new RE_Game_Block_1.RE_Game_Block(this); // マップ有効範囲外に存在するダミー要素\r\n        //_data: RE_Game_Data;\r\n    }\r\n    RE_Game_Map.prototype.setupEmptyMap = function (width, height) {\r\n        this._width = width;\r\n        this._height = height;\r\n        var count = this._width * this._height;\r\n        this._blocks = new Array(count);\r\n        for (var i = 0; i < count; i++) {\r\n            this._blocks[i] = new RE_Game_Block_1.RE_Game_Block(this);\r\n        }\r\n    };\r\n    RE_Game_Map.prototype.block = function (x, y) {\r\n        if (x < 0 || this._width <= x || y < 0 || this._height <= y) {\r\n            return this._borderWall;\r\n        }\r\n        else {\r\n            return this._blocks[y * this._width + x];\r\n        }\r\n    };\r\n    return RE_Game_Map;\r\n}());\r\nexports.RE_Game_Map = RE_Game_Map;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game_Map.ts?");

/***/ }),

/***/ "./ts/RE/RE_Game_World.ts":
/*!********************************!*\
  !*** ./ts/RE/RE_Game_World.ts ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_Game_World = void 0;\r\n/**\r\n * 1ゲーム内に1インスタンス存在する。\r\n */\r\nvar RE_Game_World = /** @class */ (function () {\r\n    function RE_Game_World() {\r\n        this._entities = [];\r\n    }\r\n    RE_Game_World.prototype._addEntity = function (entity) {\r\n        // TODO: 空き場所を愚直に線形探索。\r\n        // 大量の Entity を扱うようになったら最適化する。\r\n        var index = this._entities.findIndex(function (x) { return x == undefined; });\r\n        if (index < 0) {\r\n            entity._id = this._entities.length;\r\n            this._entities.push(entity);\r\n        }\r\n        else {\r\n            entity._id = index;\r\n            this._entities[index] = entity;\r\n        }\r\n    };\r\n    RE_Game_World.prototype.update = function () {\r\n        this._removeDestroyesEntities();\r\n    };\r\n    RE_Game_World.prototype._removeDestroyesEntities = function () {\r\n        for (var i = 0; i < this._entities.length; i++) {\r\n            var entity = this._entities[i];\r\n            if (entity && entity.isDestroyed()) {\r\n                this._entities[i] = undefined;\r\n            }\r\n        }\r\n    };\r\n    return RE_Game_World;\r\n}());\r\nexports.RE_Game_World = RE_Game_World;\r\n\n\n//# sourceURL=webpack:///./ts/RE/RE_Game_World.ts?");

/***/ }),

/***/ "./ts/Scene_Boot.ts":
/*!**************************!*\
  !*** ./ts/Scene_Boot.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar RE_DataManager_1 = __webpack_require__(/*! ./RE/RE_DataManager */ \"./ts/RE/RE_DataManager.ts\");\r\nvar _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;\r\nScene_Boot.prototype.onDatabaseLoaded = function () {\r\n    _Scene_Boot_onDatabaseLoaded.call(this);\r\n    RE_DataManager_1.RE_DataManager.loadData();\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Scene_Boot.ts?");

/***/ }),

/***/ "./ts/Scene_Map.ts":
/*!*************************!*\
  !*** ./ts/Scene_Map.ts ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar RE_DataManager_1 = __webpack_require__(/*! ./RE/RE_DataManager */ \"./ts/RE/RE_DataManager.ts\");\r\nvar _Scene_Map_isReady = Scene_Map.prototype.isReady;\r\nScene_Map.prototype.isReady = function () {\r\n    if (RE_DataManager_1.RE_DataManager.landMapDataLoading) {\r\n        if (DataManager.isMapLoaded()) {\r\n            // Land 定義マップの読み込みがすべて終わった\r\n            // 元の遷移先マップをバックアップ (Land 定義マップとして使う)\r\n            RE_DataManager_1.RE_DataManager._dataLandDefinitionMap = $dataMap;\r\n            // 固定マップを読み込む\r\n            DataManager.loadMapData(1);\r\n            // Reload. まだ読み込み完了していない扱いにする\r\n            return false;\r\n        }\r\n        else {\r\n            // Land 定義マップの読み込み中\r\n            return false;\r\n        }\r\n    }\r\n    else {\r\n        return _Scene_Map_isReady.call(this);\r\n    }\r\n};\r\nvar _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;\r\nScene_Map.prototype.onMapLoaded = function () {\r\n    return _Scene_Map_onMapLoaded.call(this);\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Scene_Map.ts?");

/***/ }),

/***/ "./ts/index.ts":
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n__webpack_require__(/*! ./DataManager */ \"./ts/DataManager.ts\");\r\n__webpack_require__(/*! ./Game_Player */ \"./ts/Game_Player.ts\");\r\n__webpack_require__(/*! ./Game_Event */ \"./ts/Game_Event.ts\");\r\n__webpack_require__(/*! ./Game_Map */ \"./ts/Game_Map.ts\");\r\n__webpack_require__(/*! ./RE/RE_Data */ \"./ts/RE/RE_Data.ts\");\r\n__webpack_require__(/*! ./RE/RE_DataManager */ \"./ts/RE/RE_DataManager.ts\");\r\n__webpack_require__(/*! ./RE/RE_Game_Entity */ \"./ts/RE/RE_Game_Entity.ts\");\r\n__webpack_require__(/*! ./RE/RE_Game_EntityFactory */ \"./ts/RE/RE_Game_EntityFactory.ts\");\r\n__webpack_require__(/*! ./RE/RE_Game_Map */ \"./ts/RE/RE_Game_Map.ts\");\r\n__webpack_require__(/*! ./RE/RE_Game */ \"./ts/RE/RE_Game.ts\");\r\n__webpack_require__(/*! ./Scene_Boot */ \"./ts/Scene_Boot.ts\");\r\n__webpack_require__(/*! ./Scene_Map */ \"./ts/Scene_Map.ts\");\r\n\n\n//# sourceURL=webpack:///./ts/index.ts?");

/***/ })

/******/ });