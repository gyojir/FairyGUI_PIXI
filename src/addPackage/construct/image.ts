import * as PIXI from 'pixi.js';
import {propEq} from 'ramda';

import {assign, createFilter, assignBlendMode, getAtlasName} from './common';
import {string2hex} from '../../core/color';
import {assertIsDefined, ResourceAttributesForAtlas, ResourceAttributesFor9Grid, ImageSourceMapElement, FComponent, Context} from '../../def/index';

function sprite(context: Context, src: string) {
  const config = context.selectTextureAtlasConfig(propEq(src, 'id'))[0];
  assertIsDefined(config);
  const {id, atlasIndex, rect} = config;
  
  // get atlas filename
  const atlasName = getAtlasName(id, atlasIndex);
  const atlasConfig = context.selectResourcesConfig(propEq(atlasName, 'id')) as ResourceAttributesForAtlas;
  assertIsDefined(atlasConfig);
  // get atlas texture
  const texRes = context.getResource(atlasConfig.file);
  assertIsDefined(texRes);
  const texture = new PIXI.Texture(texRes.baseTexture, rect);

  // 9grid
  const resourceConf = context.selectResourcesConfig(propEq(id, 'id'));
  assertIsDefined(resourceConf);
  const {_scale9grid} = resourceConf as ResourceAttributesFor9Grid;
  if (_scale9grid) {
    const [a, b, c, d] = _scale9grid;
    const {width, height} = texture;

    const leftWidth = a;
    const topHeight = b;
    const bottomHeight = height - (b + d);
    const rightWidth = width - (a + c);

    return new PIXI.NineSlicePlane(texture, leftWidth, topHeight, bottomHeight, rightWidth);
  }

  return new PIXI.Sprite(texture);
}

/*
 *  Mapping FairyGUI Image Type to PIXI.Sprite or PIXI.mesh.NineSlicePlane
 */
function image(context: Context, {attributes}: ImageSourceMapElement): FComponent {
  const it = assign(sprite(context, attributes.src), attributes);

  if (attributes.color) {
    it.tint = string2hex(attributes.color);
  }
  
  const filter = createFilter(attributes);
  if (filter) {
    it.filters = [filter];
  }
  
  //  Blend Mode
  assignBlendMode(it, it.filters, attributes);

  return it;
}

export {image, sprite};
