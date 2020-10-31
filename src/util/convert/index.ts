import {is} from 'ramda';

export function bool(source: string) {
  if (is(String, source)) return source === 'true';

  return Boolean(source);
}

export function number(source: string) {
  if (isNaN(Number(source))) return source;

  return Number(source);
}
