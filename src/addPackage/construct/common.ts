import * as PIXI from 'pixi.js';
import {toPair} from '../../util';
import {radians} from '../../core/physic';
import {FComponent, SourceAttributes} from '../../def/index';
import {split} from 'ramda';

export function assign(it: FComponent, attributes: SourceAttributes): FComponent {
  //  Id
  it.id = attributes.id || '';

  //  Name
  it.name = attributes.name || '';

  //  Size
  if (attributes.size) {
    const [width, height] = toPair(attributes.size);
    it.width = width;
    it.height = height;

    if (it.filterArea) {
      it.filterArea.width = width;
      it.filterArea.height = height;
    }
  }

  //  Scale
  if (attributes.scale) {
    const [scaleX, scaleY] = toPair(attributes.scale);
    it.scale.set(scaleX, scaleY);
  }

  //  Position
  if (attributes.xy) {
    const [x, y] = toPair(attributes.xy);
    it.position.set(x, y);
  }

  //  Rotation
  if (attributes.rotation) {
    it.rotation = radians(attributes.rotation);
  }

  //  Skew
  if (attributes.skew) {
    const [skewX, skewY] = toPair(attributes.skew);
    it.skew.set(-1 * radians(skewX), radians(skewY));
  }

  //  Anchor
  if (attributes.anchor === 'true' && attributes.pivot) {
    const [pivotX, pivotY] = toPair(attributes.pivot);
    it.anchor?.set(pivotX, pivotY);
  }

  //  Alpha
  if (attributes.alpha) {
    it.alpha = Number(attributes.alpha);
  }

  //  Visible
  if (attributes.visible === 'false') {
    it.visible = false;
  }

  // Group
  if (attributes.group) {
    it.group = attributes.group;
  }

  //  Interactive
  // it.interactive = false;

  return it;
}

export function assignBlendMode(comp: FComponent, filters: PIXI.Filter[] | null, attributes: SourceAttributes): void {
  //  Blend Mode
  if (attributes.blend) {
    const blendMode = PIXI.BLEND_MODES[attributes.blend.toUpperCase() as keyof typeof PIXI.BLEND_MODES];

    if (attributes.filter) {
      filters?.forEach((filter) => filter.blendMode = blendMode);
    }
    else {
      comp.blendMode = blendMode;
    }
  }
}

export function createFilter(attributes: SourceAttributes): PIXI.Filter | undefined {
  //  Filter
  if (attributes.filter === 'color' && attributes.filterData) {
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

    return filter;
  }

  return undefined;
}

export function getAtlasName(id: string, atlasIndex: string) {
  return Number(atlasIndex) >= 0 ? `atlas${atlasIndex}` : `atlas_${split('_', id)[0]}`;
}
