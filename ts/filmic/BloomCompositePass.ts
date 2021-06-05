import fragment from './glsl/BloomComposite.frag';

export class BloomCompositePass extends PIXI.Filter {
    constructor() {
        super(undefined, fragment);
    }

    public prepare(bloomStrength: number, bloomRadius: number, texturs: PIXI.RenderTexture[]): void {
        this.uniforms._BloomStrength = bloomStrength;
        this.uniforms._BloomRadius = bloomRadius;
        this.uniforms._BlurTexture1 = texturs[0];
        this.uniforms._BlurTexture2 = texturs[1];
        this.uniforms._BlurTexture3 = texturs[2];
        this.uniforms._BlurTexture4 = texturs[3];
        this.uniforms._BlurTexture5 = texturs[4];
        this.uniforms._BloomTintColorsAndFactors = [
            [1.0, 1.0, 1.0, 1.0],
            [1.0, 1.0, 1.0, 0.8],
            [1.0, 1.0, 1.0, 0.6],
            [1.0, 1.0, 1.0, 0.4],
            [1.0, 1.0, 1.0, 0.2],
            [1.0, 1.0, 1.0, 0.2],
            [1.0, 1.0, 1.0, 0.2],
            [1.0, 1.0, 1.0, 0.2],
        ];
    }
}

