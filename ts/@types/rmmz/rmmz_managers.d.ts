// Type definitions for rmmz_managers.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped
declare namespace DataManager{
	// DataManager._globalInfo.<i>
	
	/**
	 * 
	 */
	interface _globalInfoI {
				
		/**
		 * 
		 */
		characters : Array<Array</* string,number */ any>>;
				
		/**
		 * 
		 */
		faces : Array<Array</* string,number */ any>>;
				
		/**
		 * 
		 */
		playtime : string;
				
		/**
		 * 
		 */
		timestamp : number;
	}
}
declare namespace DataManager{
	// DataManager._errors.<i>
	
	/**
	 * 
	 */
	interface _errorsI {
				
		/**
		 * 
		 */
		name : string;
				
		/**
		 * 
		 */
		src : string;
				
		/**
		 * 
		 */
		url : string;
	}
}
declare namespace DataManager{
	// DataManager._databaseFiles.<i>
	
	/**
	 * 
	 */
	interface _databaseFilesI {
				
		/**
		 * 
		 */
		name : string;
				
		/**
		 * 
		 */
		src : string;
	}
}
declare namespace DataManager{
	// DataManager.onXhrLoad.!0
	
	/**
	 * 
	 */
	interface OnXhrLoad0 {
				
		/**
		 * 
		 */
		onload(): void;
				
		/**
		 * 
		 */
		onerror(): void;
	}
}
declare namespace DataManager{
	// DataManager.onLoad.!0
	
	/**
	 * 
	 */
	interface OnLoad0 {
				
		/**
		 * 
		 */
		meta : /*no type*/{};
	}
}
declare namespace DataManager{
	// DataManager.makeSaveContents.!ret
	
	/**
	 * A save data does not contain $gameTemp, $gameMessage, and $gameTroop.
	 */
	interface MakeSaveContentsRet {
				
		/**
		 * 
		 */
		system : /* $gameSystem */ any;
				
		/**
		 * 
		 */
		screen : /* $gameScreen */ any;
				
		/**
		 * 
		 */
		timer : /* $gameTimer */ any;
				
		/**
		 * 
		 */
		switches : /* $gameSwitches */ any;
				
		/**
		 * 
		 */
		variables : /* $gameVariables */ any;
				
		/**
		 * 
		 */
		selfSwitches : /* $gameSelfSwitches */ any;
				
		/**
		 * 
		 */
		actors : /* $gameActors */ any;
				
		/**
		 * 
		 */
		party : /* $gameParty */ any;
				
		/**
		 * 
		 */
		map : /* $gameMap */ any;
				
		/**
		 * 
		 */
		player : /* $gamePlayer */ any;
	}
}
declare namespace ConfigManager{
	// ConfigManager.makeData.!ret
	
	/**
	 * 
	 */
	interface MakeDataRet {
				
		/**
		 * 
		 */
		alwaysDash : boolean;
				
		/**
		 * 
		 */
		commandRemember : boolean;
				
		/**
		 * 
		 */
		touchUI : boolean;
				
		/**
		 * 
		 */
		bgmVolume : number;
				
		/**
		 * 
		 */
		bgsVolume : number;
				
		/**
		 * 
		 */
		meVolume : number;
				
		/**
		 * 
		 */
		seVolume : number;
	}
}

declare namespace AudioManager{
	// AudioManager.playBgs.!0
	
	/**
	 * 
	 */
	interface PlayBgs0 {
				
		/**
		 * 
		 */
		pos : number;
	}
}
declare namespace AudioManager{
	// AudioManager.makeEmptyAudioObject.!ret
	
	/**
	 * 
	 */
	interface MakeEmptyAudioObjectRet {
				
		/**
		 * 
		 */
		name : string;
				
		/**
		 * 
		 */
		volume : number;
				
		/**
		 * 
		 */
		pitch : number;
	}
}
declare namespace TextManager{
	// TextManager.getter.!ret
	
	/**
	 * 
	 */
	interface GetterRet {
				
		/**
		 * 
		 */
		get(): void;
				
		/**
		 * 
		 */
		configurable : boolean;
	}
}
declare namespace SceneManager{
	// SceneManager.onError.!0
	
	/**
	 * 
	 */
	interface OnError0 {
	}
}

/**
 * -----------------------------------------------------------------------------
 * DataManager
 * 
 * The static class that manages the database and game objects.
 */
declare interface DataManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): DataManager;
}


/**
 * 
 */
declare namespace DataManager{
		
	/**
	 * 
	 */
	export var _globalInfo : Array</* DataManager._globalInfoI */ any>;
		
	/**
	 * 
	 */
	export var _errors : Array</* DataManager._errorsI */ any>;
		
	/**
	 * 
	 */
	export var _databaseFiles : Array</* DataManager._databaseFilesI */ any>;
		
	/**
	 * 
	 */
	function loadGlobalInfo(): void;
		
	/**
	 * 
	 */
	function removeInvalidGlobalInfo(): void;
		
