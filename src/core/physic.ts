
import {divide, multiply, pi} from 'mathjs';
import {curry} from 'ramda';

export function radians(source: number) {
  const theta = divide(source, 180);
  return multiply(theta, pi);
}

export function milliseconds(source: number) {
  return multiply(source, 1000);
}

export const deltaTime = curry(function(rate: number, source: number) {
  const seconds = divide(source, rate);
  return milliseconds(seconds);
});
