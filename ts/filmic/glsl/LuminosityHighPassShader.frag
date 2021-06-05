precision mediump float;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;

const vec3 _Color = vec3(0.0, 0.0, 0.0);
const float _Opacity = 1.0;
const float _LuminosityThreshold = 0.8;
const float _SmoothWidth = 0.01;

#define saturate(x) clamp(x, 0.0, 1.0)

void main () {
    vec4 texel = texture2D(uSampler, vTextureCoord);
    vec3 luma = vec3(0.299, 0.587, 0.114);
    float v = saturate(dot(texel.xyz, luma));
    vec4 outputColor = vec4(_Color.rgb, _Opacity);
    float alpha = smoothstep(_LuminosityThreshold, _LuminosityThreshold + _SmoothWidth, v);
    gl_FragColor = mix(outputColor, texel, alpha);
}

