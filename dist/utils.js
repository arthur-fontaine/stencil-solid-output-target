/* eslint-disable no-param-reassign */
import path from 'path';
import { promisify } from 'util';
import fs from 'fs';
const readFile = promisify(fs.readFile);
const EXTENDED_PATH_REGEX = /^\\\\\?\\/;
const SLASH_REGEX = /\\/g;
// eslint-disable-next-line no-control-regex
const NON_ASCII_REGEX = /[^\x00-\x80]+/;
export const toLowerCase = (str) => str.toLowerCase();
export const dashToCamelCase = (str) => str
    .replace(/-([a-z])/g, (_, up) => up.toUpperCase());
export const dashToPascalCase = (str) => toLowerCase(str)
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');
export const sortBy = (array, prop) => array.slice().sort((a, b) => {
    const nameA = prop(a);
    const nameB = prop(b);
    if (nameA < nameB)
        return -1;
    if (nameA > nameB)
        return 1;
    return 0;
});
export function normalizePath(str) {
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
export const relativeImport = (pathFrom, pathTo, ext) => {
    let relativePath = path.relative(path.dirname(pathFrom), path.dirname(pathTo));
    if (relativePath === '') {
        relativePath = '.';
    }
    else if (relativePath[0] !== '.') {
        relativePath = `./${relativePath}`;
    }
    return normalizePath(`${relativePath}/${path.basename(pathTo, ext)}`);
};
export const readPackageJson = async (rootDir) => {
    const pkgJsonPath = path.join(rootDir, 'package.json');
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
