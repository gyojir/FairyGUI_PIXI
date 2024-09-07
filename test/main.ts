import * as PIXI from 'pixi.js';
import {Application} from 'pixi.js';
import {addPackage, Loader} from '../src/index';

(global as any).log = console.log;

const loader = new Loader();

function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const app = new Application<HTMLCanvasElement>({width, height});
  document.body.appendChild(app.view);

  load(app).then(start);
}

function load(app: Application) {
  loader.baseUrl = 'assets';
  loader
    .add('test@atlas0.png')
    .add('test.fui');

  return new Promise(onLoaded);

  function onLoaded(resolve: (app: Application)=>void) {
    loader.load(() => resolve(app));
  }
}

function start(app: Application) {
  const create = addPackage(app, loader, 'test');
  const comp = create('Test');
  const text = <PIXI.BitmapText>(comp.getChildByName('n4'));
  app.stage.addChild(comp);

  const input = window.document.createElement('textarea');
  window.document.body.appendChild(input);
  input.oninput = (e: Event) => {
    text.text = input.value;
  };
}

//  Execute
main();
