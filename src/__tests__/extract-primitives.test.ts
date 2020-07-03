import path from 'path';
import { extractPrimitives, trimQuotes, removeEmptyNests } from '../extract-primitives';

const sample = path.resolve(__dirname, '../__fixtures__/sample.d.ts');
const sample2 = path.resolve(__dirname, '../__fixtures__/sample2.d.ts');

const Minato = {
  isInTokyo: true,
  isInOsaka: false,
  area: 20.37,
  Roppongi: {
    Station: "'H04'",
  },
};
const Chiyoda = {
  isInOsaka: false,
  area: 11.66,
  Ochanomizu: {
    Station: "'C12'",
  },
};

describe('trimQuotes', () => {
  it('trims single or double quotations', () => {
    expect(trimQuotes('"foo"')).toBe('foo');
    expect(trimQuotes("'foo'")).toBe('foo');
    expect(trimQuotes('foo')).toBe('foo');
  });
});

describe('extractPrimitives', () => {
  it('works correctly without options', () => {
    const result = extractPrimitives([sample]);
    const expected = {
      Japan: {
        Tokyo: { Minato },
      },
    };

    expect(result).toEqual(expected);
  });

  it('works correctly if trimQuates = true', () => {
    const result = extractPrimitives([sample], { trimQuates: true });
    const expected = {
      Japan: {
        Tokyo: { Minato: { ...Minato, Roppongi: { Station: 'H04' } } },
      },
    };

    expect(result).toEqual(expected);
  });

  it('support multiple files', () => {
    const result = extractPrimitives([sample, sample2]);
    const expected = {
      Japan: {
        Tokyo: { Minato, Chiyoda },
      },
    };

    expect(result).toEqual(expected);
  });
});

describe('removeEmptyNests', () => {
  it('works correctly', () => {
    const input = Object.create(null);
    input.string = '';
    input.number = 0;
    input.boolean = false;
    input.null = null;
    input.undefined = undefined;
    input.object = {};
    input.array = [];
    input.nest0 = Object.create(null);
    input.nest1 = Object.create(null);
    input.nest1.nest2 = Object.create(null);
    input.nest1.nest2.nest3 = Object.create(null);
    input.nest4 = Object.create(null);
    input.nest4.string = '';

    const expected = {
      string: '',
      number: 0,
      boolean: false,
      null: null,
      undefined: undefined,
      object: {},
      array: [],
      nest4: { string: '' },
    };

    removeEmptyNests(input);
    expect(input).toEqual(expected);
  });
});
