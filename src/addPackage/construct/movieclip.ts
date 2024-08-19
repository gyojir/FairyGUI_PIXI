import * as PIXI from 'pixi.js';
import {divide} from 'mathjs';
import {propSatisfies, includes, propEq, clone} from 'ramda';

import {toPair} from '../../util';
import {assign, createFilter, assignBlendMode, getAtlasName} from './common';
import {placeHolder} from './index';
import {Component} from '../override/Component';
import {string2hex} from '../../core';
import {MovieClipSourceMapElement, assertIsDefined, TextureAtlasConfig, ResourceAttributesForAtlas, MovieClipSubSourceMapElement, Context} from '../../def/index';

function toAnimationSpeed({attributes: {interval}}: MovieClipSourceMapElement) {
  const ms = 16.6;
  return divide(ms, Number(interval));
}

function getOffsetPerFrame(source: MovieClipSourceMapElement) {
  const el = source.elements[0].elements;
  return el.map((obj) => toPair(obj.attributes.rect));
}

function toFrames(context: Context, src: string, offsets: number[][]) {
  let textureConfigs =
    context.selectTextureAtlasConfig(propSatisfies(includes(src), 'id')) // collect textureConfig like 'id == {src}_{index}'
      .map((config) => {
        let _config = config as TextureAtlasConfig & {_index: number};
        _config._index = Number(config.id.split('_')[1]);
        return _config;
      })
      .sort((a, b) => a._index - b._index)
      .map(toAnimationFrame);
  return textureConfigs;

  function toAnimationFrame({id, atlasIndex, rect}: TextureAtlasConfig) {
    const atlasName = getAtlasName(id, atlasIndex);
    const atlasConfig = context.selectResourcesConfig(propEq('id', atlasName)) as ResourceAttributesForAtlas;
    assertIsDefined(atlasConfig);
    const texRes = context.getResource(atlasConfig.file)?.texture;
    assertIsDefined(texRes);

    return new PIXI.Texture(texRes.baseTexture, rect);
  }
}

/*
 *  Mapping MovieClip Type to PIXI.extra.AnimatedSprite
 */
function movieclipById(context: Context, src: string) {
  const source = context.getRootSource(src) as MovieClipSourceMapElement;
  assertIsDefined(source);
  
  const offsets = getOffsetPerFrame(source);
  const frames = toFrames(context, src, offsets) || [];
  const anim = new PIXI.AnimatedSprite(frames);
  const maxFrame = frames.reduce((a, b) => {
    const rectA = a.width * a.height;
    const rectB = b.width * b.height;
    return rectA > rectB ? a : b;
  });

  anim.animationSpeed = toAnimationSpeed(source);
  anim.onFrameChange = function(currentFrame) {
    const [offsetX, offsetY] = offsets[currentFrame];
    anim.position.set(offsetX, offsetY);
    anim.emit('change', currentFrame);

    if (currentFrame === frames.length - 1) {
      anim.emit('complete');
    }
  };
  anim.gotoAndStop(frames.indexOf(maxFrame));

  const size = Math.max(maxFrame.width, maxFrame.height);
  const placeholder = placeHolder(size, size);
  const it = Component();
  it.addChild(placeholder, anim);
  it.anim = anim;
  it.anim.play();
  return {it, anim};
}

/*
 *  Mapping MovieClip Type to PIXI.extra.AnimatedSprite
 */
function movieclip(context: Context, {attributes}: MovieClipSubSourceMapElement) {
  const _attr = clone(attributes);
  const {it, anim} = movieclipById(context, _attr.src);

  //  Filter
  const filter = createFilter(attributes);
  if (filter) {
    it.filters = [filter];
  }

  //  Blend Mode
  assignBlendMode(anim, it.filters, attributes);

  //  Color
  if (_attr.color) {
    anim.tint = string2hex(_attr.color);
  }

  //  Anchor
  if (_attr.anchor === 'true' && _attr.pivot) {
    const [pivotX, pivotY] = toPair(_attr.pivot);
    it.anchor?.set(pivotX, pivotY);
    it.pivot.set(it.width * pivotX, it.height * pivotY);
    // skip assign
    _attr.anchor = undefined;
  }

  return assign(it, _attr);
}

export {movieclip};
