import {Container} from 'pixi.js';
import {divide} from 'mathjs';
import {Anchorable} from './Anchor';
import {FComponent} from '../../def/index';

export function Component(): FComponent {
  const it = new Container() as FComponent;

  Anchorable(it);

  Object.defineProperties(it, {
    height: {
      get() {
        return it.scale.y * it.getLocalBounds().height;
      },
      set(newHeight) {
        const height = it.getLocalBounds().height;
        const {y} = it.getBounds();

        const value = y < 0 ? newHeight - y : newHeight;

        it.scale.y = height !== 0 ? divide(value, height) : 1;
        it.__height = newHeight;
      },
    },
    width: {
      get() {
        return it.scale.x * it.getLocalBounds().width;
      },
      set(newWidth) {
        const width = it.getLocalBounds().width;
        const {x} = it.getBounds();

        const value = x < 0 ? newWidth - x : newWidth;

        it.scale.x = width !== 0 ? divide(value, width) : 1;
        it.__width = newWidth;
      },
    },
  });

  return it;
}
