const { composePlugins, withNx, withWeb } = require('@nx/rspack');
const { HtmlRspackPlugin } = require('@rspack/core');
const { AngularWebpackPlugin } = require('@ngtools/webpack');
const { ProgressPlugin, CssExtractRspackPlugin } = require('@rspack/core');
const {
  NamedChunksPlugin,
} = require('@angular-devkit/build-angular/src/tools/webpack/plugins/named-chunks-plugin');
const {
  OccurrencesPlugin,
} = require('@angular-devkit/build-angular/src/tools/webpack/plugins/occurrences-plugin');
/**
 * Angular CLI Webpack references:
 *
 * - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/configs/common.ts
 * - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/configs/styles.ts
 */

module.exports = composePlugins(withNx(), withWeb(), (baseConfig, ctx) => {
  /**
   * @type {import('@rspack/cli').Configuration}
   */
  const config = {
    ...baseConfig,
    mode: 'production',
    devtool: false,
    target: ['web', 'es2022'],
    entry: {
      styles: ['./src/styles.css'],
      polyfills: ['zone.js'],
      main: ['./src/main.ts'],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      uniqueName: 'ng-rspack',
      clean: true,
      path: ctx.options.outputPath,
      publicPath: '',
      filename: '[name].[contenthash:20].js',
      chunkFilename: '[name].[contenthash:20].js',
      crossOriginLoading: false,
      trustedTypes: 'angular#bundler',
    },
    watch: false,
    experiments: {
      asyncWebAssembly: true,
    },
    optimization: {},
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
        // Global styles
        {
          test: /\.?(css)$/,
          resourceQuery: /\?ngGlobalStyle/,
          use: [
            {
              loader: CssExtractRspackPlugin.loader,
            },
            {
              loader: require.resolve('css-loader'),
              options: {
                url: false,
                sourceMap: false,
                importLoaders: 1,
              },
            },
          ],
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
                supportedBrowsers: [
                  'chrome 111',
                  'chrome 110',
                  'edge 111',
                  'edge 110',
                  'firefox 111',
                  'firefox 102',
                  'ios_saf 16.3',
                  'ios_saf 16.2',
                  'safari 16.3',
                  'safari 16.2',
                ],
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
    plugins: [
      new ProgressPlugin({}),
      new CssExtractRspackPlugin({}),
      new HtmlRspackPlugin({ template: 'src/index.html' }),
      new NamedChunksPlugin(),
      new OccurrencesPlugin({
        aot: true,
        scriptsOptimization: false,
      }),
      new AngularWebpackPlugin({
        tsconfig: './tsconfig.app.json',
        emitClassMetadata: false,
        emitNgModuleScope: false,
        jitMode: false,
        fileReplacements: {},
        substitutions: {},
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
