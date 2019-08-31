export interface Logger {
    info?: Function;
    error?: Function;
}
export interface ACLOptions {
    logger?: Logger;
    unauthorizedHttpCode?: Number;
}
export declare class ACL {
    options: ACLOptions;
    logger: Logger;
    private allACLs;
    constructor(options?: ACLOptions);
    acl(permissions?: Array<String>): Function;
}
