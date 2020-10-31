export * from './string';
export * from './query';
export * from './convert';

export function nextFrame() {
  return new Promise((r) => requestAnimationFrame(r));
}

export type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export type FunctionArgs<T> = T extends (...args: infer U) => any ? U : never;
export type FunctionReturn<T> = T extends (...args: any) => infer U ? U : never;

// declare global {
//   interface Object {
//     call: <Func extends (x: any) => any, R extends FunctionReturn<Func>>(fn: Func) => R;
//   }
// }
// Object.prototype.call = <Func extends (x: any) => any, R extends FunctionReturn<Func>>(fn: Func): R => (fn as any)(this as any);

// class ChainObject<Source>{
//   source: Source;
//   constructor(source: Source){
//     this.source = source;
//   }

//   c<Func extends (x: Source) => any, R extends FunctionReturn<Func>>(fn: Func) {
//     return new ChainObject<R>(fn(this.source));
//   }
// }
// export function chain<T>(source: T){
//   return new ChainObject(source);
// }

// const source = 123;
// const x = chain(source).chain((x)=>2).chain(()=>"a")
