import * as PIXI from 'pixi.js';

import {getFairyConfigMap} from './parse/getFairyConfigMap';
import {getTexturesConfig} from './parse/getTexturesConfig';
import {getResourcesConfig} from './parse/getResourcesConfig';

import {fnt2js} from './parse/fnt2js';
import {xml2js} from 'xml-js';

import {select} from '../util';

import {pipe, propEq, omit, split, toPairs, map, fromPairs} from 'ramda';


import {construct} from './construct';

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
function addPackage(app: PIXI.Application, packageName: string) {
  //  XML Source Map contains xml source code mapping by config name.
  const xmlSourceMap = pipe(
    getBinaryData,
    getFairyConfigMap
  )(packageName);
  // log(xmlSourceMap);

  //  Resources Config contains all resources configs used by this package.
  const resourcesConfig = pipe(
    xml2js,
    getResourcesConfig
  )(xmlSourceMap['package.xml'], undefined);
  // log(resourcesConfig);

  //  textures Config describe how to use atlas file.
  const texturesConfig = getTexturesConfig(
    xmlSourceMap['sprites.bytes']
  );
  // log(texturesConfig);

  //  Convert other source into JavaScript object.
  const sourceMap = pipe(
    omit(['package.xml', 'sprites.bytes']),
    toPairs,
    map(bySourceType),
    fromPairs
  )(xmlSourceMap);
  // log(sourceMap);

  return create;

  function bySourceType([sourceKey, sourceStr]: [string, string]) {
    const [key, type] = split('.', sourceKey);
    
    const value = (
      (type === 'xml') ? xml2js(sourceStr).elements[0] :
        (type === 'fnt') ? fnt2js(sourceStr) :
          undefined
    );

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
    };

    const id = findIdBy(resName);
    const result = construct(sourceMap[id]);

    delete global.temp;

    result.name = resName;

    return result;
  }

  function getSource(key: number) {
    return sourceMap[key];
  }

  function selectResourcesConfig<Args, U>(predicate: (args: Args)=>U ) {
    return select(predicate, resourcesConfig);
  }

  function selectTexturesConfig<Args, U>(predicate: (args: Args)=>U) {
    return select(predicate, texturesConfig);
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
