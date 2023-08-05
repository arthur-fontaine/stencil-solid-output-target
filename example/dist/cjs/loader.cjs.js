'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const index = require('./index-68698cdd.js');

/*
 Stencil Client Patch Esm v2.17.1 | MIT Licensed | https://stenciljs.com
 */
const patchEsm = () => {
    return index.promiseResolve();
};

const defineCustomElements = (win, options) => {
  if (typeof window === 'undefined') return Promise.resolve();
  return patchEsm().then(() => {
  return index.bootstrapLazy([["my-component.cjs",[[1,"my-component"]]]], options);
  });
};

exports.defineCustomElements = defineCustomElements;
