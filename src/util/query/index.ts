import {filter} from 'ramda';
import {XmlElem} from '../../def/index';

export const select = function<T>(predicate: (t: T) => boolean, target: T[]) {
  const result = filter(predicate, target);
  return result;
};

export const search = function<T extends XmlElem>(predicate: (t: XmlElem) => boolean, data: T): T[] {
  const result = recursion(data);
  return result;

  function recursion<T extends XmlElem>(data: T, result: T[] = []) {
    if (predicate(data)) {
      result.push(data);
    }

    const {
      elements,
    } = data;
    if (elements && elements.length) {
      for (const element of elements) {
        recursion(element, result);
      }
    }

    return result;
  }
};
