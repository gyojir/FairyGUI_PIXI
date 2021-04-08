
import * as PIXI from 'pixi.js';
import {divide} from 'mathjs';
import {includes} from 'ramda';

import {toPair} from '../../util';
import {assign} from './common';
import {placeHolder} from './index';
import {Component} from '../override/Component';
import {TextSourceMapElement, TextAttributes, FComponent, AlignType, Context} from '../../def/index';

function style({
  fontSize,
  font,
  bold,
  italic,
  color,
  leading,
  letterSpacing,
  align,
}: TextAttributes) {
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

function normal(attributes: TextAttributes) {
  const content = new PIXI.Text(attributes.text, style(attributes));
  const holder = placeHolder(...toPair(attributes.size) as [number, number]);
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

  function setAlign(align: AlignType = 'left') {
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

  function setText(text: string) {
    content.text = text;
    setAlign(getAlign());
  }
}

function bitMapFont(attributes: TextAttributes) {
  const {text, font} = attributes;
  const it = new PIXI.BitmapText(text, {
    fontName: font || "",
  });

  return assign(it as FComponent, attributes);
}

/*
 *  Mapping text to PIXI.text or Container
 *
 *  There are two kinds of Text:
 *  1. Normal Text
 *  2. Custom Text Like BM_Font
 */
function text(context: Context, {attributes}: TextSourceMapElement) {
  if (attributes.font && includes('ui://', attributes.font)) {
    return bitMapFont(attributes);
  }

  return normal(attributes);
}

export {text};
