"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const authUtils = __importStar(require("./auth-utils"));
const defaultLogger = {
    info: console.log,
    error: console.error
};
const defaultACLOptions = {
    logger: defaultLogger,
    unauthorizedHttpCode: 403
};
class ACL {
    constructor(options = defaultACLOptions) {
        // TODO: deep merge options with defaults
        this.options = options;
        this.logger = options.logger || defaultLogger;
        this.allACLs = [];
    }
    acl(permissions = []) {
        this.allACLs.push(...permissions);
        return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
            if (isSpecialAccess(ctx, next)) {
                // @ts-ignore
                this.logger.info('acl: isSpecialAccess true');
                authUtils.setAuthPermissions(ctx, this.allACLs);
                return yield next();
            }
            // @ts-ignore
            this.logger.info('acl: needed permissions: ', permissions);
            // @ts-ignore
            this.logger.info('acl: supplied permissions: ', authUtils.getAuthPermissions(ctx));
            if (permissions && permissions.length) {
                const hasRequiredPermissions = authUtils.verifyPermissions(ctx, permissions);
                if (!hasRequiredPermissions) {
                    // logger.error('acl: user doest not meet required permissions');
                    ctx.throw(this.options.unauthorizedHttpCode);
                }
                return yield next();
            }
        });
    }
}
exports.ACL = ACL;
// TODO
// the function should have an encrypted token with scopes in it
// the API should be able to decrypt the token using a secret
function isSpecialAccess(ctx, next) {
    const { headers } = ctx.req;
    if (headers) {
        const authzKey = headers['x-authz-key'];
        if (authzKey === "SomeSecret1!") {
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
