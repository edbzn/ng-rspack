const { composePlugins, withNx, withWeb } = require('@nx/rspack');
const {
  HtmlRspackPlugin,
  SwcJsMinimizerRspackPlugin,
  CopyRspackPlugin,
} = require('@rspack/core');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const lightningcss = require('lightningcss');
const browserslist = require('browserslist');
const { AngularWebpackPlugin } = require('@ngtools/webpack');
const { ProgressPlugin, CssExtractRspackPlugin } = require('@rspack/core');
const {
  NamedChunksPlugin,
} = require('@angular-devkit/build-angular/src/tools/webpack/plugins/named-chunks-plugin');
const {
  OccurrencesPlugin,
} = require('@angular-devkit/build-angular/src/tools/webpack/plugins/occurrences-plugin');
const {
  JavaScriptOptimizerPlugin,
} = require('@angular-devkit/build-angular/src/tools/webpack/plugins');
/**
 * Angular CLI Webpack references:
 *
 * - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/configs/common.ts
 * - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/configs/styles.ts
 */

const { GLOBAL_DEFS_FOR_TERSER_WITH_AOT } = loadEsmModule(
  '@angular/compiler-cli'
);

module.exports = composePlugins(withNx(), withWeb(), (baseConfig, ctx) => {
  /**
   * @type {import('@rspack/cli').Configuration}
   */
  const config = {
    ...baseConfig,
    mode: 'production',
    devtool: false,
    target: ['web', 'es2015'],
    entry: {
      styles: ['./src/styles.css'],
      polyfills: ['zone.js'],
      main: ['./src/main.ts'],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js'],
      modules: ['node_modules'],
      mainFields: ['es2020', 'es2015', 'browser', 'module', 'main'],
      conditionNames: ['es2020', 'es2015', '...'],
    },
    context: ctx.options.root,
    node: false,
    output: {
      uniqueName: 'ng-rspack',
      clean: true,
      path: ctx.options.outputPath,
      publicPath: '',
      filename: '[name].[contenthash:20].js',
      chunkFilename: '[name].[contenthash:20].js',
      crossOriginLoading: false,
      trustedTypes: 'angular#bundler',
      scriptType: 'module',
    },
    watch: false,
    experiments: {
      asyncWebAssembly: true,
      topLevelAwait: false,
    },
    module: {
      parser: {
        javascript: {
          requireContext: false,
          url: false,
        },
      },
      rules: [
        {
          test: /\.?(svg|html)$/,
          resourceQuery: /\?ngResource/,
          type: 'asset/source',
        },
        // Component styles
        {
          test: /\.?(scss)$/,
          resourceQuery: /\?ngResource/,
          use: [
            {
              loader: require.resolve('raw-loader'),
            },
            {
              loader: require.resolve('sass-loader'),
              options: {
                implementation: require('sass'),
              },
            },
          ],
        },
        {
          test: /\.?(css)$/,
          resourceQuery: /\?ngResource/,
          use: [],
        },
        { test: /[/\\]rxjs[/\\]add[/\\].+\.js$/, sideEffects: true },
        {
          test: /\.[cm]?[tj]sx?$/,
          exclude: [
            /[\\/]node_modules[/\\](?:core-js|@babel|tslib|web-animations-js|web-streams-polyfill|whatwg-url)[/\\]/,
          ],
          use: [
            {
              loader: require.resolve(
                '@angular-devkit/build-angular/src/tools/babel/webpack-loader.js'
              ),
              options: {
                cacheDirectory: false,
                aot: true,
                optimize: true,
                supportedBrowsers: ['chrome 124'],
              },
            },
          ],
        },
        {
          test: /\.[cm]?tsx?$/,
          use: [
            { loader: require.resolve('@ngtools/webpack/src/ivy/index.js') },
          ],
          exclude: [
            /[\\/]node_modules[/\\](?:css-loader|mini-css-extract-plugin|webpack-dev-server|webpack)[/\\]/,
          ],
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [
        new SwcJsMinimizerRspackPlugin(),
        new CssMinimizerPlugin({
          minify: CssMinimizerPlugin.lightningCssMinify,
          minimizerOptions: {
            targets: lightningcss.browserslistToTargets(
              browserslist('last 1 Chrome versions')
            ),
          },
        }),
      ],
    },
    plugins: [
      new CopyRspackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: '.',
            globOptions: {
              dot: false,
            },
            noErrorOnMissing: true,
          },
          {
            from: 'src/favicon.ico',
            to: '.',
          },
        ],
      }),
      new ProgressPlugin(),
      new CssExtractRspackPlugin(),
      new HtmlRspackPlugin({
        minify: false,
        inject: 'body',
        scriptLoading: 'module',
        template: 'src/index.html',
      }),
      new NamedChunksPlugin(),
      new OccurrencesPlugin({
        aot: true,
        scriptsOptimization: true,
      }),
      new JavaScriptOptimizerPlugin({
        define: GLOBAL_DEFS_FOR_TERSER_WITH_AOT,
        sourcemap: false,
        supportedBrowsers: [],
        keepIdentifierNames: false,
        removeLicenses: true,
      }),
      new AngularWebpackPlugin({
        tsconfig: './tsconfig.app.json',
        emitClassMetadata: false,
        emitNgModuleScope: false,
        jitMode: false,
        directTemplateLoading: true,
        compilerOptions: {
          sourceMap: false,
          declaration: false,
          declarationMap: false,
          preserveSymlinks: false,
        },
        inlineStyleFileExtension: 'css',
      }),
    ],
  };

  return config;
});

function loadEsmModule(modulePath) {
  return new Function('modulePath', `return import(modulePath);`)(modulePath);
}
