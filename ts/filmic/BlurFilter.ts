import { BlurFilterPass } from "./BlurFilterPass";

import fragment from './glsl/test.frag';


class CopyFilterPass extends PIXI.Filter {
    constructor() {
        
        const fragmentSrc = [
            'precision mediump float;',
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            'void main (void) {',
            ' vec4 color1 = texture2D(uSampler, vTextureCoord);',
            ' gl_FragColor = color1;',
            '}'
        ];

        super(undefined, fragmentSrc.join('\n'), {});
    }

}

class BlurBlendFilterPass extends PIXI.Filter {
    constructor() {
        /*
        const fragmentSrc = [
            'precision mediump float;',
            'uniform sampler2D inputSampler;',
            'uniform sampler2D uSampler;',
            'varying vec2 vTextureCoord;',
            'void main (void) {',
            ' vec4 color1 = texture2D(inputSampler, vTextureCoord);',
            ' vec4 color2 = texture2D(uSampler, vTextureCoord);',
            ' float r = abs((vTextureCoord.y * 2.0) - 1.0);',
            //' float r = (vTextureCoord.y * 2.0) - 1.0;',
            ' gl_FragColor = mix(color1, color2, r);',
            ' gl_FragColor = vec4(r, 0, 0, 1);',
            //' gl_FragColor = color1;',
            '}'
        ];
        */


        super(undefined, (fragment as string) + ('\n'), {});
    }

}




/**
 * The BlurFilter applies a Gaussian blur to an object.
 *
 * The strength of the blur can be set for the x-axis and y-axis separately.
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 */
 export class BlurFilter extends PIXI.Filter
 {
    public blurXFilter: BlurFilterPass;
    public blurYFilter: BlurFilterPass;

    private _repeatEdgePixels: boolean;

    private _copyPass: CopyFilterPass;
    private _blendPass: BlurBlendFilterPass;

     /**
      * @param {number} [strength=8] - The strength of the blur filter.
      * @param {number} [quality=4] - The quality of the blur filter.
      * @param {number} [resolution] - The resolution of the blur filter.
      * @param {number} [kernelSize=5] - The kernelSize of the blur filter.Options: 5, 7, 9, 11, 13, 15.
      */
     constructor(strength?: number, quality?: number, resolution?: number, kernelSize?: number)
     {
         super();
 
         this.blurXFilter = new BlurFilterPass(true, strength, quality, resolution, kernelSize);
         this.blurYFilter = new BlurFilterPass(false, strength, quality, resolution, kernelSize);
 
         this.resolution = resolution || PIXI.settings.RESOLUTION;
         this.quality = quality || 4;
         this.blur = strength || 8;
 
         this._repeatEdgePixels = false;
         this.repeatEdgePixels = false;

         // ★ .d がプロパティになっていなかったので
         this.blendMode = this.blurYFilter.blendMode;
         this._copyPass = new CopyFilterPass();
         this._blendPass = new BlurBlendFilterPass();
     }
 
     /**
      * Applies the filter.
      *
      * @param {PIXI.systems.FilterSystem} filterManager - The manager.
      * @param {PIXI.RenderTexture} input - The input target.
      * @param {PIXI.RenderTexture} output - The output target.
      */
     //apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clear: boolean | PIXI.CLEAR_MODES)
     apply(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, output: PIXI.RenderTexture, clear: PIXI.CLEAR_MODES, currentState?: any): void
     {
         const xStrength = Math.abs(this.blurXFilter.strength);
         const yStrength = Math.abs(this.blurYFilter.strength);
 
         if (xStrength && yStrength)
         {
             const renderTarget1 = filterManager.getFilterTexture(input);
             const renderTarget2 = filterManager.getFilterTexture(input);
 
             // BlurFilterPass の実装は input を swap で再利用するので、
             // 元の画像が書き換わらないように退避する。
             this._copyPass.apply(filterManager, input, renderTarget2, (true as any));

             this.blurXFilter.apply(filterManager, renderTarget2, renderTarget1, clear);//(true as any));
             this.blurYFilter.apply(filterManager, renderTarget1, renderTarget2, clear);//(true as any));
 

             this._blendPass.uniforms.inputSampler = input;
             this._blendPass.apply(filterManager, renderTarget2, output, clear);

             filterManager.returnFilterTexture(renderTarget1);
             filterManager.returnFilterTexture(renderTarget2);
         }
         else if (yStrength)
         {
             this.blurYFilter.apply(filterManager, input, output, clear);
         }
         else
         {
             this.blurXFilter.apply(filterManager, input, output, clear);
         }

         
     }
 
     updatePadding()
     {
         if (this._repeatEdgePixels)
         {
             this.padding = 0;
         }
         else
         {
             this.padding = Math.max(Math.abs(this.blurXFilter.strength), Math.abs(this.blurYFilter.strength)) * 2;
         }
     }
 
     /**
      * Sets the strength of both the blurX and blurY properties simultaneously
      *
      * @member {number}
      * @default 2
      */
     get blur()
     {
         return this.blurXFilter.blur;
     }
 
     set blur(value) // eslint-disable-line require-jsdoc
     {
         this.blurXFilter.blur = this.blurYFilter.blur = value;
         this.updatePadding();
     }
 
     /**
      * Sets the number of passes for blur. More passes means higher quaility bluring.
      *
      * @member {number}
      * @default 1
      */
     get quality()
     {
         return this.blurXFilter.quality;
     }
 
     set quality(value) // eslint-disable-line require-jsdoc
     {
         this.blurXFilter.quality = this.blurYFilter.quality = value;
     }
 
     /**
      * Sets the strength of the blurX property
      *
      * @member {number}
      * @default 2
      */
     get blurX()
     {
         return this.blurXFilter.blur;
     }
 
     set blurX(value) // eslint-disable-line require-jsdoc
     {
         this.blurXFilter.blur = value;
         this.updatePadding();
     }
 
     /**
      * Sets the strength of the blurY property
      *
      * @member {number}
      * @default 2
      */
     get blurY()
     {
         return this.blurYFilter.blur;
     }
 
     set blurY(value) // eslint-disable-line require-jsdoc
     {
         this.blurYFilter.blur = value;
         this.updatePadding();
     }
 
     /**
      * Sets the blendmode of the filter
      *
      * @member {number}
      * @default PIXI.BLEND_MODES.NORMAL
      */
     /*
     get blendMode(): number
     {
         return this.blurYFilter.blendMode;
     }
 
     set blendMode(value) // eslint-disable-line require-jsdoc
     {
         this.blurYFilter.blendMode = value;
     }
     */
 
     /**
      * If set to true the edge of the target will be clamped
      *
      * @member {bool}
      * @default false
      */
     get repeatEdgePixels()
     {
         return this._repeatEdgePixels;
     }
 
     set repeatEdgePixels(value)
     {
         this._repeatEdgePixels = value;
         this.updatePadding();
     }
 }
 