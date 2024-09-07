import * as PIXI from 'pixi.js';

export type LoaderResource = any;

export class Loader {
  loading: string[] = [];
  map: Map<string, any> = new Map();
  baseUrl: string = "";

  constructor() {
  }

  add(alias: string, src?: string): Loader {
    let _src = src || alias;
    if (this.baseUrl !== "") {
      _src = this.baseUrl + "/" + _src;
    }
    PIXI.Assets.add({alias: alias, src: _src});
    this.loading.push(alias);
    return this;
  }

  load(callback: (loader: Loader, resources: Record<string, any>) => void) {
    PIXI.Assets
      .load(this.loading)
      .then((resources)=> {        
        for(let [alias, data] of Object.entries(resources)){
          this.map.set(alias, data);
        }
        callback(this, resources);
      });
  }

  getResource(alias: string) {
    return this.map.get(alias);
  }
}

const FuiAssetLoader = {
  extension: {
    type: PIXI.ExtensionType.LoadParser,
    name: 'fui-asset-loader',
  },
  test: (url: string) => url.split('.').pop() === 'fui',
  load: async (url: string, asset: any) => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    asset.data = arrayBuffer;
    return asset;
  },
};
PIXI.extensions.add(FuiAssetLoader);