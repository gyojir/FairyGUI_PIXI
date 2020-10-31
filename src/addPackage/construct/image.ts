import * as PIXI from 'pixi.js';
import {propEq} from 'ramda';

import {assign} from './assign';
import {getAtlasName} from './index';
import {string2hex} from '../../core/color';
import {toPair} from '../../util/string';
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
function image({attributes}: ImageSourceElement) {
  const config = temp?.selectTexturesConfig(propEq('id', attributes.src))[0];
  assertIsDefined(config);

  const it = assign(sprite(config), attributes);

  if (attributes.color) {
    it.tint = string2hex(attributes.color);
  }

  if (attributes.filter === 'color') {
    let [brightness, contrast, saturate, hue] = toPair(attributes.filterData);

    const filter = new PIXI.filters.ColorMatrixFilter();
    if (brightness) {
      filter.brightness(brightness, false);
    }
    if (contrast) {
      filter.contrast(contrast, false);
    }
    if (saturate) {
      filter.saturate(saturate, false);
    }
    if (hue) {
      hue = hue * 180 - 10;
      filter.hue(hue, false);
    }
    it.filters = [filter];
  }

  //  Blend Mode
  if (attributes.blend) {
    const blendMode = PIXI.BLEND_MODES[attributes.blend.toUpperCase() as keyof typeof PIXI.BLEND_MODES];

    if (attributes.filter) {
      it.filters[0].blendMode = blendMode;
    }
    else {
      it.blendMode = blendMode;
    }
  }

  return it;
}

export {image};
