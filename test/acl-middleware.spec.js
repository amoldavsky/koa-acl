const Koa = require('koa');
const Router = require( 'koa-router' );
const http = require('http');

const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const KoaACL = require( '../dist/acl-middleware' ).ACL;

chai.use(chaiHttp);

const port = 5000;
const ipAddress = '127.0.0.1';

const koaACL = new KoaACL();

describe("ACL middleware permissions", () => {
    let app;
    let server;
    before(() => {
        app = new Koa();
        server = http.createServer(app.callback()).listen(port, ipAddress, () => {
            console.log('✅  The server is running at ' + ipAddress + ':' + port + '/')
        });
    })

    after(() => {
        server.close();

        // https://github.com/chaijs/chai-http/issues/178
        setTimeout( () => process.exit(), 100 );
    });

    const ACL = {
        READ: 'test:read',
        WRITE: 'test:write'
    };
    const router = new Router();
    router.prefix( `/test/acl` );

    it("meet all permissions", done => {

        const requiredOermissions = Object.values(ACL);
        const suppliedPermissions = requiredOermissions;

        router.get( '/full',
            async ( ctx, next ) => {
                ctx.state.authInfo = { permissions: suppliedPermissions };
                return await next();
            },
            koaACL.acl( requiredOermissions ),
            ctx => ctx.body = "yum!"
        );
        app.use(router.routes());

        chai
            .request(server)
            // .request("http://localhost:5000")
            .get("/test/acl/full")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).equal("yum!");
                done();
            });
    });

    it("meet partial permissions", done => {

        const requiredOermissions = Object.values(ACL);
        const suppliedPermissions = requiredOermissions.slice(1);

        router.get( '/partial',
            async ( ctx, next ) => {
                ctx.state.authInfo = { permissions: suppliedPermissions };
                return await next();
            },
            koaACL.acl( requiredOermissions ),
            ctx => ctx.body = "yum!"
        );
        app.use(router.routes());

        chai
            .request(server)
            // .request("http://localhost:5000")
            .get("/test/acl/partial")
            .end((err, res) => {
                expect(res).to.have.status(403);
                done();
            });
    });

    // TODO: fix this!
    // it("ts MW this test", done => {
    //
    //     class Middleware {
    //         constructor( text ) {
    //             this.text = text
    //         }
    //
    //         doSomething( something ) {
    //             const _this = this;
    //             return function( ctx, next ) {
    //                 console.log( `${_this.text}-${something}` );
    //                 return next();
    //             }
    //         }
    //     }
    //
    //
    //
    //     const mw = new Middleware( "foo" );
    //
    //     // why is this creating an issue??
    //     const doSomething = mw.doSomething;
    //
    //     // let's offset / mess the "this" context
    //     (async () => {
    //         await new Promise( (resolve) => {
    //             setTimeout( () => {
    //                 const temp = doSomething( "bar", () => {} );
    //                 temp();
    //                 resolve();
    //                 done();
    //             }, 10 );
    //         });
    //     })();
    // });
});
