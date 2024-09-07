
import * as PIXI from 'pixi.js';
import {divide} from 'mathjs';
import {includes} from 'ramda';

import {toPair} from '../../util';
import {assign} from './common';
import {placeHolder} from './index';
import {Component} from '../override/Component';
import {TextSourceMapElement, TextAttributes, FComponent, AlignType, Context} from '../../def/index';
import {string2hex} from '../../core/color';

function normal({
  text,
  fontSize,
  font,
  bold,
  italic,
  color,
  leading,
  letterSpacing,
  align,
}: TextAttributes) {
  const content = new PIXI.Text(text || '', {
    align: align || 'left',
    fontFamily: font || 'Arial',
    fontSize: Number(fontSize),
    fontStyle: italic ? 'italic' : 'normal',
    fontWeight: bold ? 'bold' : 'normal',
    fill: color ? [color] : ['#000000'],
    leading: leading ? Number(leading) : 0,
    letterSpacing: letterSpacing ? Number(letterSpacing) : 0,
  });
  return content;
}

function bitMapFont({
  text,
  font,
  color,
  align,
}: TextAttributes) {
  const content = new PIXI.BitmapText(text || '', {
    fontName: font || '',
    align: align || 'left',
    tint: color ? string2hex(color) : 0xFFFFFF,
  });
  return content;
}

/*
 *  Mapping text to PIXI.text or Container
 *
 *  There are two kinds of Text:
 *  1. Normal Text
 *  2. Custom Text Like BM_Font
 */
function text(context: Context, {attributes}: TextSourceMapElement): FComponent {
  let content : PIXI.Text | PIXI.BitmapText;
  if (attributes.font && includes('ui://', attributes.font)) {
    content = bitMapFont(attributes);
  }
  else {
    content = normal(attributes);
  }
  
  const holder = placeHolder(...toPair(attributes.size) as [number, number]);
  const comp = assign(Component(), attributes);
  Object.defineProperty(comp, 'text', {get: getText, set: setText});
  Object.defineProperty(comp, 'align', {get: getAlign, set: setAlign});
  setAlign(attributes.align);

  comp.addChild(holder, content);
  comp.content = content;
  return comp;

  function getAlign() {
    return content instanceof PIXI.Text ? content.style.align : content.align;
  }

  function setAlign(align: PIXI.TextStyleAlign = 'left') {
    if (content instanceof PIXI.Text) {
      content.style.align = align;
    }
    else {
      content.align = align;
    }

    if (align === 'center') content.pivot.x = content.width / 2;

    content.x = {
      right: holder.width - content.width,
      left: 0,
      center: divide(holder.width, 2),
      justify: 0, // todo
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

export {text};