	/**
	 * 
	 */
	function saveGlobalInfo(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isGlobalInfoLoaded(): boolean;
		
	/**
	 * 
	 */
	function loadDatabase(): void;
		
	/**
	 * 
	 * @param name 
	 * @param src 
	 */
	function loadDataFile(name : string, src : string): void;
		
	/**
	 * 
	 * @param xhr 
	 * @param name 
	 * @param src 
	 * @param url 
	 */
	function onXhrLoad(xhr : DataManager.OnXhrLoad0, name : string, src : string, url : string): void;
		
	/**
	 * 
	 * @param name 
	 * @param src 
	 * @param url 
	 */
	function onXhrError(name : string, src : string, url : string): void;
		
	/**
	 * 
	 * @return  
	 */
	function isDatabaseLoaded(): boolean;
		
	/**
	 * 
	 * @param mapId 
	 */
	function loadMapData(mapId : number): void;
		
	/**
	 * 
	 */
	function makeEmptyMap(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isMapLoaded(): boolean;
		
	/**
	 * 
	 * @param object 
	 */
	function onLoad(object : DataManager.OnLoad0): void;
		
	/**
	 * 
	 * @param object 
	 * @return  
	 */
	function isMapObject(object : any): boolean;
		
	/**
	 * 
	 * @param array 
	 */
	function extractArrayMetadata(array : any): void;
		
	/**
	 * 
	 * @param data 
	 */
	function extractMetadata(data : /* DataManager.onLoad.!0 */ any): void;
		
	/**
	 * 
	 */
	function checkError(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isBattleTest(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isEventTest(): boolean;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	function isSkill(item : any): any;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	function isItem(item : any): any;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	function isWeapon(item : any): any;
		
	/**
	 * 
	 * @param item 
	 * @return  
	 */
	function isArmor(item : any): any;
		
	/**
	 * 
	 */
	function createGameObjects(): void;
		
	/**
	 * 
	 */
	function setupNewGame(): void;
		
	/**
	 * 
	 */
	function setupBattleTest(): void;
		
	/**
	 * 
	 */
	function setupEventTest(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isAnySavefileExists(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function latestSavefileId(): number;
		
	/**
	 * 
	 * @return  
	 */
	function earliestSavefileId(): number;
		
	/**
	 * 
	 * @return  
	 */
	function emptySavefileId(): number;
		
	/**
	 * 
	 */
	function loadAllSavefileImages(): void;
		
	/**
	 * 
	 * @param info 
	 */
	function loadSavefileImages(info : /* DataManager._globalInfo.<i> */ any): void;
		
	/**
	 * 
	 * @return  
	 */
	function maxSavefiles(): number;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	function savefileInfo(savefileId : number): /* !this._globalInfo.<i> */ any;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	function savefileExists(savefileId : number): boolean;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	function saveGame(savefileId : number): /* DataManager.+Promise */ any;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	function loadGame(savefileId : any): /* DataManager.+Promise */ any;
		
	/**
	 * 
	 * @param savefileId 
	 * @return  
	 */
	function makeSavename(savefileId : number): string;
		
	/**
	 * 
	 */
	function selectSavefileForNewGame(): void;
		
	/**
	 * 
	 * @return  
	 */
	function makeSavefileInfo(): /* DataManager._globalInfo.<i> */ any;
		
	/**
	 * 
	 * @return  
	 */
	function makeSaveContents(): any;//DataManager.MakeSaveContentsRet;
		
	/**
	 * 
	 * @param contents 
	 */
	function extractSaveContents(contents : any): void;
		
	/**
	 * 
	 */
	function correctDataErrors(): void;
}

/**
 * -----------------------------------------------------------------------------
 * ConfigManager
 * 
 * The static class that manages the configuration data.
 */
declare interface ConfigManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): ConfigManager;
}


/**
 * 
 */
declare namespace ConfigManager{
		
	/**
	 * 
	 */
	export var alwaysDash : boolean;
		
	/**
	 * 
	 */
	export var commandRemember : boolean;
		
	/**
	 * 
	 */
	export var touchUI : boolean;
		
	/**
	 * 
	 */
	export var _isLoaded : boolean;
		
	/**
	 * 
	 */
	export var bgmVolume : number;
		
	/**
	 * 
	 */
	export var bgsVolume : number;
		
	/**
	 * 
	 */
	export var meVolume : number;
		
	/**
	 * 
	 */
	export var seVolume : number;
		
	/**
	 * 
	 */
	function load(): void;
		
	/**
	 * 
	 */
	function save(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isLoaded(): /* !this._isLoaded */ any;
		
	/**
	 * 
	 * @return  
	 */
	function makeData(): ConfigManager.MakeDataRet;
		
	/**
	 * 
	 * @param config 
	 */
	function applyData(config : any): void;
		
	/**
	 * 
	 * @param config 
	 * @param name 
	 * @param defaultValue 
	 * @return  
	 */
	function readFlag(config : any, name : string, defaultValue : boolean): boolean;
		
	/**
	 * 
	 * @param config 
	 * @param name 
	 * @return  
	 */
	function readVolume(config : any, name : string): number;
}

/**
 * -----------------------------------------------------------------------------
 * StorageManager
 * 
 * The static class that manages storage for saving game data.
 */
declare interface StorageManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): StorageManager;
}


/**
 * 
 */
declare namespace StorageManager{
		
	/**
	 * 
	 */
	export var _forageKeys : Array<any>;
		
	/**
	 * 
	 */
	export var _forageKeysUpdated : boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isLocalMode(): boolean;
		
	/**
	 * 
	 * @param saveName 
	 * @param object 
	 * @return  
	 */
	function saveObject(saveName : string, object : any): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function loadObject(saveName : string): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param object 
	 * @return  
	 */
	function objectToJson(object : any): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param json 
	 * @return  
	 */
	function jsonToObject(json : string): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param json 
	 * @return  
	 */
	function jsonToZip(json : any): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param zip 
	 * @return  
	 */
	function zipToJson(zip : any): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param saveName 
	 * @param zip 
	 * @return  
	 */
	function saveZip(saveName : string, zip : any): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function loadZip(saveName : string): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function exists(saveName : string): boolean;
		
	/**
	 * 
	 * @param saveName 
	 */
	function remove(saveName : any): void;
		
	/**
	 * 
	 * @param saveName 
	 * @param zip 
	 * @return  
	 */
	function saveToLocalFile(saveName : string, zip : any): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function loadFromLocalFile(saveName : string): /* StorageManager.+Promise */ any;
		
	/**
	 * 
	 * @param saveName 
	 */
	function localFileExists(saveName : string): void;
		
	/**
	 * 
	 * @param saveName 
	 */
	function removeLocalFile(saveName : any): void;
		
	/**
	 * 
	 * @param saveName 
	 * @param zip 
	 */
	function saveToForage(saveName : string, zip : any): void;
		
	/**
	 * 
	 * @param saveName 
	 */
	function loadFromForage(saveName : string): void;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function forageExists(saveName : string): boolean;
		
	/**
	 * 
	 * @param saveName 
	 */
	function removeForage(saveName : any): void;
		
	/**
	 * 
	 */
	function updateForageKeys(): void;
		
	/**
	 * 
	 * @return  
	 */
	function forageKeysUpdated(): /* !this._forageKeysUpdated */ any;
		
	/**
	 * 
	 * @param path 
	 */
	function fsMkdir(path : any): void;
		
	/**
	 * 
	 * @param oldPath 
	 * @param newPath 
	 */
	function fsRename(oldPath : string, newPath : string): void;
		
	/**
	 * 
	 * @param path 
	 */
	function fsUnlink(path : string): void;
		
	/**
	 * 
	 * @param path 
	 */
	function fsReadFile(path : any): void;
		
	/**
	 * 
	 * @param path 
	 * @param data 
	 */
	function fsWriteFile(path : string, data : any): void;
		
	/**
	 * 
	 */
	function fileDirectoryPath(): string;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function filePath(saveName : string): string;
		
	/**
	 * 
	 * @param saveName 
	 * @return  
	 */
	function forageKey(saveName : string): string;
		
	/**
	 * 
	 * @return  
	 */
	function forageTestKey(): string;
}

/**
 * -----------------------------------------------------------------------------
 * FontManager
 * 
 * The static class that loads font files.
 */
declare interface FontManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): FontManager;
}


/**
 * 
 */
declare namespace FontManager{
	
