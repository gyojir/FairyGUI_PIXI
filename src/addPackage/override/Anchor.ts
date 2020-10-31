import {FComponent, assertIsDefined} from '../../def/index';

export function Anchorable(it: FComponent) {
  let anchorX = 0;
  let anchorY = 0;

  it.anchor = {
    get x() {
      return anchorX;
    },
    set x(newX) {
      anchorX = newX;
      it.pivot.x = newX * (it.__width || 0);
    },
    get y() {
      return anchorY;
    },
    set y(newY) {
      anchorY = newY;
      it.pivot.y = newY * (it.__height || 0);
    },
    set(newX, newY) {
      assertIsDefined(it.anchor);
      it.anchor.x = newX;
      it.anchor.y = newY;
    },
  };

  return it;
}
