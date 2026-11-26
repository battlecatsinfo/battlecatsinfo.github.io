## Dependencies

* `mocha.js`, `mocha.css`: built from [mocha](https://github.com/mochajs/mocha/tree/v12.0.3) with:
  ```
  npm ci
  npx rollup -c
  ```

* `chai.mjs`: built from [chai](https://github.com/chaijs/chai/tree/v6.3.0) with:
  ```
  npm ci
  npx esbuild --bundle --format=esm --keep-names --outfile=chai.js lib/chai.js --target=chrome98,firefox94
  ```

* `sinon-esm.js`: from [sinon](https://cdn.jsdelivr.net/npm/sinon@22.1.0/pkg/sinon-esm.js)
