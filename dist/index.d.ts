import { OutputTargetCustom } from '@stencil/core/internal';

interface OutputTargetSolid {
    componentCorePackage?: string;
    proxiesFile: string;
    excludeComponents?: string[];
    directivesProxyFile?: string;
    loaderDir?: string;
    includePolyfills?: boolean;
    includeDefineCustomElements?: boolean;
    includeImportCustomElements?: boolean;
    customElementsDir?: string;
}
interface ComponentBindingConfig {
    elements: string | string[];
    event: string;
    targetProp: string;
}
interface PackageJSON {
    types: string;
}

declare const solidOutputTarget: (outputTarget: OutputTargetSolid) => OutputTargetCustom;

export { ComponentBindingConfig, OutputTargetSolid, PackageJSON, solidOutputTarget };
