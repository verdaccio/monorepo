// @flow

import type { NextFunction, $Request, $Response } from 'request';

export type $RequestExtend = $Request;
export type $ResponseExtend = $Response;
export type $NextFunctionVer = NextFunction & mixed;

export type ConfigAudit = {
  enabled: boolean
};
