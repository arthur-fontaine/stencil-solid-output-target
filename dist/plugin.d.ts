import { Config, OutputTargetCustom } from '@stencil/core/internal';
import { OutputTargetSolid } from './types';
export declare const normalizeOutputTarget: (config: Config, outputTarget: OutputTargetSolid, validate?: boolean) => OutputTargetSolid;
export declare const solidOutputTarget: (outputTarget: OutputTargetSolid) => OutputTargetCustom;
