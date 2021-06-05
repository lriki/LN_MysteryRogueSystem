import fragment from './glsl/LuminosityHighPassShader.frag';

export class LuminosityHighPassFilter extends PIXI.Filter {
    constructor() {
        super(undefined, fragment);
    }
    
    public prepare(luminosityThreshold: number, luminositySmoothWidth: number): void {
        this.uniforms._LuminosityThreshold = luminosityThreshold;
        this.uniforms._SmoothWidth = luminositySmoothWidth;
    }

}

