
precision mediump float;
varying vec2 vTextureCoord;

#define NUM_MIPS 5

uniform sampler2D _BlurTexture1;
uniform sampler2D _BlurTexture2;
uniform sampler2D _BlurTexture3;
uniform sampler2D _BlurTexture4;
uniform sampler2D _BlurTexture5;

uniform vec4 _BloomTintColorsAndFactors[8];
uniform float _BloomStrength;
uniform float _BloomRadius;

float LerpBloomFactor(float factor)
{
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, _BloomRadius);
}

vec3 Bloom(vec2 uv)
{
    vec4 col = _BloomStrength * ( LerpBloomFactor(_BloomTintColorsAndFactors[0].a) * vec4(_BloomTintColorsAndFactors[0].rgb, 1.0) * texture2D(_BlurTexture1, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors[1].a) * vec4(_BloomTintColorsAndFactors[1].rgb, 1.0) * texture2D(_BlurTexture2, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors[2].a) * vec4(_BloomTintColorsAndFactors[2].rgb, 1.0) * texture2D(_BlurTexture3, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors[3].a) * vec4(_BloomTintColorsAndFactors[3].rgb, 1.0) * texture2D(_BlurTexture4, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors[4].a) * vec4(_BloomTintColorsAndFactors[4].rgb, 1.0) * texture2D(_BlurTexture5, uv) );
    return col.rgb * col.a;
}


void main () {
    gl_FragColor = vec4(Bloom(vTextureCoord), 1.0);
}
