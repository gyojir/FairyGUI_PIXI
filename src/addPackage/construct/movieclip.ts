import * as PIXI from 'pixi.js';
import {divide} from 'mathjs';
import {propSatisfies, includes, propEq, clone} from 'ramda';

import {toPair} from '../../util';
import {assign, createFilter, assignBlendMode} from './common';
import {placeHolder} from './index';
import {getAtlasName} from './index';
import {Component} from '../override/Component';
import {string2hex} from '../../core';
import {MovieClipSourceElement, assertIsDefined, TextureConfig, ResourceAttributesForAtlas, MovieClipSubSourceElement} from '../../def/index';

function toAnimationSpeed({attributes}: MovieClipSourceElement) {
  const {interval} = attributes;
  const ms = 16.6;
  return divide(ms, Number(interval));
}

function getOffsetPerFrame(source: MovieClipSourceElement) {
  const el = source.elements[0].elements;
  return el.map((obj) => toPair(obj.attributes.rect));
}

function toFrames(src: string, offsets: number[][]) {
  let textureConfigs = temp?.selectTexturesConfig(propSatisfies(includes(src), 'id'));

  textureConfigs =
    textureConfigs
      ?.map((config) => {
        config._index = Number(config.id.split('_')[1]);
        return config;
      })
      .sort((a, b) => (a._index || 0) - (b._index || 0));

  return textureConfigs?.map(toAnimationFrame);

  function toAnimationFrame({id, binIndex, frame}: TextureConfig) {
    const atlasName = getAtlasName(id, binIndex);

    const atlasConfig = temp?.selectResourcesConfig(propEq('id', atlasName));
    assertIsDefined(atlasConfig);
    const {file} = atlasConfig as ResourceAttributesForAtlas;

    const tex = temp?.getResource(file)?.texture;
    assertIsDefined(tex);

    return new PIXI.Texture(tex.baseTexture, frame);
  }
}

/*
 *  Mapping MovieClip Type to PIXI.extra.AnimatedSprite
 */
function movieclip({attributes}: MovieClipSubSourceElement) {
  const _attr = clone(attributes);
  const _source = temp?.getSource(_attr.src);
  assertIsDefined(_source);
  const source = _source as MovieClipSourceElement;
  
  const offsets = getOffsetPerFrame(source);
  const frames = toFrames(_attr.src, offsets) || [];
  const anim = new PIXI.AnimatedSprite(frames);
  const maxFrame = frames.reduce((a, b) => {
    const rectA = a.width * a.height;
    const rectB = b.width * b.height;
    return rectA > rectB ? a : b;
  });
  const size = Math.max(maxFrame.width, maxFrame.height);
  const placeholder = placeHolder(size, size);

  const it = Component();
  it.addChild(placeholder, anim);

  //  Filter
  const filter = createFilter(attributes);
  if(filter){
    it.filters = [filter];
  }

  //  Blend Mode
  assignBlendMode(anim, it.filters, attributes);

  //  Color
  if (_attr.color) {
    anim.tint = string2hex(_attr.color);
  }
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

  it.anim = anim;
  it.anim.play();

  //  Anchor
  if (_attr.anchor === 'true' && _attr.pivot) {
    const [pivotX, pivotY] = toPair(_attr.pivot);
    it.anchor?.set(pivotX, pivotY);
    it.pivot.set(it.width * pivotX, it.height * pivotY);

    _attr.anchor = undefined;
  }

  return assign(it, _attr);
}

export {movieclip};
