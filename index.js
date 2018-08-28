const { getLoader, loaderNameMatches } = require("react-app-rewired");

function createRewireLess(lessLoaderOptions = {}) {
  return function(config, env) {
    const lessExtension = /\.less$/;
    const lessModuleExtension = /\.module.less$/;

    const fileLoader = getLoader(config.module.rules, rule =>
      loaderNameMatches(rule, "file-loader")
    );
    fileLoader.exclude.push(lessExtension);

    const cssRules = getLoader(
      config.module.rules,
      rule => String(rule.test) === String(/\.css$/)
    );

    console.log(cssRules.loader.map(v => v));

    let lessRules;
    let lessRulesModules;
    if (env === "production") {
      lessRules = {
        test: lessExtension,
        exclude: lessModuleExtension,
        loader: [
          // TODO: originally this part is wrapper in extract-text-webpack-plugin
          //       which we cannot do, so some things like relative publicPath
          //       will not work.
          //       https://github.com/timarney/react-app-rewired/issues/33
          ...cssRules.loader,
          { loader: "less-loader", options: lessLoaderOptions }
        ]
      };
      lessRulesModules = {
        test: lessModuleExtension,
        loader: [
          ...cssRules.loader.map(rule => {
            if (String(rule.loader).includes("/css-loader/")) {
              return {
                loader: rule.loader,
                options: {
                  minimize: true,
                  modules: true,
                  importLoaders: 1,
                  localIdentName: "[hash:base64:5]"
                }
              };
            }
            return rule;
          }),
          {
            loader: require.resolve("less-loader"),
            options: lessLoaderOptions
          }
        ]
      };
    } else {
      lessRules = {
        test: lessExtension,
        exclude: lessModuleExtension,
        use: [
          ...cssRules.use,
          { loader: "less-loader", options: lessLoaderOptions }
        ]
      };
      lessRulesModules = {
        test: lessModuleExtension,
        use: [
          ...cssRules.use.map(rule => {
            if (String(rule.loader).includes("/css-loader/")) {
              return {
                loader: rule.loader,
                options: {
                  modules: true,
                  sourceMap: true,
                  importLoaders: 1,
                  localIdentName: "[name]__[local]--[hash:base64:5]"
                }
              };
            }
            return rule;
          }),
          {
            loader: require.resolve("less-loader"),
            options: lessLoaderOptions
          }
        ]
      };
    }

    const oneOfRule = config.module.rules.find(
      rule => rule.oneOf !== undefined
    );
    if (oneOfRule) {
      oneOfRule.oneOf.unshift(lessRules);
      oneOfRule.oneOf.unshift(lessRulesModules);
    } else {
      // Fallback to previous behaviour of adding to the end of the rules list.
      config.module.rules.push(lessRules);
      config.module.rules.push(lessRulesModules);
    }

    return config;
  };
}

const rewireLess = createRewireLess();

rewireLess.withLoaderOptions = createRewireLess;

module.exports = rewireLess;