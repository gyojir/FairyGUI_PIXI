import {Application} from 'pixi.js';
import {addPackage} from '../src/index';

(global as any).log = console.log;

function main(...args) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const app = new Application({width, height});
  document.body.appendChild(app.view);

  load(app).then(start);
}

function load(app) {
  app.loader.baseUrl = 'assets';
  app.loader
    .add('test@atlas0.png')
    .add('test.fui', {xhrType: 'arraybuffer'});

  return new Promise(onLoaded);

  function onLoaded(resolve) {
    app.loader.load(() => resolve(app));
  }
}

function start(app) {
  const create = addPackage(app, 'test');
  const comp = create('Test');

  comp.width = app.screen.width;
  comp.height = app.screen.height;

  app.stage.addChild(comp);

  (window as any).scene = comp;
}

//  Execute
main();
