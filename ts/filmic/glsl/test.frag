
precision mediump float;
uniform sampler2D inputSampler;
uniform sampler2D uSampler;
varying vec2 vTextureCoord;


uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;
/*
*/

#define saturate(x) clamp(x, 0.0, 1.0)

vec2 filterTextureCoord() {
    return vTextureCoord * inputSize.xy / outputFrame.zw;
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
    //gl_FragColor = vec4(r, 0, 0, 1);
                //' gl_FragColor = color1;
}
