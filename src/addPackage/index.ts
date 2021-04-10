import * as PIXI from 'pixi.js';
import {xml2js} from 'xml-js';
import {propEq, omit, split, toPairs, map, fromPairs} from 'ramda';

import {getFairyConfigMap} from './parse/getFairyConfigMap';
import {getTexturesConfig} from './parse/getTexturesConfig';
import {getResourcesConfig} from './parse/getResourcesConfig';
import {fnt2js} from './parse/fnt2js';
import {select} from '../util';
import {construct} from './construct';
import {TextureAtlasConfig, SourceMapElement, assertIsDefined, XmlElem, ResourceAttribute, ResourceAttributesFont, Context, FontSourceMapElement} from '../def/index';
import {sprite} from './construct/image';

/**
 *   >  Analysing Fairy Config File
 *   >  and return a factory function.
 *
 *   ### Notice
 *   >  Make sure all Resources used by the package were loaded.
 *   >  This Function use PIXI.Application built-in loader
 *   >  to fetch necessary resources.
 *
 *   ### Example
 *   ```
 *   // Suppose your config filename is package1.fui
 *   const create = addPackage(app, 'package1');
 *
 *   // Suppose 'main' is your component name.
 *   const mainComp = create('main');
 *
 *   app.stage.addChild(mainComp);
 *   ```
 *
 * @param {PIXI.Application} app
 * @param {string} packageName
 * @return { function(string): PIXI.Container }
 */
function addPackage(app: {loader: PIXI.Loader}, packageName: string) {
  //  Temp Global
  let context: Context = {
    getRootSource,
    selectResourcesConfig,
    selectTextureAtlasConfig,
    getResource,
    getChild: () => new PIXI.Graphics(),
  };

  //  XML Source Map contains xml source code mapping by config name.
  const xmlSourceMap = 
    getFairyConfigMap(
      getBinaryData(packageName));

  //  Resources Config contains all resources configs used by this package.
  const packageXml = xml2js(xmlSourceMap['package.xml']) as XmlElem;
  const resourcesConfig = getResourcesConfig(packageXml);

  //  textures Config describe how to use atlas file.
  const textureAtlasConfig: TextureAtlasConfig[] =
    getTexturesConfig(xmlSourceMap['sprites.bytes']);

  //  Convert other source (compenents, fonts) into JavaScript object.
  const sourceMap = 
    fromPairs(
      map(bySourceType)(
        toPairs(
          omit(['package.xml', 'sprites.bytes'])(xmlSourceMap))));

  // install BitMapFont
  select(propEq('_type', "font"), resourcesConfig).map(e=>{
    const fontAttribute = e as ResourceAttributesFont;
    const font = sourceMap[fontAttribute._rawId] as FontSourceMapElement;
    const info = font.data.info[0] || {face: ""};
    info.face = 'ui://' + fontAttribute.id; // overwrite font name

    if(fontAttribute.texture){
      const fontTexture = sprite(context, fontAttribute.texture);
      PIXI.BitmapFont.install(font.data, fontTexture.texture);
    }
    else {
      const textures = font.data.page.map(e=> sprite(context, e.file).texture);
      PIXI.BitmapFont.install(font.data, textures);
    }
  });


  return create;

  function bySourceType([sourceKey, sourceStr]: [string, string]): [string, SourceMapElement | FontSourceMapElement] {
    const [key, type] = split('.', sourceKey);
    
    const value =
      (type === 'xml') ? xml2js(sourceStr).elements[0] :
      (type === 'fnt') ? fnt2js(context, sourceStr) : undefined;

    return [key, value];
  }

  /**
   * > The Function create can take specify component name,
   * > which you created by fairyGUI Editor
   * > and return the PIXI.Container for that entity.
   *
   * @param {string} resName
   * @return {PIXI.Container}
   */
  function create(resName: string) {

    const id = findIdBy(resName);
    const result = construct(context, sourceMap[id] as SourceMapElement);

    result.name = resName;

    return result;
  }

  function getRootSource(key: string) {
    return sourceMap[key];
  }

  function selectResourcesConfig<Pred extends(x: ResourceAttribute) => boolean>(predicate: Pred) {
    const configs = select(predicate, resourcesConfig);
    assertIsDefined(configs[0]);
    return configs[0];
  }

  function selectTextureAtlasConfig<Pred extends(x: TextureAtlasConfig) => boolean>(predicate: Pred) {
    const configs = select(predicate, textureAtlasConfig);
    return configs;
  }

  function findIdBy(resName: string) {
    return selectResourcesConfig(propEq('name', resName)).id;
  }

  function getResource(name: string) {
    return app.loader.resources[packageName + '@' + name];
  }

  function getBinaryData(packageName: string): ArrayBuffer {
    return app.loader.resources[packageName + '.fui'].data;
  }
}

export {addPackage};