	/**
	 * 
	 */
	var _urls : {
	}
	
	/**
	 * 
	 */
	var _states : {
	}
		
	/**
	 * 
	 * @param family 
	 * @param filename 
	 */
	function load(family : string, filename : any): void;
		
	/**
	 * 
	 * @return  
	 */
	function isReady(): boolean;
		
	/**
	 * 
	 * @param family 
	 * @param url 
	 */
	function startLoading(family : string, url : string): void;
		
	/**
	 * 
	 * @param family 
	 */
	function throwLoadError(family : any): void;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function makeUrl(filename : any): string;
}

/**
 * -----------------------------------------------------------------------------
 * ImageManager
 * 
 * The static class that loads images, creates bitmap objects and retains them.
 */
declare interface ImageManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): ImageManager;
}


/**
 * 
 */
declare namespace ImageManager{
		
	/**
	 * 
	 */
	export var iconWidth : number;
		
	/**
	 * 
	 */
	export var iconHeight : number;
		
	/**
	 * 
	 */
	export var faceWidth : number;
		
	/**
	 * 
	 */
	export var faceHeight : number;
	
	/**
	 * 
	 */
	var _cache : {
	}
	
	/**
	 * 
	 */
	var _system : {
	}
		
	/**
	 * 
	 */
	export var _emptyBitmap : Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadAnimation(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadBattleback1(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadBattleback2(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadEnemy(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadCharacter(filename : string): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadFace(filename : string): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadParallax(filename : string): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadPicture(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadSvActor(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadSvEnemy(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadSystem(filename : string): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadTileset(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadTitle1(filename : any): Bitmap;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function loadTitle2(filename : any): Bitmap;
		
	/**
	 * 
	 * @param folder 
	 * @param filename 
	 * @return  
	 */
	function loadBitmap(folder : string, filename : string): Bitmap;
		
	/**
	 * 
	 * @param url 
	 * @return  
	 */
	function loadBitmapFromUrl(url : string): /* !this._system.<i> */ any;
		
	/**
	 * 
	 */
	function clear(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isReady(): boolean;
		
	/**
	 * 
	 * @param bitmap 
	 */
	function throwLoadError(bitmap : Bitmap): void;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function isObjectCharacter(filename : string): Array<string>;	
	/**
	 * 
	 */
	function isObjectCharacter();
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function isBigCharacter(filename : string): Array<string>;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function isZeroParallax(filename : string): boolean;
}

/**
 * -----------------------------------------------------------------------------
 * EffectManager
 * 
 * The static class that loads Effekseer effects.
 */
declare interface EffectManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): EffectManager;
}


/**
 * 
 */
declare namespace EffectManager{
		
	/**
	 * 
	 */
	export var _cache : /*no type*/{};
		
	/**
	 * 
	 */
	export var _errorUrls : Array<string>;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function load(filename : any): /* !this._cache.<i> */ any;
		
	/**
	 * 
	 * @param url 
	 */
	function startLoading(url : string): void;
		
	/**
	 * 
	 */
	function clear(): void;
		
	/**
	 * 
	 */
	function onLoad(): void;
		
	/**
	 * 
	 * @param url 
	 */
	function onError(url : string): void;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function makeUrl(filename : any): string;
		
	/**
	 * 
	 */
	function checkErrors(): void;
		
	/**
	 * 
	 * @param url 
	 */
	function throwLoadError(url : string): void;
		
	/**
	 * 
	 * @return  
	 */
	function isReady(): boolean;
}

/**
 * -----------------------------------------------------------------------------
 * AudioManager
 * 
 * The static class that handles BGM, BGS, ME and SE.
 */
declare interface AudioManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): AudioManager;
}


/**
 * 
 */
declare namespace AudioManager{
		
	/**
	 * 
	 */
	export var _bgmVolume : number;
		
	/**
	 * 
	 */
	export var _bgsVolume : number;
		
	/**
	 * 
	 */
	export var _meVolume : number;
		
	/**
	 * 
	 */
	export var _seVolume : number;
	
	/**
	 * 
	 */
	var _currentBgm : {
				
		/**
		 * 
		 */
		pos : number;
	}
	
	/**
	 * 
	 */
	var _currentBgs : {
				
		/**
		 * 
		 */
		pos : number;
	}
		
	/**
	 * 
	 */
	export var _bgmBuffer : WebAudio;
		
	/**
	 * [Note] Do not play the same sound in the same frame.
	 */
	export var _seBuffers : Array<WebAudio>;
		
	/**
	 * 
	 */
	export var _staticBuffers : Array<WebAudio>;
		
	/**
	 * 
	 */
	export var _replayFadeTime : number;
		
	/**
	 * 
	 */
	export var _path : string;
		
	/**
	 * 
	 * @param bgm 
	 * @param pos 
	 */
	function playBgm(bgm: IDataSound, pos : number): void;
		
	/**
	 * 
	 * @param bgm 
	 */
	function replayBgm(bgm : /* BattleManager._mapBgm */ any): void;
		
	/**
	 * 
	 * @param bgm 
	 * @return  
	 */
	function isCurrentBgm(bgm : /* BattleManager._mapBgm */ any): /* !this._currentBgm */ any;
		
	/**
	 * 
	 * @param bgm 
	 */
	function updateBgmParameters(bgm : /* BattleManager._mapBgm */ any): void;
		
	/**
	 * 
	 * @param bgm 
	 * @param pos 
	 */
	function updateCurrentBgm(bgm : /* BattleManager._mapBgm */ any, pos : number): void;
		
	/**
	 * 
	 */
	function stopBgm(): void;
		
	/**
	 * 
	 * @param duration 
	 */
	function fadeOutBgm(duration : number): void;
		
	/**
	 * 
	 * @param duration 
	 */
	function fadeInBgm(duration : any): void;
		
	/**
	 * 
	 * @param bgs 
	 * @param pos 
	 */
	function playBgs(bgs : AudioManager.PlayBgs0, pos : number): void;
		
	/**
	 * 
	 * @param bgs 
	 */
	function replayBgs(bgs : /* BattleManager._mapBgs */ any): void;
		
	/**
	 * 
	 * @param bgs 
	 * @return  
	 */
	function isCurrentBgs(bgs : /* BattleManager._mapBgs */ any): /* !this._currentBgs */ any;
		
	/**
	 * 
	 * @param bgs 
	 */
	function updateBgsParameters(bgs : /* BattleManager._mapBgs */ any): void;
		
	/**
	 * 
	 * @param bgs 
	 * @param pos 
	 */
	function updateCurrentBgs(bgs : /* BattleManager._mapBgs */ any, pos : number): void;
		
	/**
	 * 
	 */
	function stopBgs(): void;
		
	/**
	 * 
	 * @param duration 
	 */
	function fadeOutBgs(duration : number): void;
		
	/**
	 * 
	 * @param duration 
	 */
	function fadeInBgs(duration : any): void;
		
	/**
	 * 
	 * @param me 
	 */
	function playMe(me : any): void;
		
	/**
	 * 
	 * @param me 
	 */
	function updateMeParameters(me : any): void;
		
	/**
	 * 
	 * @param duration 
	 */
	function fadeOutMe(duration : number): void;
		
	/**
	 * 
	 */
	function stopMe(): void;
		
	/**
	 * 
	 * @param se 
	 */
	function playSe(se : IDataSound): void;
		
	/**
	 * 
	 * @param buffer 
	 * @param se 
	 */
	function updateSeParameters(buffer : WebAudio, se : any): void;
		
	/**
	 * 
	 */
	function cleanupSe(): void;
		
	/**
	 * 
	 */
	function stopSe(): void;
		
	/**
	 * 
	 * @param se 
	 */
	function playStaticSe(se : any): void;
		
	/**
	 * 
	 * @param se 
	 */
	function loadStaticSe(se : any): void;
		
	/**
	 * 
	 * @param se 
	 * @return  
	 */
	function isStaticSe(se : any): boolean;
		
	/**
	 * 
	 */
	function stopAll(): void;
		
	/**
	 * 
	 * @return  
	 */
	function saveBgm(): /* BattleManager._mapBgm */ any;
		
	/**
	 * 
	 * @return  
	 */
	function saveBgs(): /* BattleManager._mapBgs */ any;
		
	/**
	 * 
	 * @return  
	 */
	function makeEmptyAudioObject(): AudioManager.MakeEmptyAudioObjectRet;
		
	/**
	 * 
	 * @param folder 
	 * @param name 
	 * @return  
	 */
	function createBuffer(folder : string, name : any): WebAudio;
		
	/**
	 * 
	 * @param buffer 
	 * @param configVolume 
	 * @param audio 
	 */
	function updateBufferParameters(buffer : WebAudio, configVolume : number, audio : /* BattleManager._mapBgm */ any): void;
		
	/**
	 * 
	 * @return  
	 */
	function audioFileExt(): string;
		
	/**
	 * 
	 */
	function checkErrors(): void;
		
	/**
	 * 
	 * @param webAudio 
	 */
	function throwLoadError(webAudio : WebAudio): void;
}

/**
 * -----------------------------------------------------------------------------
 * SoundManager
 * 
 * The static class that plays sound effects defined in the database.
 */
declare interface SoundManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): SoundManager;
}


/**
 * 
 */
declare namespace SoundManager{
		
	/**
	 * 
	 */
	function preloadImportantSounds(): void;
		
	/**
	 * 
	 * @param n 
	 */
	function loadSystemSound(n : number): void;
		
	/**
	 * 
	 * @param n 
	 */
	function playSystemSound(n : number): void;
		
	/**
	 * 
	 */
	function playCursor(): void;
		
	/**
	 * 
	 */
	function playOk(): void;
		
	/**
	 * 
	 */
	function playCancel(): void;
		
	/**
	 * 
	 */
	function playBuzzer(): void;
		
	/**
	 * 
	 */
	function playEquip(): void;
		
	/**
	 * 
	 */
	function playSave(): void;
		
	/**
	 * 
	 */
	function playLoad(): void;
		
	/**
	 * 
	 */
	function playBattleStart(): void;
		
	/**
	 * 
	 */
	function playEscape(): void;
		
	/**
	 * 
	 */
	function playEnemyAttack(): void;
		
	/**
	 * 
	 */
	function playEnemyDamage(): void;
		
	/**
	 * 
	 */
	function playEnemyCollapse(): void;
		
	/**
	 * 
	 */
	function playBossCollapse1(): void;
		
	/**
	 * 
	 */
	function playBossCollapse2(): void;
		
	/**
	 * 
	 */
	function playActorDamage(): void;
		
	/**
	 * 
	 */
	function playActorCollapse(): void;
		
	/**
	 * 
	 */
	function playRecovery(): void;
		
	/**
	 * 
	 */
	function playMiss(): void;
		
	/**
	 * 
	 */
	function playEvasion(): void;
		
	/**
	 * 
	 */
	function playMagicEvasion(): void;
		
	/**
	 * 
	 */
	function playReflection(): void;
		
	/**
	 * 
	 */
	function playShop(): void;
		
	/**
	 * 
	 */
	function playUseItem(): void;
		
	/**
	 * 
	 */
	function playUseSkill(): void;
}

/**
 * -----------------------------------------------------------------------------
 * TextManager
 * 
 * The static class that handles terms and messages.
 */
declare interface TextManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): TextManager;
}


/**
 * 
 */
declare namespace TextManager{
		
