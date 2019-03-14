import {filter} from 'ramda';

export function select(predicate, target) {
  const result = filter(predicate, target);

  return (
      (result.length === 1) ? result[0] : result
  );
}
