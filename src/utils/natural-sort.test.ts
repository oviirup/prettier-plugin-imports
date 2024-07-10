import { expect, test } from 'vitest';
import { naturalSort } from './natural-sort';

test('should sort normal things alphabetically', () => {
  let source = ['a', 'h', 'b', 'i', 'c', 'd', 'j', 'e', 'k', 'f', 'g'];
  let target = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

  expect(source.sort(naturalSort)).toEqual(target);
});

test('should ignore capitalization differences', () => {
  let source = ['./ExampleView', './ExamplesList'];
  let target = ['./ExamplesList', './ExampleView'];

  expect(source.sort(naturalSort)).toEqual(target);
});

test('should sort things numerically', () => {
  let source = ['a2', 'a3', 'a10', 'a1', 'a11', 'a9'];
  let target = ['a1', 'a2', 'a3', 'a9', 'a10', 'a11'];

  expect(source.sort(naturalSort)).toEqual(target);
});
