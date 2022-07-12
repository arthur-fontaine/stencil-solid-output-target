import * as path from 'path';
import path__default from 'path';
import { promisify } from 'util';
import fs from 'fs';

/* eslint-disable no-param-reassign */
const readFile = promisify(fs.readFile);
const EXTENDED_PATH_REGEX = /^\\\\\?\\/;
const SLASH_REGEX = /\\/g;
// eslint-disable-next-line no-control-regex
const NON_ASCII_REGEX = /[^\x00-\x80]+/;
const toLowerCase = (str) => str.toLowerCase();
const dashToPascalCase = (str) => toLowerCase(str)
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
const sortBy = (array, prop) => array.slice().sort((a, b) => {
    const nameA = prop(a);
    const nameB = prop(b);
    if (nameA < nameB)
        return -1;
    if (nameA > nameB)
        return 1;
    return 0;
});
function normalizePath(str) {
    if (typeof str !== 'string') {
        throw new Error('invalid path to normalize');
    }
    str = str.trim();
    if (EXTENDED_PATH_REGEX.test(str) || NON_ASCII_REGEX.test(str)) {
        return str;
    }
    str = str.replace(SLASH_REGEX, '/');
    // always remove the trailing /
    // this makes our file cache look ups consistent
    if (str.charAt(str.length - 1) === '/') {
        const colonIndex = str.indexOf(':');
        if (colonIndex > -1) {
            if (colonIndex < str.length - 2) {
                str = str.substring(0, str.length - 1);
            }
        }
        else if (str.length > 1) {
            str = str.substring(0, str.length - 1);
        }
    }
    return str;
}
const relativeImport = (pathFrom, pathTo, ext) => {
    let relativePath = path__default.relative(path__default.dirname(pathFrom), path__default.dirname(pathTo));
    if (relativePath === '') {
        relativePath = '.';
    }
    else if (relativePath[0] !== '.') {
        relativePath = `./${relativePath}`;
    }
    return normalizePath(`${relativePath}/${path__default.basename(pathTo, ext)}`);
};
const readPackageJson = async (rootDir) => {
    const pkgJsonPath = path__default.join(rootDir, 'package.json');
    let pkgJson;
    try {
        pkgJson = await readFile(pkgJsonPath, 'utf8');
    }
    catch (e) {
        throw new Error(`Missing "package.json" file for distribution: ${pkgJsonPath}`);
    }
    let pkgData;
    try {
        pkgData = JSON.parse(pkgJson);
    }
    catch (e) {
        throw new Error(`Error parsing package.json: ${pkgJsonPath}, ${e}`);
    }
    return pkgData;
};

