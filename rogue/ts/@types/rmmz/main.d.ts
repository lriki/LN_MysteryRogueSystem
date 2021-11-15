// Type definitions for main.js
// Project: [LIBRARY_URL_HERE] 
// Definitions by: [YOUR_NAME_HERE] <[YOUR_URL_HERE]> 
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/**
 * =============================================================================
 *  main.js v1.0.0
 * =============================================================================
 */
export declare var scriptUrls : Array<string>;

/**
 * 
 */
export declare var effekseerWasmUrl : string;

/**
 * 
 */
declare interface Main {
		
	/**
	 * 
	 */
	new ();
		
	/**
	 * 
	 */
	run(): void;
		
	/**
	 * 
	 */
	showLoadingSpinner(): void;
		
	/**
	 * 
	 */
	eraseLoadingSpinner(): void;
		
	/**
	 * 
	 */
	testXhr(): void;
		
	/**
	 * 
	 */
	loadMainScripts(): void;
		
	/**
	 * 
	 */
	onScriptLoad(): void;
		
	/**
	 * 
	 * @param e 
	 */
	onScriptError(e : any): void;
		
	/**
	 * 
	 * @param name 
	 * @param message 
	 */
	printError(name : string, message : string): void;
		
	/**
	 * 
	 * @param name 
	 * @param message 
	 */
	makeErrorHtml(name : string, message : string): void;
		
	/**
	 * 
	 */
	onWindowLoad(): void;
		
	/**
	 * 
	 * @param event 
	 */
	onWindowError(event : any): void;
		
	/**
	 * 
	 * @return  
	 */
	isPathRandomized(): boolean;
		
	/**
	 * 
	 */
	initEffekseerRuntime(): void;
		
	/**
	 * 
	 */
	onEffekseerLoad(): void;
		
	/**
	 * 
	 */
	onEffekseerError(): void;
		
	/**
	 * 
	 */
	xhrSucceeded : boolean;
		
	/**
	 * 
	 */
	loadCount : number;
		
	/**
	 * 
	 */
	numScripts : number;
}

/**
 * 
 */
export declare var main : Main;
