
import {Text, BitmapText} from 'pixi.js';

import {toPair} from '../../util';
import {assign} from './assign';
import {placeHolder} from './index';

import {divide} from 'mathjs';

import {includes} from 'ramda';
import {Component} from '../override/Component';

function style({
  fontSize,
  font,
  bold,
  italic,
  color,
  leading,
  letterSpacing,
  align,
}) {
  return {
    align: align || 'left',
    fontFamily: font || 'Arial',
    fontSize: Number(fontSize),
    fontStyle: italic ? 'italic' : 'normal',
    fontWeight: bold ? 'bold' : 'normal',
    fill: color ? [color] : ['#000000'],
    leading: leading ? Number(leading) : 0,
    letterSpacing: letterSpacing ? Number(letterSpacing) : 0,
  };
}

function normal(attributes) {
  const content = new Text(attributes.text, style(attributes));

  const holder = placeHolder(...toPair(attributes.size));

  const comp = assign(Component(), attributes);
  Object.defineProperty(comp, 'text', {get: getText, set: setText});
  Object.defineProperty(comp, 'align', {get: getAlign, set: setAlign});

  setAlign(attributes.align);

  comp.addChild(holder, content);

  comp.content = content;

  return comp;

  function getAlign() {
    return content.style.align;
  }

  function setAlign(align = 'left') {
    content.style.align = align;

    if (align === 'center') content.pivot.x = content.width / 2;

    content.x = {
      right: holder.width - content.width,
      left: 0,
      center: divide(holder.width, 2),
    }[align];
  }

  function getText() {
    return content.text;
  }

  function setText(text) {
    content.text = text;
    setAlign(getAlign());
  }
}

function bitMapFont(attributes) {
  const {
    text,
    customData,
  } = attributes;

  const style = JSON.parse(customData);

  const it = new BitmapText(text, style);

  return assign(it, attributes);
}

/*
 *  Mapping text to PIXI.text or Container
 *
 *  There are two kinds of Text:
 *  1. Normal Text
 *  2. Custom Text Like BM_Font
 */
function text({
  attributes,
}) {
  if (attributes.font && includes('ui://', attributes.font)) {
    return bitMapFont(attributes);
  }

  return normal(attributes);
}

export {text};
