import * as PIXI from 'pixi.js';
import {xml2js} from 'xml-js';
import {propEq, omit, split, toPairs, map, fromPairs} from 'ramda';

import {getFairyConfigMap} from './parse/getFairyConfigMap';
import {getTexturesConfig} from './parse/getTexturesConfig';
import {getResourcesConfig} from './parse/getResourcesConfig';
import {fnt2js} from './parse/fnt2js';
import {select} from '../util';
import {construct} from './construct';
import {TextureConfig, SourceElement, assertIsDefined, XmlElem, ResourceAttribute} from '../def/index';

declare global {
  var temp: {
    getSource: (key: string) => SourceElement;
    selectResourcesConfig: <Pred extends (x: ResourceAttribute) => boolean>(predicate: Pred) => ResourceAttribute;
    selectTexturesConfig: <Pred extends (x: TextureConfig) => boolean>(predicate: Pred) => TextureConfig[];
    getResource: (name: string) => PIXI.LoaderResource;
    getChild: (key: string) => PIXI.Graphics;
  } | undefined;
}

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
  //  XML Source Map contains xml source code mapping by config name.
  const xmlSourceMap = 
    getFairyConfigMap(
      getBinaryData(packageName));

  //  Resources Config contains all resources configs used by this package.
  const resourcesConfig = 
    getResourcesConfig(
      xml2js(xmlSourceMap['package.xml']) as XmlElem);

  //  textures Config describe how to use atlas file.
  const texturesConfig: TextureConfig[] =
    getTexturesConfig(xmlSourceMap['sprites.bytes']);

  //  Convert other source into JavaScript object.
  const sourceMap = 
    fromPairs(
      map(bySourceType)(
        toPairs(
          omit(['package.xml', 'sprites.bytes'])(xmlSourceMap))));

  return create;

  function bySourceType([sourceKey, sourceStr]: [string, string]): [string, SourceElement] {
    const [key, type] = split('.', sourceKey);
    
    const value =
      (type === 'xml') ? xml2js(sourceStr).elements[0] :
      (type === 'fnt') ? fnt2js(sourceStr) : undefined;

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
    //  Temp Global
    global.temp = {
      getSource,
      selectResourcesConfig,
      selectTexturesConfig,
      getResource,
      getChild: () => new PIXI.Graphics(),
    };

    const id = findIdBy(resName);
    const result = construct(sourceMap[id]);

    delete global.temp;

    result.name = resName;

    return result;
  }

  function getSource(key: string) {
    return sourceMap[key];
  }

  function selectResourcesConfig<Pred extends(x: ResourceAttribute) => boolean>(predicate: Pred) {
    const configs = select(predicate, resourcesConfig);
    assertIsDefined(configs[0]);
    return configs[0];
  }

  function selectTexturesConfig<Pred extends(x: TextureConfig) => boolean>(predicate: Pred) {
    const configs = select(predicate, texturesConfig);
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
