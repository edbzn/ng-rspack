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
  getSupportedBrowsers,
} = require('@angular-devkit/build-angular/src/utils/supported-browsers');
const path = require('path');

/**
 * Angular CLI Webpack references:
 *
 * - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/configs/common.ts
 * - https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/configs/styles.ts
 */

const supportedBrowsers = getSupportedBrowsers();

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
      polyfills: ['zone.js'],
      main: ['./src/main.ts'],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.mjs', '.js'],
      modules: ['node_modules'],
      mainFields: ['es2020', 'es2015', 'browser', 'module', 'main'],
      conditionNames: ['es2020', 'es2015', '...'],
    },
    context: __dirname,
    node: false,
    output: {
      uniqueName: 'ng-rspack',
      clean: true,
      path: path.resolve(__dirname, ctx.options.outputPath),
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
      css: true,
    },
    module: {
      parser: {
        javascript: {
          requireContext: false,
          url: false,
        },
      },
      rules: [
        // Global assets
        {
          test: /\.?(sa|sc|c)ss$/,
          resourceQuery: /\?ngGlobalStyle/,
          use: [
            {
              loader: 'sass-loader',
              options: {
                api: 'modern-compiler',
                implementation: require.resolve('sass-embedded'),
              },
            },

          ],
          type: 'css'
        },

        // Component templates
        {
          test: /\.?(svg|html)$/,
          resourceQuery: /\?ngResource/,
          type: 'asset/source',
        },
        // Component styles
        {
          test: /\.?(sa|sc|c)ss$/,
          resourceQuery: /\?ngResource/,
          use: [
            {
              loader: require.resolve('raw-loader'),
            },
            {
              loader: 'sass-loader',
              options: {
                api: 'modern-compiler',
                implementation: require.resolve('sass-embedded'),
              },
            },
          ],
        },
        {
          // Mark files inside `rxjs/add` as containing side effects.
          // If this is fixed upstream and the fixed version becomes the minimum
          // supported version, this can be removed.
          test: /[/\\]rxjs[/\\]add[/\\].+\.js$/,
          sideEffects: true,
        },
        {
          test: /\.[cm]?[tj]sx?$/,
          // The below is needed due to a bug in `@babel/runtime`. See: https://github.com/babel/babel/issues/12824
          resolve: { fullySpecified: false },
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
                supportedBrowsers,
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
              browserslist(supportedBrowsers)
            ),
          },
        }),
      ],
    },
    plugins: [
      new StylesWebpackPlugin({
        root: __dirname,
        entryPoints: {
          styles: ['src/styles.css'],
        },
        preserveSymlinks: false,
      }),
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

const PLUGIN_NAME = 'styles-webpack-plugin';

/**
 * Ported from Angular CLI Webpack plugin.
 * https://github.com/angular/angular-cli/blob/main/packages/angular_devkit/build_angular/src/tools/webpack/plugins/styles-webpack-plugin.ts
 */
class StylesWebpackPlugin {
  options;
  compilation;
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const { entryPoints, preserveSymlinks, root } = this.options;
    const resolver = compiler.resolverFactory.get('global-styles', {
      conditionNames: ['sass', 'less', 'style'],
      mainFields: ['sass', 'less', 'style', 'main', '...'],
      extensions: ['.scss', '.sass', '.less', '.css'],
      restrictions: [/\.((le|sa|sc|c)ss)$/i],
      preferRelative: true,
      useSyncFileSystemCalls: true,
      symlinks: !preserveSymlinks,
      fileSystem: compiler.inputFileSystem,
    });
    const webpackOptions = compiler.options;
    compiler.hooks.environment.tap(PLUGIN_NAME, () => {
      const entrypoints = webpackOptions.entry;
      for (const [bundleName, paths] of Object.entries(entryPoints)) {
        entrypoints[bundleName] ??= {};
        const entryImport = (entrypoints[bundleName].import ??= []);
        for (const path of paths) {
          try {
            const resolvedPath = resolver.resolveSync({}, root, path);
            if (resolvedPath) {
              entryImport.push(`${resolvedPath}?ngGlobalStyle`);
            } else {
              console.error('Compilation cannot be undefined.');
              throw new Error(`Cannot resolve '${path}'.`);
            }
          } catch (error) {
            console.error('Compilation cannot be undefined.');
            throw error;
          }
        }
      }
      return entrypoints;
    });
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      this.compilation = compilation;
    });
  }
}
