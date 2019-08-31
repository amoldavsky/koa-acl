import * as authUtils from "./auth-utils"
import * as Koa from "koa"

export interface Logger {
    info?: Function;
    error?: Function;
}

export interface ACLOptions {
    logger?: Logger;
    unauthorizedHttpCode?: Number;
}

const defaultLogger : Logger = {
    info: console.log,
    error: console.error
};
const defaultACLOptions: ACLOptions = {
    logger: defaultLogger,
    unauthorizedHttpCode: 403
};

export class ACL {
    options: ACLOptions;
    logger: Logger;
    private allACLs: Array<String>;

    constructor( options: ACLOptions = defaultACLOptions ) {
        // TODO: deep merge options with defaults
        this.options = options;
        this.logger = options.logger || defaultLogger;

        this.allACLs = [];
    }

    public acl( permissions: Array<String> = [] ) : Function {
        this.allACLs.push( ...permissions );
        return async ( ctx: Koa.Context, next: Function ) => {

            if( isSpecialAccess( ctx, next ) ) {
                // @ts-ignore
                this.logger.info('acl: isSpecialAccess true');
                authUtils.setAuthPermissions( ctx, this.allACLs );
                return await next();
            }

            // @ts-ignore
            this.logger.info('acl: needed permissions: ', permissions);
            // @ts-ignore
            this.logger.info('acl: supplied permissions: ', authUtils.getAuthPermissions(ctx) );

            if( permissions && permissions.length ) {
                const hasRequiredPermissions =  authUtils.verifyPermissions( ctx, permissions );
                if( !hasRequiredPermissions ) {
                    // logger.error('acl: user doest not meet required permissions');
                    ctx.throw( this.options.unauthorizedHttpCode! );
                }

                return await next();
            }
        };
    }
}

// TODO
// the function should have an encrypted token with scopes in it
// the API should be able to decrypt the token using a secret
function isSpecialAccess( ctx: Koa.Context, next: Function ) : boolean {

    const { headers } = ctx.req;
    if( headers ) {
        const authzKey = headers[ 'x-authz-key' ];
        if( authzKey === "SomeSecret1!" ) {
            // const permissions = [
            //     ACL.READ,
            //     ACL.WRITE
            // ];

            // ctx.state.user = {};
            // ctx.state.user.permissions = permissions.join( " " );
            // return await next();

            return true;
        }
    }

    // ctx.throw( 401 );
    // logger.info('acl: isSpecialAccess false');
    return false;
}