    export function basic(basicId: number): string;
    export function param(paramId: number): string;
    export function command(commandId: number): string;
    export function message(messageId: number): string;

    export function getter(method: 'basic' | 'command', param: number): () => string;
    export function getter(method: 'message', param: string): () => string;

    export const currencyUnit: string;

    export const level: string;
    export const levelA: string;
    export const hp: string;
    export const hpA: string;
    export const mp: string;
    export const mpA: string;
    export const tp: string;
    export const tpA: string;
    export const exp: string;
    export const expA: string;
    export const fight: string;
    export const escape: string;
    export const attack: string;
    export const guard: string;
    export const item: string;
    export const skill: string;
    export const equip: string;
    export const status: string;
    export const formation: string;
    export const save: string;
    export const gameEnd: string;
    export const options: string;
    export const weapon: string;
    export const armor: string;
    export const keyItem: string;
    export const equip2: string;
    export const optimize: string;
    export const clear: string;
    export const newGame: string;
    export const continue_: string;
    export const toTitle: string;
    export const cancel: string;
    export const buy: string;
    export const sell: string;
    export const alwaysDash: string;
    export const commandRemember: string;
    export const touchUI: string;
    export const bgmVolume: string;
    export const bgsVolume: string;
    export const meVolume: string;
    export const seVolume: string;
    export const possession: string;
    export const expTotal: string;
    export const expNext: string;
    export const saveMessage: string;
    export const loadMessage: string;
    export const file: string;
    export const autosave: string;
    export const partyName: string;
    export const emerge: string;
    export const preemptive: string;
    export const surprise: string;
    export const escapeStart: string;
    export const escapeFailure: string;
    export const victory: string;
    export const defeat: string;
    export const obtainExp: string;
    export const obtainGold: string;
    export const obtainItem: string;
    export const levelUp: string;
    export const obtainSkill: string;
    export const useItem: string;
    export const criticalToEnemy: string;
    export const criticalToActor: string;
    export const actorDamage: string;
    export const actorRecovery: string;
    export const actorGain: string;
    export const actorLoss: string;
    export const actorDrain: string;
    export const actorNoDamage: string;
    export const actorNoHit: string;
    export const enemyDamage: string;
    export const enemyRecovery: string;
    export const enemyGain: string;
    export const enemyLoss: string;
    export const enemyDrain: string;
    export const enemyNoDamage: string;
    export const enemyNoHit: string;
    export const evasion: string;
    export const magicEvasion: string;
    export const magicReflection: string;
    export const counterAttack: string;
    export const substitute: string;
    export const buffAdd: string;
    export const debuffAdd: string;
    export const buffRemove: string;
    export const actionFailure: string;
}

/**
 * -----------------------------------------------------------------------------
 * ColorManager
 * 
 * The static class that handles the window colors.
 */
declare interface ColorManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): ColorManager;
}


