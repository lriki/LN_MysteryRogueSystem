
precision mediump float;
uniform sampler2D inputSampler;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;


//--------------------------------------------------------------------------------
// Bloom

#define NUM_MIPS 5

uniform sampler2D _BlurTexture1;
uniform sampler2D _BlurTexture2;
uniform sampler2D _BlurTexture3;
uniform sampler2D _BlurTexture4;
uniform sampler2D _BlurTexture5;

uniform vec4 _BloomTintColorsAndFactors1;
uniform vec4 _BloomTintColorsAndFactors2;
uniform vec4 _BloomTintColorsAndFactors3;
uniform vec4 _BloomTintColorsAndFactors4;
uniform vec4 _BloomTintColorsAndFactors5;
uniform float _BloomStrength;
uniform float _BloomRadius;


float LerpBloomFactor(float factor)
{
    float mirrorFactor = 1.2 - factor;
    return mix(factor, mirrorFactor, _BloomRadius);
}

vec3 Bloom(vec2 uv)
{
    vec4 col = _BloomStrength * ( LerpBloomFactor(_BloomTintColorsAndFactors1.a) * vec4(_BloomTintColorsAndFactors1.rgb, 1.0) * texture2D(_BlurTexture1, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors2.a) * vec4(_BloomTintColorsAndFactors2.rgb, 1.0) * texture2D(_BlurTexture2, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors3.a) * vec4(_BloomTintColorsAndFactors3.rgb, 1.0) * texture2D(_BlurTexture3, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors4.a) * vec4(_BloomTintColorsAndFactors4.rgb, 1.0) * texture2D(_BlurTexture4, uv) +
                                    LerpBloomFactor(_BloomTintColorsAndFactors5.a) * vec4(_BloomTintColorsAndFactors5.rgb, 1.0) * texture2D(_BlurTexture5, uv) );
    return col.rgb * col.a;
}

//--------------------------------------------------------------------------------

uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;


//uniform float size;
//uniform float amount;
uniform float size;
uniform float amount;
const float focalPointX = 0.5;
const float focalPointY = 0.5;

#define saturate(x) clamp(x, 0.0, 1.0)

// Tonemap Params
uniform float    paramA;  // shoulderStrength
uniform float    paramB;  // linearStrength
uniform float    paramCB;    // param.linearStrength * param.linearAngle
uniform float    paramDE;    // param.toeStrength * param.toeNumerator
uniform float    paramDF;    // param.toeStrength * param.toeDenominator
uniform float    paramEperF;  // param.toeNumerator / param.toeDenominator
uniform float    paramF_White;//
uniform float   Exposure;
uniform vec4 _Tone;

vec3 CalcUncharted2FilmicPreParam( vec3 rgb,
    float paramA, float paramB, float paramCB,
    float paramDE, float paramDF, float paramEperF, float paramF_White )
{
    vec3    ret = ((rgb * (paramA * rgb + paramCB) + paramDE)
        / (rgb * (paramA * rgb + paramB) + paramDF))
        - paramEperF;
    return ret / paramF_White;
}

vec3 Tonemap(vec3 color)
{
    float expBias = exp2(Exposure);
    vec3 rgb = color.rgb * expBias;

    rgb = CalcUncharted2FilmicPreParam(rgb,
        paramA, paramB, paramCB, paramDE, paramDF, paramEperF, paramF_White);
    
    return rgb;
}


vec3 LN_CalculateToneColor(vec3 inColor, vec4 inToneColor)
{
    vec3 outColor = inColor;
    float y = (0.208012 * outColor.r + 0.586611 * inColor.g + 0.114478 * inColor.b) * inToneColor.w;
    outColor = (inColor * (1.0 - inToneColor.w)) + y + inToneColor.rgb;
    return saturate(outColor);
}



/*
*/


// https://github.com/pixijs/pixijs/wiki/v5-Creating-filters#conversion-functions
// PIXI.js は RenderTarget も 2累乗で作る。それを、スクリーンのサイズに正規化するもの。
vec2 filterTextureCoord() {
    return vTextureCoord * inputSize.xy / outputFrame.zw;
}

/*
const float Exposure = 0.3;
const int isGamma = 0;

vec3 CalcFilmic(vec3 rgb_input)
{
    float expBias = exp2(Exposure);
    vec3 rgb = rgb_input * expBias;

    vec3 x = max(vec3(0.0, 0.0, 0.0), rgb - 0.004);
    vec3 ret = (x * (6.2 * x + 0.5)) / (x * (6.2 * x + 1.7) + 0.06);
    if (isGamma == 0) {
        ret = pow(ret, vec3(2.2));
    }
    return ret;
}
*/

vec3 vignette(vec3 color, vec2 uv) {
    float dist = distance(uv, vec2(focalPointX, focalPointY));
    color *= smoothstep(0.8, size * 0.799, dist * (0.5 * amount + size));
    return color;
}

void main (void) {
    vec2 uv = filterTextureCoord();
    vec4 color1 = texture2D(inputSampler, vTextureCoord);
    vec4 color2 = texture2D(uSampler, vTextureCoord);

    float offset = -0.2;    // 中心をちょっと下に下げる
    float r = abs((uv.y * 2.0) - 1.0 + offset);
    //r -= 0.5;
                //' float r = (uv.y * 2.0) - 1.0;
    gl_FragColor = mix(color1, color2, saturate(r));
    
    gl_FragColor.rgb += Bloom(vTextureCoord);

    gl_FragColor.rgb = LN_CalculateToneColor(gl_FragColor.rgb, _Tone);
    gl_FragColor.rgb = Tonemap(gl_FragColor.rgb);
    

    gl_FragColor.rgb = vignette(gl_FragColor.rgb, uv);

    //gl_FragColor = vec4(r, 0, 0, 1);
                //' gl_FragColor = color1;
                
    //--------------------
    // Gamma
    //if (_gammaEnabled) {
        //gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(1.0 / 2.2));
        //gl_FragColor.rgb = pow(gl_FragColor.rgb, vec3(2.2));
    //}
}
