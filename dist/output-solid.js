import { dashToPascalCase, normalizePath, readPackageJson, relativeImport, sortBy } from './utils';
import * as path from 'path';
export const GENERATED_DTS = 'components.d.ts';
const IMPORT_TYPES = 'JSX';
const REGISTER_CUSTOM_ELEMENTS = 'defineCustomElements';
const APPLY_POLYFILLS = 'applyPolyfills';
const DEFAULT_LOADER_DIR = '/dist/loader';
export const getFilteredComponents = (excludeComponents = [], components) => {
    return sortBy(components, (component) => component.tagName).filter((component) => !excludeComponents.includes(component.tagName) && !component.internal);
};
export const getPathToCorePackageLoader = (config, outputTarget) => {
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
export function createComponentDefinition(componentCompilerMeta, includeImportCustomElements = false) {
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
export const generateProxies = (config, components, pkgData, outputTarget, rootDir) => {
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
export const copyResources = async (config, outputTarget) => {
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
export async function solidProxyOutput(config, compilerCtx, outputTarget, components) {
    const filteredComponents = getFilteredComponents(outputTarget.excludeComponents, components);
    const rootDir = config.rootDir;
    const pkgData = await readPackageJson(rootDir);
    const finalText = generateProxies(config, filteredComponents, pkgData, outputTarget, rootDir);
    await compilerCtx.fs.writeFile(outputTarget.proxiesFile, finalText);
    await copyResources(config, outputTarget);
}
