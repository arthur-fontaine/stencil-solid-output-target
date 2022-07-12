import { normalizePath } from './utils';
import * as path from 'path';
import { solidProxyOutput } from './output-solid';
export const normalizeOutputTarget = (config, outputTarget, validate = true) => {
    var _a, _b;
    if (validate) {
        validateOutputTarget(config, outputTarget);
    }
    const results = Object.assign(Object.assign({}, outputTarget), { excludeComponents: outputTarget.excludeComponents || [], includePolyfills: (_a = outputTarget.includePolyfills) !== null && _a !== void 0 ? _a : true, includeDefineCustomElements: (_b = outputTarget.includeDefineCustomElements) !== null && _b !== void 0 ? _b : true });
    if (outputTarget.directivesProxyFile && !path.isAbsolute(outputTarget.directivesProxyFile)) {
        results.proxiesFile = normalizePath(path.join(config.rootDir, outputTarget.proxiesFile));
    }
    return results;
};
const validateOutputTarget = (config, outputTarget) => {
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
export const solidOutputTarget = (outputTarget) => ({
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
