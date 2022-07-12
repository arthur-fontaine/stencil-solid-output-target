import type { PackageJSON } from './types';
export declare const toLowerCase: (str: string) => string;
export declare const dashToCamelCase: (str: string) => string;
export declare const dashToPascalCase: (str: string) => string;
export declare const sortBy: <T>(array: readonly T[], prop: (item: T) => string) => T[];
export declare function normalizePath(str: string): string;
export declare const relativeImport: (pathFrom: string, pathTo: string, ext?: string) => string;
export declare const readPackageJson: (rootDir: string) => Promise<PackageJSON>;
