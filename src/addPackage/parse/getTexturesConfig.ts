

import {split} from 'ramda';
import {Rectangle} from 'pixi.js';

function convert([id, binIndex, x, y, width, height]: string[]) {
  const frame = new Rectangle(Number(x), Number(y), Number(width), Number(height));

  return {id, binIndex, frame};
}

/*
 *  Return config data about How to get textures from the atlas.
 */
function getTexturesConfig(source: string) {
  return split(/\n/, source)
    .map(split(/\s/))
    .map(convert);
}

export {getTexturesConfig};
