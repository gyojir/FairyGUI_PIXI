import * as PIXI from 'pixi.js';
import {map, filter, has, find, prop, identity} from 'ramda';

import {search, toPair} from '../../util';
import {assign, createFilter, assignBlendMode} from './common';
import {Component} from '../override/Component';
import {transition} from './transition';
import {construct} from './index';
import {Button} from './button';
import {SourceMapElement, FComponent, XmlElem, Transition, assertIsDefined, ComponentSourceMapElement, SubComponentAttributes, Context, TransitionSourceMapElement} from '../../def/index';

function subComponent(context: Context, attributes: SubComponentAttributes) {
  const source = context.getRootSource(attributes.src) as ComponentSourceMapElement;
  assertIsDefined(source);
  
  const mapByExtension = source.attributes.extention === 'Button' ? Button(source) : (it: FComponent)=>identity(it);
  const comp = mapByExtension(topComponent(context, source));

  //  Filter
  const filter = createFilter(attributes);
  if (filter) {
    comp.filters = [filter];
  }

  //  Blend Mode
  assignBlendMode(comp, comp.filters, attributes);

  return assign(comp, attributes);
}

function topComponent(context: Context, source: ComponentSourceMapElement) {
  const comp = Component() as FComponent;
  
  const it = assign(comp, source.attributes);
  it.scale.set(1, 1);

  // construct child
  const displayElements = 
    map((e: SourceMapElement) => construct(context, e))(
      prop('elements')(
        search(({name}: {name: string}) => name === 'displayList', source)[0]) as SourceMapElement[]);

  // assign group
  displayElements
    .filter(({group}) => group)
    .forEach((element) => {
      displayElements.find(({id}) => id && element.group && id === element.group)?.list?.push(element);
    });

  it.addChild(...displayElements);

  // used in transition
  context.getChild = (_id: string) => {
    const target =
      find(({attributes}: SourceMapElement) => attributes.id === _id)(
        prop('elements')(
          search(({name}: {name: string}) => name === 'displayList', source)[0]) as SourceMapElement[]);

    return it.getChildByName(target?.attributes.name || '') as PIXI.Graphics;
  };

  // transition
  const _transitions = 
    map((e: TransitionSourceMapElement)=>transition(context, e))(
      filter<XmlElem>(has('elements'))(
        ((args) => ([] as XmlElem[]).concat(args))(
          search(({name}: {name: string}) => name === 'transition', source))) as any);

  if (_transitions.length > 0) {
    it.transition = _transitions.reduce((obj: Transition, tran) => {
      if (tran.name) {obj[tran.name] = tran;}
      return obj;
    }, {});
  }

  // mask
  if (source.attributes.mask) {
    const mask = context.getChild(source.attributes.mask);
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
    const [width, height] = toPair(source.attributes.size);
    const [x, y] = toPair(source.attributes.xy || '0,0');

    const mask = new PIXI.Graphics();
    mask.name = 'mask';
    mask.beginFill(0x000);
    mask.drawRect(x, y, width, height);
    mask.endFill();
    it.addChild(mask);
    it.mask = mask;

    const originAddChild = it.addChild;
    it.addChild = function(...args) {
      const ret = originAddChild(...args);
      it.setChildIndex(mask, it.children.length - 1);
      return ret;
    };
  }

  return it;
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
export function component(context: Context, source: ComponentSourceMapElement): FComponent {
  const {attributes} = source;

  if (attributes.src !== undefined) return subComponent(context, attributes as SubComponentAttributes);

  return topComponent(context, source);
}
