

import {split, pipe, map, trim, fromPairs, replace, propEq} from 'ramda';
import {FontSourceMapElement, Context} from '../../def/index';
import * as PIXI from 'pixi.js';

const chunkToJSON = (sources: string[]) => {
  return (
  fromPairs(
    sources.map((source: string) => {
      const [key, _value] = split('=', source);
      const value = replace(/'/g, '', _value);
      return [key, value];
    })));
};

export function fnt2js(context: Context, source: string): FontSourceMapElement {
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

  const infos =
    chunkData
      .filter(([type]: string[]) => type === 'info')
      .map(([, ...source]: string[]) => chunkToJSON(source))
      .map((e) =>({
        face: e.face || '',
        size: Number(e.size || 10),
      }));
  const maxSize = infos.map((e)=>e.size).reduce((a, b) => a > b ? a : b, 0);

  const common = 
    chunkData
      .filter(([type]: string[]) => type === 'common')
      .map(([, ...source]: string[]) => chunkToJSON(source))
      .map((e) => ({
        lineHeight: Number(e.lineHeight || maxSize),
        xadvance: Number(e.xadvance || maxSize),
      }));

  const pages = 
    chunkData
      .filter(([type]: string[]) => type === 'page')
      .map(([, ...source]: string[]) => chunkToJSON(source))
      .map((e) => ({
          id: Number(e.id || 0),
          file: e.file || '',
      }));

  const chars = 
    chunkData
      .filter(([type]: string[]) => type === 'char')
      .map(([, ...source]: string[]) => chunkToJSON(source))
      .map((e) => {
        const char = {
          id: e.id,
          page: Number(e.page || 0),
          img: String(e.img || ''),
          x: Number(e.x || 0),
          y: Number(e.y || 0),
          width: Number(e.width || 10),
          height: Number(e.height || 10),
          xoffset: Number(e.xoffset || 0),
          yoffset: Number(e.yoffset || 0),
          xadvance: Number(e.xadvance || 0),
        };
        char.xadvance = char.xadvance === 0 && common.length > 0 ? common[0].xadvance : char.xadvance;

        if (e.img !== undefined) {
          const atlasConfs = context.selectTextureAtlasConfig(propEq(e.img, 'id'));
          if (atlasConfs.length > 0) {
            const rect = atlasConfs[0].rect;
            char.width = rect.width;
            char.height = rect.height;
          }
        }
        return char;
      });

      const data = new PIXI.BitmapFontData();      
      infos.map((e)=>data.info.push(e));
      if (data.info.length == 0) {
        data.info.push({face: '', size: 10});
      }
      common.map((e)=>data.common.push(e));
      if (data.common.length == 0) {
        data.common.push({lineHeight: maxSize});
      }      
      chars.map((e)=>data.char.push(e));
      pages.map((e)=>data.page.push(e));
      if (data.page.length == 0) {
        const imgs = [...new Set(chars.map((e)=>e.img))];
        imgs.map((e, i)=>{
          data.page.push({id: i, file: e});
        });
        data.char.map((e, i)=>{
          e.page = imgs.indexOf(chars[i].img);
        });
      }

  return {data};
}
