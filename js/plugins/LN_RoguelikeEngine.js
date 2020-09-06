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

/***/ "./ts/Data.ts":
/*!********************!*\
  !*** ./ts/Data.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n\n\n//# sourceURL=webpack:///./ts/Data.ts?");

/***/ }),

/***/ "./ts/DataManager.ts":
/*!***************************!*\
  !*** ./ts/DataManager.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nexports.RE_DataManager = exports.RE_Data = void 0;\r\nvar RE_Data = /** @class */ (function () {\r\n    function RE_Data() {\r\n    }\r\n    RE_Data.addEntityKind = function (name) {\r\n        var newId = this.entityKinds.length + 1;\r\n        this.entityKinds.push({\r\n            id: newId,\r\n            name: name\r\n        });\r\n        return newId;\r\n    };\r\n    RE_Data.actors = [];\r\n    RE_Data.entityKinds = [];\r\n    return RE_Data;\r\n}());\r\nexports.RE_Data = RE_Data;\r\nvar RE_DataManager = /** @class */ (function () {\r\n    function RE_DataManager() {\r\n    }\r\n    RE_DataManager.loadData = function () {\r\n        console.log(\"RE_DataManager.loadData\");\r\n        RE_Data.WeaponKindId = RE_Data.addEntityKind(\"武器\");\r\n        RE_Data.ShieldKindId = RE_Data.addEntityKind(\"盾\");\r\n        RE_Data.ArrowKindId = RE_Data.addEntityKind(\"矢\");\r\n        //RE_Data.addEntityKind(\"石\");\r\n        //RE_Data.addEntityKind(\"弾\");\r\n        RE_Data.BraceletKindId = RE_Data.addEntityKind(\"腕輪\");\r\n        RE_Data.FoodKindId = RE_Data.addEntityKind(\"食料\");\r\n        RE_Data.HerbKindId = RE_Data.addEntityKind(\"草\");\r\n        RE_Data.ScrollKindId = RE_Data.addEntityKind(\"巻物\");\r\n        RE_Data.WandKindId = RE_Data.addEntityKind(\"杖\");\r\n        RE_Data.PotKindId = RE_Data.addEntityKind(\"壺\");\r\n        RE_Data.DiscountTicketKindId = RE_Data.addEntityKind(\"割引券\");\r\n        RE_Data.BuildingMaterialKindId = RE_Data.addEntityKind(\"材料\");\r\n        RE_Data.TrapKindId = RE_Data.addEntityKind(\"罠\");\r\n        RE_Data.FigurineKindId = RE_Data.addEntityKind(\"土偶\");\r\n        RE_Data.MonsterKindId = RE_Data.addEntityKind(\"モンスター\");\r\n        console.log(\"RE_DataManager.1\");\r\n        RE_Data.actors = $dataActors.map(function (x) {\r\n            var _a, _b;\r\n            if (x) {\r\n                return {\r\n                    id: (_a = x.id) !== null && _a !== void 0 ? _a : 0,\r\n                    name: (_b = x.name) !== null && _b !== void 0 ? _b : \"\",\r\n                };\r\n            }\r\n            else {\r\n                return { id: 0, name: \"null\" };\r\n            }\r\n        });\r\n        console.log(RE_Data.actors);\r\n        console.log(\"RE_DataManager.2\");\r\n    };\r\n    return RE_DataManager;\r\n}());\r\nexports.RE_DataManager = RE_DataManager;\r\n\n\n//# sourceURL=webpack:///./ts/DataManager.ts?");

/***/ }),

/***/ "./ts/Game_Event.ts":
/*!**************************!*\
  !*** ./ts/Game_Event.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar _Game_Event_initMembers = Game_Event.prototype.initMembers;\r\nGame_Event.prototype.initMembers = function () {\r\n    _Game_Event_initMembers.call(this);\r\n    console.log(\"Game_Event initialized.\");\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Event.ts?");

/***/ }),

/***/ "./ts/Game_Player.ts":
/*!***************************!*\
  !*** ./ts/Game_Player.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nvar _Game_Player_initMembers = Game_Player.prototype.initMembers;\r\nGame_Player.prototype.initMembers = function () {\r\n    _Game_Player_initMembers.call(this);\r\n    console.log(\"Game_Player initialized.\");\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Game_Player.ts?");

/***/ }),

/***/ "./ts/Scene_Boot.ts":
/*!**************************!*\
  !*** ./ts/Scene_Boot.ts ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\nvar DataManager_1 = __webpack_require__(/*! ./DataManager */ \"./ts/DataManager.ts\");\r\nvar _Scene_Boot_onDatabaseLoaded = Scene_Boot.prototype.onDatabaseLoaded;\r\nScene_Boot.prototype.onDatabaseLoaded = function () {\r\n    _Scene_Boot_onDatabaseLoaded.call(this);\r\n    DataManager_1.RE_DataManager.loadData();\r\n    console.log(\"Scene_Boot initialized.\");\r\n};\r\n\n\n//# sourceURL=webpack:///./ts/Scene_Boot.ts?");

/***/ }),

/***/ "./ts/index.ts":
/*!*********************!*\
  !*** ./ts/index.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\nObject.defineProperty(exports, \"__esModule\", { value: true });\r\n__webpack_require__(/*! ./Data */ \"./ts/Data.ts\");\r\n__webpack_require__(/*! ./DataManager */ \"./ts/DataManager.ts\");\r\n__webpack_require__(/*! ./Game_Player */ \"./ts/Game_Player.ts\");\r\n__webpack_require__(/*! ./Game_Event */ \"./ts/Game_Event.ts\");\r\n__webpack_require__(/*! ./Scene_Boot */ \"./ts/Scene_Boot.ts\");\r\n\n\n//# sourceURL=webpack:///./ts/index.ts?");

/***/ })

/******/ });