"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAuthPermissions(ctx) {
    const { authInfo } = ctx.state;
    if (!authInfo || !authInfo.permissions)
        return [];
    return authInfo.permissions;
}
exports.getAuthPermissions = getAuthPermissions;
function setAuthPermissions(ctx, permissions = []) {
    ctx.state.authInfo = ctx.state.authInfo || {};
    ctx.state.authInfo.permissions = permissions;
}
exports.setAuthPermissions = setAuthPermissions;
function verifyPermissions(ctx, requiredPermissions = []) {
    const permissions = getAuthPermissions(ctx);
    if (permissions.length < requiredPermissions.length)
        return false;
    // TODO: if a list of scopes grows above 16 we need to convert to hashmap
    let isAllFound = true;
    for (const permission of requiredPermissions) {
        isAllFound = isAllFound && permissions.indexOf(permission) > -1;
        if (!isAllFound)
            break;
    }
    return isAllFound;
}
exports.verifyPermissions = verifyPermissions;
