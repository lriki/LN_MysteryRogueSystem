import fragment from './glsl/LuminosityHighPassShader.frag';

export class LuminosityHighPassFilter extends PIXI.Filter {
    constructor() {
        super(undefined, fragment);
    }
}

