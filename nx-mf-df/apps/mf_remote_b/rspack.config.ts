import { createConfig } from '@nx/angular-rspack';
import baseWebpackConfig from './webpack.config';
import webpackMerge from 'webpack-merge';

export default async () => {
  const baseConfig = await createConfig(
    {
      options: {
        root: __dirname,

        outputPath: {
          base: '../../dist/apps/mf_remote_b',
        },
        index: './src/index.html',
        browser: './src/main.ts',
        tsConfig: './tsconfig.app.json',
        assets: [
          {
            glob: '**/*',
            input: './public',
          },
        ],
        styles: ['./src/styles.css'],
        devServer: {
          port: 4202,
          publicHost: 'http://localhost:4202',
        },
      },
    },
    {
      production: {
        options: {
          budgets: [
            {
              type: 'initial',
              maximumWarning: '500kb',
              maximumError: '1mb',
            },
            {
              type: 'anyComponentStyle',
              maximumWarning: '4kb',
              maximumError: '8kb',
            },
          ],
          outputHashing: 'all',
          devServer: {},
        },
      },

      development: {
        options: {
          optimization: false,
          vendorChunk: true,
          extractLicenses: false,
          sourceMap: true,
          namedChunks: true,
          devServer: {},
        },
      },
    },
  );
  return webpackMerge(baseConfig[0], baseWebpackConfig);
};