/**
 * 
 */
declare namespace ColorManager{
		
	/**
	 * 
	 */
	function loadWindowskin(): void;
		
	/**
	 * 
	 * @param n 
	 * @return  
	 */
	function textColor(n : number | string): string;
		
	/**
	 * 
	 * @return  
	 */
	function normalColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function systemColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function crisisColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function deathColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function gaugeBackColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function hpGaugeColor1(): string;
		
	/**
	 * 
	 * @return  
	 */
	function hpGaugeColor2(): string;
		
	/**
	 * 
	 * @return  
	 */
	function mpGaugeColor1(): string;
		
	/**
	 * 
	 * @return  
	 */
	function mpGaugeColor2(): string;
		
	/**
	 * 
	 * @return  
	 */
	function mpCostColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function powerUpColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function powerDownColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function ctGaugeColor1(): string;
		
	/**
	 * 
	 * @return  
	 */
	function ctGaugeColor2(): string;
		
	/**
	 * 
	 * @return  
	 */
	function tpGaugeColor1(): string;
		
	/**
	 * 
	 * @return  
	 */
	function tpGaugeColor2(): string;
		
	/**
	 * 
	 * @return  
	 */
	function tpCostColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function pendingColor(): string;
		
	/**
	 * 
	 * @param actor 
	 * @return  
	 */
	function hpColor(actor : /* BattleManager._currentActor */ any): string;
		
	/**
	 * 
	 * @return  
	 */
	function mpColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function tpColor(): string;
		
	/**
	 * 
	 * @param change 
	 * @return  
	 */
	function paramchangeTextColor(change : number): string;
		
	/**
	 * 
	 * @param colorType 
	 * @return  
	 */
	function damageColor(colorType : number): string;
		
	/**
	 * 
	 * @return  
	 */
	function outlineColor(): string;
		
	/**
	 * 
	 * @return  
	 */
	function dimColor1(): string;
		
	/**
	 * 
	 * @return  
	 */
	function dimColor2(): string;
		
