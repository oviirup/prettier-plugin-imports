import { describe, expect, test } from 'vitest';
import { naturalSort, naturalSortCaseSensitive } from './natural-sort';

describe('naturalSort', () => {
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
    let source = ['a2', 'a3', 'a10', 'a1', 'a11', 'a9', 'a1b', 'file000b', 'file000a', 'file00a', 'file00z'];
    let target = ['a1', 'a1b', 'a2', 'a3', 'a9', 'a10', 'a11', 'file000a', 'file00a', 'file000b', 'file00z'];

    expect(source.sort(naturalSort)).toEqual(target);
  });
});

describe('naturalSortCaseSensitive', () => {
  test('should not ignore capitalization differences', () => {
    let source = ['./ExampleComponent', './ExamplesList', './ExampleWidget'];
    let target = ['./ExampleComponent', './ExampleWidget', './ExamplesList'];

    expect(source.sort(naturalSortCaseSensitive)).toEqual(target);
  });

  test('should sort numerically and case-sensitively', () => {
    let source = ['file1', 'File10', 'AbA', 'file10', 'files10', 'file1z', 'file10ab', 'file2s', 'a', 'Ab', 'file20', 'file22', 'file11', 'file2', 'File20', 'file000b', 'file000a', 'file00a', 'file00z', 'aaa', 'AAA', 'bBb', 'BBB'];
    let target = ['AAA', 'Ab', 'AbA', 'BBB', 'File10', 'File20', 'a', 'aaa', 'bBb', 'file000a', 'file00a', 'file000b', 'file00z', 'file1', 'file1z', 'file2', 'file2s', 'file10', 'file10ab', 'file11', 'file20', 'file22', 'files10'];

    expect(source.sort(naturalSortCaseSensitive)).toEqual(target);
  });
});
