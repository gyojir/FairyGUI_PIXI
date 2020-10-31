import * as PIXI from 'pixi.js';
import {map, filter, has, find, prop, identity} from 'ramda';

import {search, toPair} from '../../util';
import {assign} from './assign';
import {Component} from '../override/Component';
import {transition} from './transition';
import {construct} from './index';
import {Button} from './button';
import {SourceElement, FComponent, XmlElem, Transition, assertIsDefined, ComponentSourceElement, ComponentAttributes, SubComponentAttributes} from '../../def/index';

function subComponent(attributes: SubComponentAttributes) {
  const _source = temp?.getSource(attributes.src);
  assertIsDefined(_source);
  const source = _source as ComponentSourceElement;
  
  const mapByExtension = source.attributes.extention === 'Button' ? Button(source) : (it: FComponent)=>identity(it);
  const comp = mapByExtension(topComponent(source));

  //  Filter
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
      filter.hue(hue * 180 - 10, false);
    }

    comp.filters = [filter];
  }

  //  Blend Mode
  if (attributes.blend) {
    const blendMode = PIXI.BLEND_MODES[attributes.blend.toUpperCase() as keyof typeof PIXI.BLEND_MODES];

    if (attributes.filter) {
      comp.filters.forEach((filter) => filter.blendMode = blendMode);
    }
    else {
      comp.blendMode = blendMode;
    }
  }

  return assign(comp, attributes);
}

function topComponent(source: ComponentSourceElement) {
  const comp = Component() as FComponent;

  const displayElements = 
    map(construct)(
      prop('elements')(
        search(({name}: {name: string}) => name === 'displayList', source)[0]) as SourceElement[]);

  displayElements
    .filter(({group}) => group)
    .forEach((element) => {
      displayElements.find(({id}) => id && element.group && id === element.group)?.list?.push(element);
    });

  comp.addChild(...displayElements);

  if (temp) {
    temp.getChild = (_id: string) => {
      const target =
        find(({attributes}: SourceElement) => attributes.id === _id)(
          prop('elements')(
            search(({name}: {name: string}) => name === 'displayList', source)[0]) as SourceElement[]);

      return comp.getChildByName(target?.attributes.name || '') as PIXI.Graphics;
    };
  }

  const _transitions = 
    map(transition)(
      filter<XmlElem>(has('elements'))(
        ((args) => ([] as XmlElem[]).concat(args))(
          search(({name}: {name: string}) => name === 'transition', source))) as any);

  if (_transitions.length > 0) {
    comp.transition = _transitions.reduce((obj: Transition, tran) => {
      if (tran.name && obj[tran.name]) {obj[tran.name] = tran;}
      return obj;
    }, {});
  }

  const it = assign(comp, source.attributes);
  it.scale.set(1, 1);

  if (source.attributes.mask) {
    const mask = temp?.getChild(source.attributes.mask);
    const comp = JSON.parse(JSON.stringify(it.getLocalBounds()));

    if (mask) {
      if (source.attributes.reversedMask === 'true') {
        const reversedMask = new PIXI.Graphics();
        drawReversedMask(comp, mask, reversedMask);

        it.addChild(reversedMask);
        it.mask = reversedMask;

        it.updateMask = function({x, y, width, height}) {
          if (width !== undefined) {
            mask.x -= width - mask?.width;
            mask.width = width;
          }
          if (height !== undefined) {
            mask.y -= height - mask.height;
            mask.height = height;
          }
          if (x !== undefined) mask.x = x;
          if (y !== undefined) mask.y = y;

          drawReversedMask(comp, mask, reversedMask);
        };
      }
      else {
        it.mask = mask;

        it.updateMask = function({x, y, width, height}) {
          if (x !== undefined) mask.x = x;
          if (y !== undefined) mask.y = y;
          if (width !== undefined) mask.width = width;
          if (height !== undefined) mask.height = height;
        };
      }
    }
  }

  if (source.attributes.overflow === 'hidden') {
    hidden(source.attributes);
  }

  return it;

  function hidden(attributes: ComponentAttributes) {
    const mask = new PIXI.Graphics();
    mask.name = 'mask';
    mask.beginFill(0x000);

    const [width, height] = toPair(attributes.size as string);
    const [x, y] = toPair(attributes.xy || '0,0');

    mask.drawRect(x, y, width, height);
    mask.endFill();

    it.addChild(mask);
    it.mask = mask;

    it._addChild = it.addChild;
    it.addChild = function(...args) {
      assertIsDefined(it._addChild);
      const ret = it._addChild(...args);
      it.setChildIndex(mask, it.children.length - 1);
      return ret;
    };

    return it;
  }
}

function drawReversedMask(comp: PIXI.Container, mask: PIXI.Graphics, it: PIXI.Graphics) {
  const holeX = Math.max(0, mask.x);
  const holeY = Math.max(0, mask.y);
  const holeW = Math.min(comp.width, mask.x >= 0 ? mask.width : mask.width + mask.x);
  const holeH = Math.min(comp.height, mask.y >= 0 ? mask.height : mask.height + mask.y);

  it.clear();

  return it.beginFill(0xffff0b).drawRect(0, 0, comp.width, comp.height).beginHole().drawRect(holeX, holeY, holeW, holeH).endHole().endFill();
}

/*
 *  Mapping FairyGUI component Type to PIXI.Container
 *
 *  Typically, there are two kind of component.
 *  1. topComponent like Scene in the Game.
 *  2. subComponent is a collection contains other elements.
 */
export function component(source: ComponentSourceElement) {
  const {attributes} = source;

  if (attributes.src !== undefined) return subComponent(attributes as SubComponentAttributes);

  return topComponent(source);
}
