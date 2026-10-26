export const vertexShader = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

const shared = `
precision mediump float;
varying vec2 v_uv;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_intensity;
uniform float u_mode;
uniform float u_dark;
uniform float u_size;
uniform float u_speed;
uniform float u_chaos;
uniform float u_shape;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float grid(vec2 uv, float size) {
  vec2 p = uv * u_resolution / size;
  vec2 line = abs(fract(p - 0.5) - 0.5) * size;
  return 1.0 - smoothstep(0.4,1.25,min(line.x,line.y));
}
`

export const gridShader = shared + `
void main() {
  vec2 uv = vec2(v_uv.x, 1.0-v_uv.y);
  vec2 ratio = vec2(u_resolution.x/u_resolution.y,1.0);
  vec2 delta = (uv-u_pointer)*ratio;
  float distance = length(delta);
  float influence = exp(-distance*4.0);
  vec3 ink = mix(vec3(0.15,0.28,0.06),vec3(0.67,1.0,0.37),u_dark);
  vec3 accent = vec3(0.72,1.0,0.36);
  vec3 color = ink;
  float alpha = 0.0;
  if (u_mode < 1.5) {
    vec2 p = uv + delta/ratio * influence * 0.09*u_intensity;
    vec2 cell = floor(p*u_resolution/48.0);
    float pulse = pow(max(0.0,sin(cell.x*0.22+cell.y*0.35-u_time*1.2)),12.0);
    float lines = grid(p,48.0);
    float cells = step(0.94,hash(cell)) * pulse;
    color = mix(ink,accent,pulse);
    alpha = lines*(0.20+pulse*0.55) + cells*0.23;
  } else if (u_mode < 2.5) {
    float chaos = u_chaos;
    float travel = u_time*u_speed*2.0;
    float dimension = mix(24.0,140.0,u_size);
    vec2 p = uv*u_resolution/dimension;
    p.x += sin(floor(p.y)*0.32+travel)*0.8;
    vec2 cell = floor(p);
    float beat = chaos > 0.0 ? floor(u_time*mix(0.25,2.8,chaos)) : 0.0;
    float noise = hash(cell+beat);
    float enabled = step(mix(0.97,0.80,chaos),noise);
    vec2 q = fract(p);
    vec2 d = abs(q-0.5);
    float shape = u_shape < 0.5 ? 1.0+floor(hash(cell+3.0)*6.0) : u_shape;
    float mask = 0.0;
    if (shape < 1.5) {
      mask = step(d.x,0.46)*step(d.y,0.12);
      mask *= step(0.36,fract(q.x*14.0));
    } else if (shape < 2.5) {
      mask = step(max(d.x,d.y),0.32);
    } else if (shape < 3.5) {
      mask = max(step(d.x,0.10)*step(d.y,0.38),step(d.y,0.10)*step(d.x,0.38));
    } else if (shape < 4.5) {
      mask = step(0.12,q.x)*step(q.x,0.88)*step(0.2,q.y)*step(q.y,0.45+floor(q.x*3.0)*0.14);
    } else if (shape < 5.5) {
      vec2 pixelD = abs((floor(q*12.0)+0.5)/12.0-0.5);
      mask = step(pixelD.x+pixelD.y,0.4);
    } else {
      float box = max(d.x,d.y);
      mask = step(box,0.36)*step(0.24,box);
    }
    float grain = mix(0.7,1.0,hash(floor(uv*u_resolution/2.0)));
    color = mix(vec3(0.75,1.0,0.26),vec3(0.30,1.0,0.86),step(0.55,hash(cell+4.0)));
    color = mix(color,vec3(1.0,0.98,0.30),step(0.88,hash(cell+7.0)));
    alpha = enabled*mask*grain*(0.45+chaos*0.3);
  } else {
    float ripple = sin(distance*27.0-u_time*1.6)*exp(-distance*1.9);
    vec2 p = uv + delta/ratio/max(distance,0.04)*ripple*0.035*u_intensity;
    p.x += sin(p.y*11.0+u_time*0.5)*0.018*u_intensity;
    float lines = grid(p,44.0);
    color = mix(ink,accent,influence);
    alpha = lines*(0.32+influence*0.55);
  }
  gl_FragColor = vec4(color,alpha*u_intensity);
}`
