import { assert } from 'ts/Common';
import { TileShape } from 'ts/objects/LBlock';
import fragment from './glsl/SeperableBlur.frag';

export class SeperableBlurPass extends PIXI.Filter {
    private _renderTarget: PIXI.RenderTexture | undefined;

    constructor(kernel: number, sigma: number, horizonal: boolean) {
        const dx = (horizonal) ? 1.0 : 0.0;
        const dy = (horizonal) ? 0.0 : 1.0;
        super(undefined, fragment, {
            KERNEL_RADIUS: kernel,
            SIGMA: sigma,
            _Direction: [dx, dy],
        });
    }

    public renderTexture(): PIXI.RenderTexture {
        assert(this._renderTarget);
        return this._renderTarget;
    }
    
    public prepare(filterManager: PIXI.systems.FilterSystem, input: PIXI.RenderTexture, resolution: number) {
        
        this._renderTarget = filterManager.getFilterTexture(input, resolution);
        

        this.uniforms._TexSize = [input.width, input.height];

    }

    public retain(filterManager: PIXI.systems.FilterSystem): void {
        if (this._renderTarget) {
            filterManager.returnFilterTexture(this._renderTarget);
        }
    }

}