	/**
	 * 
	 * @return  
	 */
	function itemBackColor1(): string;
		
	/**
	 * 
	 * @return  
	 */
	function itemBackColor2(): string;
}

/**
 * -----------------------------------------------------------------------------
 * SceneManager
 * 
 * The static class that manages scene transitions.
 */
declare interface SceneManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): SceneManager;
}


/**
 * 
 */
declare namespace SceneManager{
		
	/**
	 * 
	 */
	export var _scene : Scene_Base;//SceneManager._previousClass;
		
	/**
	 * 
	 */
	export var _stack : Array<any>;
		
	/**
	 * 
	 */
	export var _exiting : boolean;
		
	/**
	 * 
	 */
	function _previousClass(): void;
		
	/**
	 * 
	 */
	export var _smoothDeltaTime : number;
		
	/**
	 * 
	 */
	export var _elapsedTime : number;
		
	/**
	 * 
	 * @param sceneClass 
	 */
	function run(sceneClass : () => void): void;
		
	/**
	 * 
	 */
	function initialize(): void;
		
	/**
	 * 
	 */
	function checkBrowser(): void;
		
	/**
	 * 
	 */
	function checkPluginErrors(): void;
		
	/**
	 * 
	 */
	function initGraphics(): void;
		
	/**
	 * 
	 */
	function initAudio(): void;
		
	/**
	 * 
	 */
	function initVideo(): void;
		
	/**
	 * 
	 */
	function initInput(): void;
		
	/**
	 * 
	 */
	function setupEventHandlers(): void;
		
	/**
	 * 
	 * @param deltaTime 
	 */
	function update(deltaTime : any): void;
		
	/**
	 * 
	 * @param deltaTime 
	 * @return  
	 */
	function determineRepeatNumber(deltaTime : any): number;
		
	/**
	 * 
	 */
	function terminate(): void;
		
	/**
	 * 
	 * @param event 
	 */
	function onError(event : SceneManager.OnError0): void;
		
	/**
	 * 
	 * @param event 
	 */
	function onReject(event : /* SceneManager.onError.!0 */ any): void;
		
	/**
	 * 
	 */
	function onUnload(): void;
		
	/**
	 * 
	 * @param event 
	 */
	function onKeyDown(event : any): void;
		
	/**
	 * 
	 */
	function reloadGame(): void;
		
	/**
	 * 
	 */
	function showDevTools(): void;
		
	/**
	 * 
	 * @param e 
	 */
	function catchException(e : any): void;
		
	/**
	 * 
	 * @param e 
	 */
	function catchNormalError(e : any): void;
		
	/**
	 * 
	 * @param e 
	 */
	function catchLoadError(e : any): void;
		
	/**
	 * 
	 * @param e 
	 */
	function catchUnknownError(e : any): void;
		
	/**
	 * 
	 */
	function updateMain(): void;
		
	/**
	 * 
	 */
	function updateFrameCount(): void;
		
	/**
	 * 
	 */
	function updateInputData(): void;
		
	/**
	 * 
	 */
	function updateEffekseer(): void;
		
	/**
	 * 
	 */
	function changeScene(): void;
		
	/**
	 * 
	 */
	function updateScene(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isGameActive(): boolean;
		
	/**
	 * 
	 */
	function onSceneTerminate(): void;
		
	/**
	 * 
	 */
	function onSceneCreate(): void;
		
	/**
	 * 
	 */
	function onBeforeSceneStart(): void;
		
	/**
	 * 
	 */
	function onSceneStart(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isSceneChanging(): /* !this._exiting */ any;
		
	/**
	 * 
	 * @return  
	 */
	function isCurrentSceneBusy(): /* !this._scene */ any;
		
	/**
	 * 
	 * @param sceneClass 
	 * @return  
	 */
	function isNextScene(sceneClass : any): /* !this._nextScene */ any;
		
	/**
	 * 
	 * @param sceneClass 
	 * @return  
	 */
	function isPreviousScene(sceneClass : (() => void) | (() => void)): boolean;
		
	/**
	 * 
	 * @param sceneClass 
	 */
	function goto(sceneClass : any): void;
		
	/**
	 * 
	 * @param sceneClass 
	 */
	function push(sceneClass : any): void;
	//function push(sceneClass : (() => void) | (() => void)): void;
		
	/**
	 * 
	 */
	function pop(): void;
		
	/**
	 * 
	 */
	function exit(): void;
		
	/**
	 * 
	 */
	function clearStack(): void;
		
	/**
	 * 
	 */
	function stop(): void;
		
	/**
	 * 
	 */
	function prepareNextScene(): void;
		
	/**
	 * 
	 * @return  
	 */
	function snap(): Bitmap;
		
	/**
	 * 
	 */
	function snapForBackground(): void;
		
	/**
	 * 
	 * @return  
	 */
	function backgroundBitmap(): /* !this._backgroundBitmap */ any;
		
	/**
	 * 
	 */
	function resume(): void;
}

/**
 * -----------------------------------------------------------------------------
 * BattleManager
 * 
 * The static class that manages battle progress.
 */
declare interface BattleManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): BattleManager;
}


/**
 * 
 */
declare namespace BattleManager{
		
	/**
	 * prettier-ignore
	 * @param troopId 
	 * @param canEscape 
	 * @param canLose 
	 */
	function setup(troopId : number, canEscape : boolean, canLose : boolean): void;
		
	/**
	 * 
	 */
	export var _canEscape : boolean;
		
	/**
	 * 
	 */
	export var _canLose : boolean;
		
	/**
	 * 
	 */
	function initMembers(): void;
		
	/**
	 * 
	 */
	export var _phase : string;
		
	/**
	 * 
	 */
	export var _inputting : boolean;
		
	/**
	 * 
	 */
	export var _battleTest : boolean;
		
	/**
	 * 
	 * @param n 
	 */
	function _eventCallback(n : number): void;
		
	/**
	 * 
	 */
	export var _preemptive : boolean;
		
