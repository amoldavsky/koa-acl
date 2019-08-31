import * as Koa from "koa";
export declare function getAuthPermissions(ctx: Koa.Context): any;
export declare function setAuthPermissions(ctx: Koa.Context, permissions?: Array<String>): void;
export declare function verifyPermissions(ctx: Koa.Context, requiredPermissions?: Array<String>): boolean;
