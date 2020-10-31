import {Graphics} from 'pixi.js';

import {toPair} from '../../util';
import {string2hex} from '../../core';
import {assign} from './assign';
import {Anchorable} from '../override/Anchor';
import {FComponent, GraphAttributes, GraphSourceElement} from '../../def/index';

function preprocess(attributes: GraphAttributes) {
  const lineSize = attributes.lineSize ? Number(attributes.lineSize) : 1;
  const lineColor = string2hex(attributes.lineColor || '#ff000000');
  const fillColor = string2hex(attributes.fillColor || '#ffffffff');
  const func = mapFuncBy(attributes);
  const size = mapSizeBy(func, attributes);

  return {func, lineSize, lineColor, fillColor, size};
}

function mapFuncBy({type, corner}: GraphAttributes) {
  if (type === 'eclipse') {
    return 'drawEllipse';
  }
  if (type === 'rect') {
    if (corner) {
      return 'drawRoundedRect';
    }
    return 'drawRect';
  }

  throw new Error('Invalid graph type.');
}

function rectangle(size: string) {
  const [width, height] = toPair(size);
  const x = 0;
  const y = 0;

  return [x, y, width, height];
}

function ellipse(size: string) {
  const [w, h] = toPair(size);
  const x = w / 2;
  const y = h / 2;
  const width = w / 2;
  const height = h / 2;

  return [x, y, width, height];
}

function mapSizeBy(func: string, {size, corner}: GraphAttributes) {
  if (func === 'drawEllipse') return ellipse(size);
  if (func === 'drawRect') return rectangle(size);
  if (func === 'drawRoundedRect') {
    return [...rectangle(size), Number(corner)];
  }
  return [0, 0, 0, 0];
}

function setGraphics({
  func,
  lineSize,
  lineColor,
  fillColor,
  size,
}: {
  func: string,
  lineSize: number,
  lineColor: number,
  fillColor: number,
  size: number[],
}) {
  const it = new Graphics();

  const lineAlpha = (lineColor >>> 24) / 0xFF;
  it.lineStyle(lineSize, lineColor, lineAlpha);

  const fillAlpha = (fillColor >>> 24) / 0xFF;
  it.beginFill(fillColor, fillAlpha);

  (it as any)[func]?.(...size);

  it.endFill();

  return it;
}

/*
 *  Mapping graph to PIXI.Graphics
 */
function graph({attributes}: GraphSourceElement) {
  const graphics: FComponent =
    attributes.type ? setGraphics(preprocess(attributes)) : new Graphics();

  Anchorable(graphics);

  return assign(graphics, attributes);
}

export {graph};
