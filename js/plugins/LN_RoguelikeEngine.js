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


!function(n){var r={};function o(e){if(r[e])return r[e].exports;var t=r[e]={i:e,l:!1,exports:{}};return n[e].call(t.exports,t,t.exports,o),t.l=!0,t.exports}o.m=n,o.c=r,o.d=function(e,t,n){o.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(t,e){if(1&e&&(t=o(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var r in t)o.d(n,r,function(e){return t[e]}.bind(null,r));return n},o.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(t,"a",t),t},o.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},o.p="",o(o.s=0)}([function(e,t,n){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),n(1),n(2)},function(e,t){var n=Game_Player.prototype.initMembers;Game_Player.prototype.initMembers=function(){n.call(this),console.log("Game_Player initialized.")}},function(e,t){var n=Game_Event.prototype.initMembers;Game_Event.prototype.initMembers=function(){n.call(this),console.log("Game_Event initialized.")}}]);