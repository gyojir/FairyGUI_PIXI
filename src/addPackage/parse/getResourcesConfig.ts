

import {propEq} from 'ramda';
import {toPair, search} from '../../util';
import {XmlElem, ResourceElement, ResourceAttribute, ResourceAttributesForTile, ResourceAttributesFor9Grid} from '../../def/index';

function processForImageType(attributes: ResourceAttribute): ResourceAttribute {
  return attributes.scale === '9grid' ? processFor9Grid(attributes as ResourceAttributesFor9Grid) :
    attributes.scale === 'tile' ? processForTile(attributes as ResourceAttributesForTile) : attributes;

  function processFor9Grid(attributes: ResourceAttributesFor9Grid): ResourceAttributesFor9Grid {
    const {scale9grid, gridTile} = attributes;

    attributes._scale9grid = toPair(scale9grid as string);

    if (gridTile) {
      attributes._tiledSlices = Number(gridTile);
    }

    return attributes;
  }

  function processForTile(attributes: ResourceAttributesForTile): ResourceAttributesForTile {
    attributes._scaleByTile = true;
    return attributes;
  }
}

function processForFontType(source: ResourceAttribute, packageID: string) {
  source.id = packageID + source.id;
  return source;
}

function setWidthAndHeight(attributes: ResourceAttribute) {
  const [width, height] = toPair(attributes.size);
  attributes._size = {width, height};
  return attributes;
}

function getResourceAttributes(resources: ResourceElement[], packageID: string): ResourceAttribute[] {
  return resources.map(({name, attributes}) => {
    //  Attributes Condition
    if (attributes.size) {
      attributes = setWidthAndHeight(attributes);
    }

    // original id
    attributes._rawId = attributes.id;

    //  Type Condition
    attributes._type = name;

    /*
     *  Package Type:
     *    'image', 'swf', 'movieclip', 'sound', 'index', 'font', 'atlas', 'misc'
     */
    return attributes._type === 'image' ? processForImageType(attributes) :
      attributes._type === 'font' ? processForFontType(attributes, packageID) : attributes;
  });
}

/*
 * Return all resources config used by this package.
 */
export function getResourcesConfig(json: XmlElem): ResourceAttribute[] {
  const packageID: string = json.elements[0].attributes.id;
  const {elements} = search(propEq('resources', 'name'), json)[0];

  return getResourceAttributes(elements as ResourceElement[], packageID);
}