const GENERATED_DTS = 'components.d.ts';
const IMPORT_TYPES = 'JSX';
const REGISTER_CUSTOM_ELEMENTS = 'defineCustomElements';
const APPLY_POLYFILLS = 'applyPolyfills';
const DEFAULT_LOADER_DIR = '/dist/loader';
const getFilteredComponents = (excludeComponents = [], components) => {
    return sortBy(components, (component) => component.tagName).filter((component) => !excludeComponents.includes(component.tagName) && !component.internal);
};
const getPathToCorePackageLoader = (config, outputTarget) => {
    var _a;
    const basePkg = outputTarget.componentCorePackage || '';
    const distOutputTarget = (_a = config.outputTargets) === null || _a === void 0 ? void 0 : _a.find((o) => o.type === 'dist');
    const distAbsEsmLoaderPath = (distOutputTarget === null || distOutputTarget === void 0 ? void 0 : distOutputTarget.esmLoaderPath) && path.isAbsolute(distOutputTarget.esmLoaderPath)
        ? distOutputTarget.esmLoaderPath
        : null;
    const distRelEsmLoaderPath = config.rootDir && distAbsEsmLoaderPath
        ? path.relative(config.rootDir, distAbsEsmLoaderPath)
        : null;
    const loaderDir = outputTarget.loaderDir || distRelEsmLoaderPath || DEFAULT_LOADER_DIR;
    return normalizePath(path.join(basePkg, loaderDir));
};
function createComponentDefinition(componentCompilerMeta, includeImportCustomElements = false) {
    const tagNameAsPascal = dashToPascalCase(componentCompilerMeta.tagName);
    let template = `export const ${tagNameAsPascal} = /*@__PURE__*/createSolidComponent<${IMPORT_TYPES}.${tagNameAsPascal}, HTML${tagNameAsPascal}Element>('${componentCompilerMeta.tagName}'`;
    if (includeImportCustomElements) {
        template += `, undefined, undefined, define${tagNameAsPascal}`;
    }
    template += `);`;
    return [
        template,
    ];
}
const generateProxies = (config, components, pkgData, outputTarget, rootDir) => {
    const distTypesDir = path.dirname(pkgData.types);
    const dtsFilePath = path.join(rootDir, distTypesDir, GENERATED_DTS);
    const componentsTypeFile = relativeImport(outputTarget.proxiesFile, dtsFilePath, '.d.ts');
    const pathToCorePackageLoader = getPathToCorePackageLoader(config, outputTarget);
    const imports = `/* eslint-disable */
/* tslint:disable */
/* auto-generated solid proxies */
import { createSolidComponent } from './solid-component-lib';\n`;
    const generateTypeImports = () => {
        if (outputTarget.componentCorePackage !== undefined) {
            const dirPath = outputTarget.includeImportCustomElements ? `/${outputTarget.customElementsDir || 'components'}` : '';
            return `import type { ${IMPORT_TYPES} } from '${normalizePath(outputTarget.componentCorePackage)}${dirPath}';\n`;
        }
        return `import type { ${IMPORT_TYPES} } from '${normalizePath(componentsTypeFile)}';\n`;
    };
    const typeImports = generateTypeImports();
    let sourceImports = '';
    let registerCustomElements = '';
    if (outputTarget.includeImportCustomElements && outputTarget.componentCorePackage !== undefined) {
        const componentImports = components.map(component => {
            const pascalImport = dashToPascalCase(component.tagName);
            return `import { defineCustomElement as define${pascalImport} } from '${normalizePath(outputTarget.componentCorePackage)}/${outputTarget.customElementsDir ||
                'components'}/${component.tagName}.js';`;
        });
        sourceImports = componentImports.join('\n');
    }
    else if (outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
        sourceImports = `import { ${APPLY_POLYFILLS}, ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`;
        registerCustomElements = `${APPLY_POLYFILLS}().then(() => ${REGISTER_CUSTOM_ELEMENTS}());`;
    }
    else if (!outputTarget.includePolyfills && outputTarget.includeDefineCustomElements) {
        sourceImports = `import { ${REGISTER_CUSTOM_ELEMENTS} } from '${pathToCorePackageLoader}';\n`;
        registerCustomElements = `${REGISTER_CUSTOM_ELEMENTS}();`;
    }
    return [
        imports,
        typeImports,
        sourceImports,
        registerCustomElements,
        components.map(cmpMeta => createComponentDefinition(cmpMeta, outputTarget.includeImportCustomElements)).join('\n'),
    ].join('\n') + '\n';
};
const copyResources = async (config, outputTarget) => {
    if (!config.sys || !config.sys.copy || !config.sys.glob) {
        throw new Error('stencil is not properly initialized at this step. Notify the developer');
    }
    const srcDirectory = path.join(__dirname, 'solid-component-lib');
    const destDirectory = path.join(path.dirname(outputTarget.proxiesFile), 'solid-component-lib');
    return config.sys.copy([
        {
            src: srcDirectory,
            dest: destDirectory,
            keepDirStructure: false,
            warn: false,
        },
    ], srcDirectory);
};
async function solidProxyOutput(config, compilerCtx, outputTarget, components) {
    const filteredComponents = getFilteredComponents(outputTarget.excludeComponents, components);
    const rootDir = config.rootDir;
    const pkgData = await readPackageJson(rootDir);
    const finalText = generateProxies(config, filteredComponents, pkgData, outputTarget, rootDir);
    await compilerCtx.fs.writeFile(outputTarget.proxiesFile, finalText);
    await copyResources(config, outputTarget);
}

const normalizeOutputTarget = (config, outputTarget, validate = true) => {
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
const solidOutputTarget = (outputTarget) => ({
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

export { solidOutputTarget };
