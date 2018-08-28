# Rewire create-react-app to use LESS and LESS-modules!

This repository is fork [react-app-rewrite-less](https://github.com/timarney/react-app-rewired/tree/master/packages/react-app-rewire-less)


# Install

```bash
$ npm install --save react-app-rewire-less-and-css-modules
```

# Add it to your project

* [Rewire your app](https://github.com/timarney/react-app-rewired#how-to-rewire-your-create-react-app-project) than modify `config-overrides.js`

```javascript
const rewireLess = require('react-app-rewire-less-and-css-modules');

/* config-overrides.js */
module.exports = function override(config, env) {
  config = rewireLess(config, env);
  // with loaderOptions
  // config = rewireLess.withLoaderOptions(someLoaderOptions)(config, env);
  return config;
}
```
