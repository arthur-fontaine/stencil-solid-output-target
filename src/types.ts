export interface OutputTargetSolid {
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

export interface ComponentBindingConfig {
  elements: string | string[];
  event: string;
  targetProp: string;
}

export interface PackageJSON {
  types: string;
}
