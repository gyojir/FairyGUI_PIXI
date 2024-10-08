
import * as PIXI from 'pixi.js';
import anime from 'animejs';
import {split, mergeWith, test, prop} from 'ramda';

import {toPair, bool} from '../../util';
import {position, size, alpha, rotation, scale, skew, pivot, visible, tint, hexToRgb, deltaTime} from '../../core';
import {shake} from '../effect/shake';
import {isRGB, TweenAnimeAttributes, TransitionAnimeAttributes, KeyFrameAnimeAttributes, ExtendedAnimeInstance, TransitionSourceMapElement, PickType, Context} from '../../def/index';

type TimeFrameObject = {
  type?: 'keyFrame' | 'tween';
  call?: TimerHandler;
  time?: number
};

function mapByType({type}: {type: string}): (...args:any[])=>any {
  return (
    type === 'XY' ? position :
    type === 'Size' ? size :
    type === 'Alpha' ? alpha :
    type === 'Rotation' ? rotation :
    type === 'Scale' ? scale :
    type === 'Skew' ? skew :
    type === 'Color' ? hexToRgb :
    type === 'Pivot' ? pivot :
    type === 'Visible' ? visible : ()=>{});
}


function easing(source = 'Quad.Out') {
  if (test(/linear/i, source)) {
    return 'linear';
  }

  const [func, type] = split('.', source);

  if (func === 'Elastic') {
    const amplitude = 1;
    const period = 0.5;

    return 'ease' + type + 'Elastic' + `(${amplitude}, ${period})`;
  }

  return 'ease'.concat(type, func);
}

function shouldAnimate(attributes: TransitionAnimeAttributes) {
  return attributes.tween === 'true';
}

function getFromTo(attributes: TweenAnimeAttributes) {
  const mapping = mapByType(attributes);
  const {startValue, endValue} = attributes;
  
  const start = mapping(...toPair(startValue));
  if (!endValue) return;
  const end = mapping(...toPair(endValue));

  return mergeWith((a, b) => [a, b])(start, end);
}

function getLoop(repeat: string | undefined, elements: PickType<TransitionSourceMapElement, 'elements'>) {
  if (!repeat) return 1;
  if (repeat === '-1') return true;

  const flag = elements.some(({attributes}) => attributes.repeat === '-1');
  if (flag) return true;

  return Number(repeat);
}

function whenYOYO(elements: PickType<TransitionSourceMapElement, 'elements'>) {
  const flag = elements.some(({attributes}) => attributes.yoyo === 'true');
  return flag ? 'alternate' : '';
}

/*
 *  Map transition type to anime.AnimeTimelineInstance
 *
 *  See Anime.js
 */
function transition(context: Context, {attributes, elements}: TransitionSourceMapElement): ExtendedAnimeInstance {
  let timeLine: ExtendedAnimeInstance | undefined;
  const keyFrames: (()=>void)[] = [];

  try {
    timeLine =
      elements
        .map<TransitionAnimeAttributes>(prop('attributes'))
        .map(process)
        .reduce(addTimeFrame, anime.timeline({autoplay: false}));
  }
  catch (e) {
    throw new Error(`Occur when create Transition: ${attributes.name}, ${e}`);
  }

  timeLine.name = attributes.name;
  timeLine.loop = getLoop(attributes.autoPlayRepeat, elements);
  timeLine.direction = whenYOYO(elements);
  timeLine.begin = () => keyFrames.forEach((func) => func());
  if (isAutoPlay()) {
    timeLine.restart();
  }

  return timeLine;

  function addTimeFrame(time: anime.AnimeTimelineInstance, frame: TimeFrameObject) {
    if (frame.type === 'keyFrame') {
      keyFrames.push(() => setTimeout(frame.call || (()=>{}), frame.time));
    }
    return time.add(frame, frame.time);
  }

  function isAutoPlay() {
    return bool(attributes.autoPlay);
  }

  function getTarget({type, target}: TransitionAnimeAttributes) {
    const element = context.getChild(target);
    const targets = getControlTargetByType(type);
    return {element, targets};

    function getControlTargetByType(type: string) {
      return (
        type === 'Scale' ? element?.scale :
        type === 'Skew' ? element?.skew :
        type === 'Pivot' ? element?.pivot :
        type === 'Color' ? {r: 0, g: 0, b: 0} : element);
    }
  }

  function tweenAnimation(attributes: TweenAnimeAttributes): TimeFrameObject {
    const fromTo = getFromTo(attributes);
    if (!fromTo) return {};
  
    const byFrameRate = deltaTime(24);
    const {element, targets} = getTarget(attributes);
  
    return Object.assign(fromTo, {
      targets,
      duration: byFrameRate(attributes.duration),
      time: byFrameRate(attributes.time),
      easing: easing(attributes.ease),
      update,
    });
  
    function update() {
      if (attributes.type === 'Color' && element && isRGB(targets)) {
        element.tint = tint(targets);
      }
    }
  }
  
  function keyFrame(attributes: KeyFrameAnimeAttributes): TimeFrameObject {
    const {targets} = getTarget(attributes);
    const byFrameRate = deltaTime(24);
    const time = byFrameRate(attributes.time) === 0 ? 0 : byFrameRate(attributes.time);
    const animation: TimeFrameObject = {type: 'keyFrame', time};
  
    if (attributes.type === 'Transition') {
      let [name, loop] = attributes.value.split(',');
      const transition = (targets as any)?.transition[name];
      animation.call = () => {
        transition.loop =
          loop === '-1' ? true :
          loop !== undefined ? Number(loop) : undefined;
  
        loop === '0' ? transition.pause() : transition.play();
      };
    }
    else if (attributes.type === 'Animation') {
      const [frame, command] = attributes.value.split(/,/g);
      const anim: PIXI.AnimatedSprite = (targets as any)?.anim;
      animation.call =
        command === 'p' ? () => anim.gotoAndPlay(Number(frame)) :
        command === 's' ? () => anim.gotoAndStop(Number(frame)) : undefined;
    }
    else if (attributes.type === 'Shake') {
      if (targets instanceof PIXI.Graphics) {
        const [amplitude, seconds] = toPair(attributes.value);
        const duration = seconds * 1000;
        animation.call = () => shake({targets, amplitude, duration});
      }
    }
    else {
      const mapping = mapByType({type: attributes.type});
      const result = mapping(...toPair(attributes.value));
      animation.call = () => Object.assign(targets, result);
    }
  
    return animation;
  }

  function process(attributes: TransitionAnimeAttributes): TimeFrameObject {
    if (shouldAnimate(attributes)) {
      return tweenAnimation(attributes as TweenAnimeAttributes);
    }
    else {
      return keyFrame(attributes as KeyFrameAnimeAttributes);
    }
  }
}

export {transition};
