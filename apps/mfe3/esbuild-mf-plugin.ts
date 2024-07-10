const { moduleFederationPlugin } = require('@module-federation/esbuild/plugin');
const { withFederation } = require('@module-federation/esbuild/build');

export default moduleFederationPlugin(
  withFederation({
    name: 'mfe3',

    exposes: {
      './app': './apps/mfe3/src/app/app.component.ts',
    },
    shared: [],
  })
);
