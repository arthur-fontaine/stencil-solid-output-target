import { Config } from '@stencil/core';
import { solidOutputTarget } from 'stencil-solid-output-target';

export const config: Config = {
  namespace: 'example',
  outputTargets: [
    solidOutputTarget({
      componentCorePackage: 'component-library',
      proxiesFile: './component-library-solid/src/components.ts',
    }),
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
  ],
};
