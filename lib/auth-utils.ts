import * as Koa from "koa"

export function getAuthPermissions( ctx: Koa.Context ) {
    const { authInfo } = ctx.state;
    if( !authInfo || !authInfo.permissions ) return [];
    return authInfo.permissions;
}

export function setAuthPermissions( ctx: Koa.Context, permissions: Array<String> = [] ) {
    ctx.state.authInfo = ctx.state.authInfo || {};
    ctx.state.authInfo.permissions = permissions;
}

export function verifyPermissions( ctx: Koa.Context, requiredPermissions: Array<String> = [] ) {
    const permissions = getAuthPermissions( ctx );
    if( permissions.length < requiredPermissions.length ) return false;
    // TODO: if a list of scopes grows above 16 we need to convert to hashmap
    let isAllFound = true;
    for( const permission of requiredPermissions ) {
        isAllFound = isAllFound && permissions.indexOf( permission ) > -1;
        if( !isAllFound ) break;
    }

    return isAllFound;
}
