import * as PIXI from 'pixi.js';
import {propEq} from 'ramda';

import {assign, createFilter, assignBlendMode} from './common';
import {getAtlasName} from './index';
import {string2hex} from '../../core/color';
import {assertIsDefined, TextureConfig, ResourceAttributesForAtlas, ResourceAttributesFor9Grid, ImageSourceElement, FComponent} from '../../def/index';

function sprite({id, binIndex, frame}: TextureConfig) {
  const atlasName = getAtlasName(id, binIndex);
  const atlasConfig = temp?.selectResourcesConfig(propEq('id', atlasName)) as ResourceAttributesForAtlas | undefined;
  assertIsDefined(atlasConfig);
  const {file} = atlasConfig;

  const for9grid = temp?.selectResourcesConfig(propEq('id', id)) as ResourceAttributesFor9Grid | undefined;
  assertIsDefined(for9grid);
  const {_scale9grid} = for9grid;
  
  const tex = temp?.getResource(file).texture;
  assertIsDefined(tex);

  const texture = new PIXI.Texture(tex.baseTexture, frame);

  if (_scale9grid) {
    const [a, b, c, d] = _scale9grid;
    const {width, height} = texture;

    const leftWidth = a;
    const topHeight = b;
    const bottomHeight = height - (b + d);
    const rightWidth = width - (a + c);

    return new PIXI.NineSlicePlane(texture, leftWidth, topHeight, bottomHeight, rightWidth);
  }

  return new PIXI.Sprite(texture) as FComponent;
}

/*
 *  Mapping FairyGUI Image Type to PIXI.Sprite or PIXI.mesh.NineSlicePlane
 */
function image({attributes}: ImageSourceElement): FComponent {
  const config = temp?.selectTexturesConfig(propEq('id', attributes.src))[0];
  assertIsDefined(config);

  const it = assign(sprite(config), attributes);

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

export {image};
