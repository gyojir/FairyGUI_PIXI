export interface ResourceElement{
  name: 'image' | 'swf' | 'movieclip' | 'sound' | 'index' | 'font' | 'atlas' | 'misc';
  attributes: ResourceAttribute;
}

export interface ResourceAttribute{
  id: string;
  name: string;
  size: string;
  scale: '9grid' | 'tile';

  // after process
  _type: PickType<ResourceElement, 'name'>;
  _size: {width: number, height: number};
}


export interface ResourceAttributesFor9Grid extends ResourceAttribute {
  scale9grid: string;
  gridTile: string;

  _scale9grid?: number[];
  _tiledSlices?: number;
}

export interface ResourceAttributesForTile extends ResourceAttribute {
  _scaleByTile: boolean;
}


export interface ResourceAttributesForAtlas extends ResourceAttribute {
  file: string;
}

export interface SourceAttributes {
  name: string;
  id: string;

  // use in assign
  size: string;
  scale?: string;
  xy?: string;
  rotation?: number;
  skew?: string;
  anchor?: 'true' | 'false';
  pivot?: string;
  alpha?: string;
  visible?: 'true' | 'false';
  group?: string;

  filter?: string;
  filterData?: string;
  blend?: keyof typeof PIXI.BLEND_MODES;
}

export interface ComponentAttributes extends SourceAttributes{
  size: string;
  src?: string;
  extention?: string; // Button
  
  mask: string;
  reversedMask: 'true' | 'false';
  overflow: string; // hidden
}
export interface SubComponentAttributes extends SourceAttributes{
  size: string;
  src: string;
}

export interface ImageAttributes extends SourceAttributes{
  src: string;
  color: string;
  size: string;
}

export interface GraphAttributes extends SourceAttributes{
  type?: string;
  lineSize: string;
  lineColor: string;
  fillColor: string;
  corner: boolean;
  size: string;
}

export interface TransitionAttributes extends SourceAttributes{
  type: 'XY' | 'Size' | 'Size' | 'Alpha' | 'Rotation' | 'Scale' | 'Skew' | 'Color' | 'Pivot' | 'Visible';
  target: string;
  autoPlay: string;
  autoPlayRepeat: string;
}

export interface TransitionAnimeAttributes{
  tween: string;
  type: string;
  target: string;
}

export interface TweenAnimeAttributes extends TransitionAnimeAttributes{
  type: 'XY' | 'Size' | 'Size' | 'Alpha' | 'Rotation' | 'Scale' | 'Skew' | 'Color' | 'Pivot' | 'Visible';

  startValue: string;
  endValue: string;
  
  duration: number;
  time: number;
  ease: string;
}

export interface KeyFrameAnimeAttributes extends TransitionAnimeAttributes{
  type: 'Transition' | 'Animation' | 'Shake' | 'XY' | 'Size' | 'Size' | 'Alpha' | 'Rotation' | 'Scale' | 'Skew' | 'Color' | 'Pivot' | 'Visible';
  
  time: number;
  value: string;
}

export interface MovieClipAttributes extends SourceAttributes{
  interval: string;
  color: string;
  frameCount: string;
  repeatDelay: string;
  swing: string;
}

export interface MovieClipSubAttributes extends SourceAttributes{
  src: string;
  interval: string;
  color: string;
}

export interface TextAttributes extends SourceAttributes{
  text: string;
  customData: string;
  
  fontSize: string;
  font?: string;
  bold?: string;
  italic?: string;
  color?: string;
  leading?: string;
  letterSpacing?: string;
  align?: AlignType;
}

export interface XmlElem {
  name: string;
  type: string;
  attributes: any;
  elements: XmlElem[];
}

export type TextureConfig = {
  id: string;
  binIndex: string;
  frame: PIXI.Rectangle;
  _index?: number;
};

export interface SourceElement extends XmlElem{
  id: string;
  name: 'image' | 'movieclip' | 'graph' | 'text' | 'component' | 'group';
  attributes: SourceAttributes;
}

export interface ComponentSourceElement extends SourceElement{
  attributes: ComponentAttributes;
}
export interface ImageSourceElement extends SourceElement{
  attributes: ImageAttributes;
}
export interface GraphSourceElement extends SourceElement{
  attributes: GraphAttributes;
}
export interface TransitionSourceElement extends SourceElement{
  attributes: TransitionAttributes;
  elements: {
    name: string;
    type: string;
    attributes: {
      yoyo: string;
      repeat: string;
    } & TransitionAnimeAttributes;
    elements: XmlElem[];
  }[];
}
export interface MovieClipSourceElement extends SourceElement{
  attributes: MovieClipAttributes;
}
export interface MovieClipSubSourceElement extends SourceElement{
  attributes: MovieClipSubAttributes;
}
export interface TextSourceElement extends SourceElement{
  attributes: TextAttributes;
}

export interface Transition {
  [x: string]: ExtendedAnimeInstance;
}

export interface FComponent extends PIXI.Container{
  id?: string;  
  __width?: number;
  __height?: number;
  blendMode?: PIXI.BLEND_MODES;
  transition?: Transition;
  tint: number;
  anim?: PIXI.AnimatedSprite;
  content?: PIXI.DisplayObject; // text
  group?: string;
  
  anchor?: {
    x: number;
    y: number;
    set: (newX: number, newY: number) => void
  };

  list?: {
    visible: boolean;
    position: {
      x: number;
      y: number;
    };
  }[];

  updateMask?: (rect: { x?: number, y?: number, width?: number, height?: number }) => void;
}

export type AlignType = 'right' | 'left' | 'center';

export type PickType<T, K extends keyof T> = T[K];


export function isRGB(arg: any): arg is {
  r: number,
  g: number,
  b: number
} {
  return (
    arg.r !== undefined &&
    arg.g !== undefined &&
    arg.b !== undefined
  );
}

export interface ExtendedAnimeInstance extends anime.AnimeInstance {
  name?: string;
}

export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      `Expected 'val' to be defined, but received ${val}`
    );
  }
}
