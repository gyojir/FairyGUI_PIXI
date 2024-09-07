import * as PIXI from 'pixi.js';
import {randomInt} from 'mathjs';
import {nextFrame} from '../../util';

export function shake({
  targets,
  duration = 0,
  amplitude = 0,
}: {
  targets: PIXI.DisplayObject[] | PIXI.DisplayObject,
  duration: number,
  amplitude: number,
}) {
  if (!Array.isArray(targets)) targets = [targets];

  const range: [number, number] = [-1 * amplitude, amplitude];
  const begin = new Date();
  const tasks = targets.map((target) => call(target));

  return Promise.all(tasks);

  async function call(target: PIXI.DisplayObject, pos?: {x:number, y: number}): Promise<PIXI.DisplayObject> {
    pos = pos || {x: target.x, y: target.y};

    Object.assign(target, {
      x: pos.x + randomInt(...range),
      y: pos.y + randomInt(...range),
    });

    await nextFrame();
    return isTimeout() ? Object.assign(target, pos) : call(target, pos);
  }

  function isTimeout() {
    const now = new Date();
    return now.getTime() - begin.getTime() > duration;
  }
}
