

import {split} from 'ramda';
import {Rectangle} from 'pixi.js';
import {TextureAtlasConfig} from '../../def/index';

function convert([id, atlasIndex, x, y, width, height]: string[]): TextureAtlasConfig {
  const rect = new Rectangle(Number(x), Number(y), Number(width), Number(height));

  return {id, atlasIndex, rect};
}

/*
 *  Return config data about How to get textures from the atlas.
 */
function getTexturesConfig(source: string): TextureAtlasConfig[] {
  return split(/\n/, source)
    .map(split(/\s/))
    .map(convert);
}

export {getTexturesConfig};
