import {radians} from './physic';
import {string2hex, rgbToHex} from './color';
import {bool} from '../util';

export function position(x: number, y: number) {
  return {x, y};
}

export function size(width: number, height: number) {
  return {width, height};
}

export function scale(x: number, y: number) {
  return {x, y};
}

export function alpha(alpha: number) {
  return {alpha};
}

export function rotation(_rotation: number) {
  const rotation = radians(_rotation);
  return {rotation};
}

export function skew(x: number, y: number) {
  return {
    x: -1 * radians(x),
    y: radians(y),
  };
}

export function tint({
  r,
  g,
  b,
}:
{
  r: number,
  g: number,
  b: number
}) {
  return string2hex(rgbToHex(r, g, b));
}

export function pivot(x: number, y: number) {
  return {x, y};
}

export function visible(visible: string) {
  return {visible: bool(visible)};
}

export * from './color';
export * from './physic';
