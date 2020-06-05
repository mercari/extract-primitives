# extract-primitives

`extract-primitives` extracts primitive values from TypeScript's declaration file(`.d.ts`).

```ts
// primitives.d.ts
declare namespace Japan {
  namespace Tokyo {
    namespace Minato {
      const isInTokyo: true;
      const isInOsaka: false;
      const area: 20.37;
      namespace Roppongi {
        const Station: 'H04';
      }
    }
  }
  namespace Osaka {
    interface Umeda {
      isInTokyo: false;
      hasYodobashiCamera: true;
    }
  }
}
```

```ts
import extractPrimitives from 'extract-primitives';

const primitives = extractPrimitives(['primitives.d.ts']);

console.log(primitives);
// {
//   Japan: {
//     Tokyo: {
//       Minato: {
//         isInTokyo: true,
//         isInOsaka: false,
//         area: 20.37,
//         Roppongi: {
//           Station: 'H04',
//         },
//       },
//     },
//   },
// }
```

## Installation

```sh
$ npm i -D extract-primitives
$ npm i -D typescript # a peer dependency
```

## Usage

As you see the example above, you can use it by passing file paths. `extract-primitives` accepts multiple files.

Note that a namespace which has no valid primitives are removed from results, like `Osaka` in the example.

### with `webpack.DefinePlugin`

`extract-primitives` makes a great contribution by using with `webpack.DefinePlugin`. You can use values in a declaration file without implementation.

For example, [`proto-to-type`](https://github.com/mercari/proto-to-type) generates an enum declaration like:
```ts
// my-proto.d.ts
type Sample =
  | Sample.UNKNOWN
  | Sample.ACTIVE
  | Sample.INACTIVE;
namespace Sample {
  type UNKNOWN = "UNKNOWN" | 0;
  namespace UNKNOWN {
    const str: "UNKNOWN";
    const num: 0;
  }
  type ACTIVE = "ACTIVE" | 1;
  namespace ACTIVE {
    const str: "ACTIVE";
    const num: 1;
  }
  type INACTIVE = "INACTIVE" | 2;
  namespace INACTIVE {
    const str: "INACTIVE";
    const num: 2;
  }
}
```

The enum `Sample` is able to be used in bundled file by passing extracted primitives to `webpack.DefinePlugin`.

```js
// webpack.config.js
const webpack = require('webpack');
const extractPrimitives = require('extract-primitives');

module.exports = {
  /* ... */
  plugins: [
    new webpack.DefinePlugin(extractPrimitives(['my-proto.d.ts'])),
  ],
  /* ... */
};
```

```ts
console.log(Sample.ACTIVE.str); // 'ACTIVE'
console.log(Sample.ACTIVE.num); // 1
```

### with testing framework

You need to set the primitives as global variables in the testing framework.

The following is an example of `jest`.

```js
// jest.config.js
const extractPrimitives = require('extract-primitives');
module.exports = {
  /* ... */
  globals: {
    ...extractPrimitives(['primitives.d.ts']),
  },
  /* ... */
};
```

## Committers

 * Shota Hatada ([@whatasoda](https://github.com/whatasoda))

## Contribution

Please read the CLA carefully before submitting your contribution to Mercari.
Under any circumstances, by submitting your contribution, you are deemed to accept and agree to be bound by the terms and conditions of the CLA.

https://www.mercari.com/cla/

## License

Copyright 2020 Mercari, Inc.

Licensed under the MIT License.
