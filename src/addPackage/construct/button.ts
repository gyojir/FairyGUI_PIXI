import * as PIXI from 'pixi.js';
import {map, curry, reduce, find, mergeAll} from 'ramda';
import {toPair, search} from '../../util';
import {SourceMapElement, FComponent, XmlElem} from '../../def/index';

export const Button = (source: SourceMapElement) => (it: FComponent) => {
  it.interactive = true;
  it.cursor = 'pointer';;

  it
    .on('pointerdown', onButtonDown)
    .on('pointerover', onButtonOver)
    .on('pointerup', onButtonUp)
    .on('pointerout', onButtonOut)
    .on('pointerupoutside', onButtonUpOutSide);

  const pages =
    mergeAll(
      map(getImage)(
        ((arr) => ([] as XmlElem[]).concat(arr))(
          search(({name}: XmlElem) => name === 'image' || name === 'graph', source))));

  setState(0);

  return it;

  function getImage({attributes, elements}: XmlElem) {
    const image = it.getChildByName(attributes.name);
    const indexes = toPair(find(({name}: {name: string}) => name === 'gearDisplay', elements)?.attributes.pages);

    if (image == null){
      return {};
    }

    return reduce<number, {[x: number]: PIXI.DisplayObject}>((pages, index) => {
      pages[index] = image;
      return pages;
    }, {}, indexes);
  }

  function setState(state: number) {
    Object.values(pages).forEach((v) => v.visible = false);
    pages[state].visible = true;
  }

  function onButtonUp(event: PIXI.FederatedPointerEvent) {
    setState(2);
    it.emit('buttonUp');
  }

  function onButtonDown(event: PIXI.FederatedPointerEvent) {
    setState(1);
    it.emit('buttonDown');
  }

  function onButtonOver(event: PIXI.FederatedPointerEvent) {
    setState(2);
    it.emit('buttonOver');
  }

  function onButtonOut(event: PIXI.FederatedPointerEvent) {
    setState(0);
    it.emit('buttonOut');
  }

  function onButtonUpOutSide(event: PIXI.FederatedPointerEvent) {
    setState(0);
    it.emit('buttonUpOutSide');
  }
};
