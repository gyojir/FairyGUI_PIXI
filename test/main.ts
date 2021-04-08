import {Application} from 'pixi.js';
import {addPackage} from '../src/index';

(global as any).log = console.log;

function main() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const app = new Application({width, height});
  document.body.appendChild(app.view);

  load(app).then(start);
}

function load(app: Application) {
  app.loader.baseUrl = 'assets';
  app.loader
    .add('test@atlas0.png')
    .add('test.fui', {xhrType: 'arraybuffer'});

  return new Promise(onLoaded);

  function onLoaded(resolve: (app: Application)=>void) {
    app.loader.load(() => resolve(app));
  }
}

function start(app: Application) {
  const create = addPackage(app, 'test');
  const comp = create('Test');
  const text = <PIXI.BitmapText>(comp.getChildByName("n4"));
  app.stage.addChild(comp);

  const input = window.document.createElement("textarea");
  window.document.body.appendChild(input);
  input.oninput = (e: Event) => {
    text.text = input.value;
  }
}

//  Execute
main();
