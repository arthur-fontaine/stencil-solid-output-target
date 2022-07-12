import { Config, OutputTargetCustom } from '@stencil/core/internal';
import { OutputTargetSolid } from './types';
import { normalizePath } from './utils';
import * as path from 'path';
import { solidProxyOutput } from './output-solid';

export const normalizeOutputTarget = (config: Config, outputTarget: OutputTargetSolid, validate = true) => {
  if (validate) {
    validateOutputTarget(config, outputTarget);
  }

  const results: OutputTargetSolid = {
    ...outputTarget,
    excludeComponents: outputTarget.excludeComponents || [],
    includePolyfills: outputTarget.includePolyfills ?? true,
    includeDefineCustomElements: outputTarget.includeDefineCustomElements ?? true,
  };

  if (outputTarget.directivesProxyFile && !path.isAbsolute(outputTarget.directivesProxyFile)) {
    results.proxiesFile = normalizePath(path.join(config.rootDir, outputTarget.proxiesFile));
  }

  return results;
};

const validateOutputTarget = (config: Config, outputTarget: OutputTargetSolid): void => {
  if (config.rootDir == null) {
    throw new Error('rootDir is not set and it should be set by stencil itself');
  }

  if (outputTarget.proxiesFile == null) {
    throw new Error('proxiesFile is required');
  }

  if (outputTarget.includeDefineCustomElements && outputTarget.includeImportCustomElements) {
    throw new Error('includeDefineCustomElements cannot be used at the same time as includeImportCustomElements since includeDefineCustomElements is used for lazy loading components. Set `includeDefineCustomElements: false` in your React output target config to resolve this.');
  }

  if (outputTarget.includeImportCustomElements && outputTarget.includePolyfills) {
    throw new Error('includePolyfills cannot be used at the same time as includeImportCustomElements. Set `includePolyfills: false` in your React output target config to resolve this.');
  }
};

export const solidOutputTarget = (outputTarget: OutputTargetSolid): OutputTargetCustom => ({
  type: 'custom',
  name: 'solid-library',
  validate(config) {
    return validateOutputTarget(config, outputTarget);
  },
  async generator(config, compilerCtx, buildCtx) {
    const timespan = buildCtx.createTimeSpan('generate solid started', true);

    const normalizedOutputTarget = normalizeOutputTarget(config, outputTarget);
    await solidProxyOutput(config, compilerCtx, normalizedOutputTarget, buildCtx.components);

    timespan.finish('generate solid finished');
  },
});