	/**
	 * 
	 */
	export var _surprise : boolean;
		
	/**
	 * 
	 */
	export var _currentActor : /*no type*/{};
	
	/**
	 * 
	 */
	var _mapBgm : {
				
		/**
		 * 
		 */
		pos : number;
	}
	
	/**
	 * 
	 */
	var _mapBgs : {
				
		/**
		 * 
		 */
		pos : number;
	}
		
	/**
	 * 
	 */
	export var _actionBattlers : Array</* BattleManager._currentActor */ any>;
		
	/**
	 * 
	 */
	export var _action : /*no type*/{};
		
	/**
	 * 
	 */
	export var _targets : Array<any>;
		
	/**
	 * 
	 */
	export var _logWindow : /*no type*/{};
		
	/**
	 * 
	 */
	export var _spriteset : /*no type*/{};
		
	/**
	 * 
	 */
	export var _escapeRatio : number;
		
	/**
	 * 
	 */
	export var _escaped : boolean;
		
	/**
	 * 
	 */
	export var _tpbNeedsPartyCommand : boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isTpb(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isActiveTpb(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isBattleTest(): /* !this._battleTest */ any;
		
	/**
	 * 
	 * @param battleTest 
	 */
	function setBattleTest(battleTest : boolean): void;
		
	/**
	 * 
	 * @param callback 
	 */
	function setEventCallback(callback : () => void): void;
		
	/**
	 * 
	 * @param logWindow 
	 */
	function setLogWindow(logWindow : {} | /* BattleManager._logWindow */ any): void;
		
	/**
	 * 
	 * @param spriteset 
	 */
	function setSpriteset(spriteset : /* BattleManager._spriteset */ any): void;
		
	/**
	 * 
	 */
	function onEncounter(): void;
		
	/**
	 * 
	 * @return  
	 */
	function ratePreemptive(): number;
		
	/**
	 * 
	 * @return  
	 */
	function rateSurprise(): number;
		
	/**
	 * 
	 */
	function saveBgmAndBgs(): void;
		
	/**
	 * 
	 */
	function playBattleBgm(): void;
		
	/**
	 * 
	 */
	function playVictoryMe(): void;
		
	/**
	 * 
	 */
	function playDefeatMe(): void;
		
	/**
	 * 
	 */
	function replayBgmAndBgs(): void;
		
	/**
	 * 
	 */
	function makeEscapeRatio(): void;
		
	/**
	 * 
	 * @param timeActive 
	 */
	function update(timeActive : boolean): void;
		
	/**
	 * 
	 * @param timeActive 
	 */
	function updatePhase(timeActive : boolean): void;
		
	/**
	 * 
	 * @return  
	 */
	function updateEvent(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function updateEventMain(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isBusy(): boolean;
		
	/**
	 * 
	 */
	function updateTpbInput(): void;
		
	/**
	 * 
	 */
	function checkTpbInputClose(): void;
		
	/**
	 * 
	 */
	function checkTpbInputOpen(): void;
		
	/**
	 * 
	 * @return  
	 */
	function isPartyTpbInputtable(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function needsActorInputCancel(): /* !this._currentActor */ any;
		
	/**
	 * 
	 * @return  
	 */
	function isTpbMainPhase(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isInputting(): /* !this._inputting */ any;
		
	/**
	 * 
	 * @return  
	 */
	function isInTurn(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isTurnEnd(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isAborting(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isBattleEnd(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function canEscape(): /* !this._canEscape */ any;
		
	/**
	 * 
	 * @return  
	 */
	function canLose(): /* !this._canLose */ any;
		
	/**
	 * 
	 * @return  
	 */
	function isEscaped(): /* !this._escaped */ any;
		
	/**
	 * 
	 * @return  
	 */
	function actor(): /* !this._currentActor */ any;
		
	/**
	 * 
	 */
	function startBattle(): void;
		
	/**
	 * 
	 */
	function displayStartMessages(): void;
		
	/**
	 * 
	 */
	function startInput(): void;
		
	/**
	 * 
	 */
	function inputtingAction(): void;
		
	/**
	 * 
	 */
	function selectNextCommand(): void;
		
	/**
	 * 
	 */
	function selectNextActor(): void;
		
	/**
	 * 
	 */
	function selectPreviousCommand(): void;
		
	/**
	 * 
	 */
	function selectPreviousActor(): void;
		
	/**
	 * 
	 * @param forward 
	 */
	function changeCurrentActor(forward : boolean): void;
		
	/**
	 * 
	 */
	function startActorInput(): void;
		
	/**
	 * 
	 */
	function finishActorInput(): void;
		
	/**
	 * 
	 */
	function cancelActorInput(): void;
		
	/**
	 * 
	 */
	function updateStart(): void;
		
	/**
	 * 
	 */
	function startTurn(): void;
		
	/**
	 * 
	 * @param timeActive 
	 */
	function updateTurn(timeActive : boolean): void;
		
	/**
	 * 
	 */
	function updateTpb(): void;
		
	/**
	 * 
	 */
	function updateAllTpbBattlers(): void;
		
	/**
	 * 
	 * @param battler 
	 */
	function updateTpbBattler(battler : /* BattleManager._currentActor */ any): void;
		
	/**
	 * 
	 */
	function checkTpbTurnEnd(): void;
		
	/**
	 * 
	 */
	function processTurn(): void;
		
	/**
	 * 
	 * @param battler 
	 */
	function endBattlerActions(battler : /* BattleManager._currentActor */ any): void;
		
	/**
	 * 
	 */
	function endTurn(): void;
		
	/**
	 * 
	 */
	function endAllBattlersTurn(): void;
		
	/**
	 * 
	 * @param battler 
	 * @param current 
	 */
	function displayBattlerStatus(battler : /* BattleManager._currentActor */ any, current : boolean): void;
		
	/**
	 * 
	 */
	function updateTurnEnd(): void;
		
	/**
	 * 
	 */
	function getNextSubject(): void;
		
	/**
	 * 
	 * @return  
	 */
	function allBattleMembers(): Array</* BattleManager._currentActor */ any>;
		
	/**
	 * 
	 */
	function makeActionOrders(): void;
		
	/**
	 * 
	 */
	function startAction(): void;
		
	/**
	 * 
	 */
	function updateAction(): void;
		
	/**
	 * 
	 */
	function endAction(): void;
		
	/**
	 * 
	 * @param subject 
	 * @param target 
	 */
	function invokeAction(subject : /* BattleManager._currentActor */ any, target : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param target 
	 */
	function invokeNormalAction(subject : /* BattleManager._currentActor */ any, target : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param target 
	 */
	function invokeCounterAttack(subject : /* BattleManager._currentActor */ any, target : any): void;
		
	/**
	 * 
	 * @param subject 
	 * @param target 
	 */
	function invokeMagicReflection(subject : /* BattleManager._currentActor */ any, target : any): void;
		
	/**
	 * 
	 * @param target 
	 * @return  
	 */
	function applySubstitute(target : any): any;
		
	/**
	 * 
	 * @param target 
	 * @return  
	 */
	function checkSubstitute(target : any): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function isActionForced(): boolean;
		
	/**
	 * 
	 * @param battler 
	 */
	function forceAction(battler : /* BattleManager._currentActor */ any): void;
		
	/**
	 * 
	 */
	function processForcedAction(): void;
		
	/**
	 * 
	 */
	function abort(): void;
		
	/**
	 * 
	 * @return  
	 */
	function checkBattleEnd(): boolean;
		
	/**
	 * 
	 * @return  
	 */
	function checkAbort(): boolean;
		
	/**
	 * 
	 */
	function processVictory(): void;
		
	/**
	 * 
	 * @return  
	 */
	function processEscape(): /* !this._preemptive */ any;
		
	/**
	 * 
	 */
	function onEscapeSuccess(): void;
		
	/**
	 * 
	 */
	function onEscapeFailure(): void;
		
	/**
	 * 
	 */
	function processAbort(): void;
		
	/**
	 * 
	 */
	function processDefeat(): void;
		
	/**
	 * 
	 * @param result 
	 */
	function endBattle(result : number): void;
		
	/**
	 * 
	 */
	function updateBattleEnd(): void;
		
	/**
	 * 
	 */
	function makeRewards(): void;
		
	/**
	 * 
	 */
	function displayVictoryMessage(): void;
		
	/**
	 * 
	 */
	function displayDefeatMessage(): void;
		
	/**
	 * 
	 */
	function displayEscapeSuccessMessage(): void;
		
	/**
	 * 
	 */
	function displayEscapeFailureMessage(): void;
		
	/**
	 * 
	 */
	function displayRewards(): void;
		
	/**
	 * 
	 */
	function displayExp(): void;
		
	/**
	 * 
	 */
	function displayGold(): void;
		
	/**
	 * 
	 */
	function displayDropItems(): void;
		
	/**
	 * 
	 */
	function gainRewards(): void;
		
	/**
	 * 
	 */
	function gainExp(): void;
		
	/**
	 * 
	 */
	function gainGold(): void;
		
	/**
	 * 
	 */
	function gainDropItems(): void;
}

/**
 * -----------------------------------------------------------------------------
 * PluginManager
 * 
 * The static class that manages the plugins.
 */
declare interface PluginManager {
		
	/**
	 * 
	 * @return  
	 */
	new (): PluginManager;
}


/**
 * 
 */
declare namespace PluginManager{
		
	/**
	 * 
	 */
	export var _scripts : Array<any>;
		
	/**
	 * 
	 */
	export var _errorUrls : Array<any>;
		
	/**
	 * 
	 */
	export var _parameters : /*no type*/{};
		
	/**
	 * 
	 */
	export var _commands : /*no type*/{};
		
	/**
	 * 
	 * @param plugins 
	 */
	function setup(plugins : any): void;
		
	/**
	 * 
	 * @param name 
	 * @return  
	 */
	function parameters(name : any): /* !this._parameters.<i> */ any;
		
	/**
	 * 
	 * @param name 
	 * @param parameters 
	 */
	function setParameters(name : any, parameters : any): void;
		
	/**
	 * 
	 * @param filename 
	 */
	function loadScript(filename : any): void;
		
	/**
	 * 
	 * @param e 
	 */
	function onError(e : any): void;
		
	/**
	 * 
	 * @param filename 
	 * @return  
	 */
	function makeUrl(filename : any): string;
		
	/**
	 * 
	 */
	function checkErrors(): void;
		
	/**
	 * 
	 * @param url 
	 */
	function throwLoadError(url : any): void;
		
	/**
	 * 
	 * @param pluginName 
	 * @param commandName 
	 * @param func 
	 */
	function registerCommand(pluginName : any, commandName : any, func : any): void;
		
	/**
	 * 
	 * @param self 
	 * @param pluginName 
	 * @param commandName 
	 * @param args 
	 */
	function callCommand(self : any, pluginName : any, commandName : any, args : any): void;
}

declare var $gameTemp        : Game_Temp;
declare var $gameSystem      : Game_System;
declare var $gameScreen      : Game_Screen;
declare var $gameTimer       : Game_Timer;
declare var $gameMessage     : Game_Message;
declare var $gameSwitches    : Game_Switches;
declare var $gameVariables   : Game_Variables;
declare var $gameSelfSwitches: Game_SelfSwitches;
declare var $gameMap         : Game_Map;
declare var $gameActors      : Game_Actors;
declare var $gameParty       : Game_Party;
declare var $gameTroop       : Game_Troop;
declare var $gamePlayer      : Game_Player;

/**
 * 
 */
declare var WebAudio : {
		
	/**
	 * 
	 */
	frameCount : number;
		
	/**
	 * 
	 */
	volume : number;
		
	/**
	 * 
	 */
	pitch : number;
		
	/**
	 * 
	 */
	pan : number;
}
