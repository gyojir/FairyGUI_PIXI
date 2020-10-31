

import {split, pipe, map, trim, fromPairs, evolve, replace} from 'ramda';

const chunkToJSON = (sources: string[]) => (
  fromPairs(
    sources.map((source: string) => {
      const [key, _value] = split('=', source);
      const value = replace(/"/g, '', _value);
      return [key, value];
    }))
);

function toFontData([, ...source]: string[]) {
  return pipe(
    chunkToJSON,
    
    evolve({
      id: String.fromCodePoint,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      xoffset: Number,
      yoffset: Number,
    })
  )(source);
}

export function fnt2js(source: string) {
  const chunkData = pipe(
    trim,    
    split(/\n/),

    map(
      pipe(
        trim,
        split(/\s+/)
      )
    )
  )(source);

  const {file} = 
    chunkData
      .filter(([type]: string[]) => type === 'page')
      .map(([, ...source]: string[]) => chunkToJSON(source))[0];

  const chars = 
    chunkData
      .filter(([type]: string[]) => type === 'char')
      .map(toFontData);

  return {file, chars};
}
