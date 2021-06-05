precision mediump float;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

uniform int KERNEL_RADIUS;
uniform float SIGMA;
uniform vec2 _TexSize;
uniform vec2 _Direction;

#define saturate(x) clamp(x, 0.0, 1.0)

float Gaussian(float x, float sigma)
{
    return 0.39894 * exp(-0.5 * x * x / (sigma * sigma)) / sigma;
}

void main () {
    vec2 uv = vTextureCoord;
    vec4 texel = texture2D(uSampler, uv);
    vec2 invSize = 1.0 / _TexSize;
    float fSigma = float(SIGMA);
    float weightSum = Gaussian(0.0, fSigma);
    vec3 diffuseSum = texel.rgb * weightSum;
    for( int i = 1; i < 5/*KERNEL_RADIUS*/; i ++ ) {
        float x = float(i);
        float w = Gaussian(x, fSigma);
        vec2 uvOffset = _Direction * invSize * x;
        vec3 sample1 = texture2D(uSampler, uv + uvOffset).rgb;
        vec3 sample2 = texture2D(uSampler, uv - uvOffset).rgb;
        diffuseSum += (sample1 + sample2) * w;
        weightSum += 2.0 * w;
    }
    gl_FragColor = vec4(diffuseSum / weightSum, 1.0);
}


