

import {cursor, removeComment, decodeToUTF8} from '../../util';
import {pipe} from 'ramda';

import pako from 'pako';

/*
 * DeCompress the ArrayBuffer To UTF-8 String
 */
function decompressToString(buffer: ArrayBuffer) {
  const decompressData = pako.inflate(new Uint8Array(buffer), { to: "string" });

  return decodeToUTF8(decompressData);
}

/*
 * Split the huge source into a map.
 */
function tokenization(source: string) {
  const {
    find,
    takeTo,
    moveTo,
    current,
  } = cursor(source);

  return recursion({});

  function recursion(result:  {[x : string]: string}): {[x: string]: string} {
    //  Read
    const key = take(find('|'));
    const size = Number(take(find('|')));
    const value = take(current() + size);

    //  Write
    result[key] = value;

    moveTo(current() - 1);

    return find('|') < 0 ? result : recursion(result);
  }

  function take(targetPos: number) {
    const token = removeComment(takeTo(targetPos));

    moveTo(targetPos + 1);

    return token;
  }
}

/*
 *  The source is compressed binary data with type ArrayBuffer,
 *  after decompress,
 *  the source become a multiple xml config concatenation,
 *  a single chunk display like this
 *     [source key] | [source value size] | [source value]
 *
 *  parse them into a map
 *     { key : source }
 *
 */
function getFairyConfigMap(source: ArrayBuffer) {
  return pipe(decompressToString, tokenization)(source);
}

export {getFairyConfigMap};
