void main(void) 
{  
  vec2 texCoord = cubicvr_texCoord();

  vec4 color = cubicvr_color(texCoord);
  vec3 normal = cubicvr_normal(texCoord);
  color = cubicvr_environment(color,normal,texCoord);
  color = cubicvr_lighting(color,normal, texCoord);

  gl_FragColor = color;
}