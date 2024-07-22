'use strict';

import fs from 'fs';
import { extname, resolve } from 'path';
import { format } from 'prettier';
import { expect, test } from 'vitest';
import * as plugin from '../src';
import type { PluginConfig } from '../src/plugin';
import type { PrettierOptions } from '../src/types';

type Parser = PrettierOptions['parser'];

export async function runTest(
  dirname: string,
  parsers: Parser[],
  options: Partial<PluginConfig>,
) {
  let defaultOptions = { plugins: [plugin], tabWidth: 4 };
  options = Object.assign(defaultOptions, options);

  if (!parsers || !parsers.length) {
    throw new Error(`No parsers were specified for ${dirname}`);
  }

  for (const filename of fs.readdirSync(dirname)) {
    const path = resolve(dirname, filename);
    if (
      extname(filename) !== '.snap' &&
      fs.lstatSync(path).isFile() &&
      !filename.startsWith('.') &&
      filename !== 'plugin.test.ts'
    ) {
      const source = readFile(path).replace(/\r\n/g, '\n');

      const mergedOptions = Object.assign({}, options, { parser: parsers[0] });
      test(`${filename} - ${mergedOptions.parser}-verify`, async () => {
        let output = await prettyprint(source, path, mergedOptions);
        let hr = '~'.repeat(80) + '\n';
        expect(raw(source + hr + output)).toMatchSnapshot(filename);
      });

      for (const parser of parsers.slice(1)) {
        test(`${filename} - ${parser}-verify`, async () => {
          const output = await prettyprint(source, path, mergedOptions);
          const verifyOptions = Object.assign(mergedOptions, { parser });
          const verifyOutput = await prettyprint(source, path, verifyOptions);
          expect(output).toEqual(verifyOutput);
        });
      }
    }
  }
}

async function prettyprint(
  source: string,
  filepath: string,
  options: Partial<PrettierOptions>,
) {
  return await format(source, Object.assign({ filepath }, options));
}

function readFile(filename: string) {
  return fs.readFileSync(filename, 'utf8');
}

/**
 * Wraps a string in a marker object that is used by `./raw-serializer.js` to
 * directly print that string in a snapshot without escaping all double quotes.
 * Backticks will still be escaped.
 */
function raw(string: string) {
  if (typeof string !== 'string') {
    throw new Error('Raw snapshots have to be strings.');
  }
  return { [Symbol.for('raw')]: string };
}
