/**
 * Created by Nothing on 2016/1/14.
 */
const debug = require('debug')('websrv');

global.SC = {
    OK : 200,
    BadRequest : 400,
    Unauthorized : 401,
    Forbidden : 403,
    NotFound : 404,
    RequestTimeout : 408,
    Gone : 410,
    UnprocessableEntity : 422,
    InternalServerError : 500,
    NotImplemented : 501,
    BadGateway : 502,
    ServiceUnavailable : 503,
    NotActive: 1000,
    VerifyCodeError: 1001
};

global.ER = function (ctx, err, code) {
    if (err) {

        if(ctx.websrv){
            ctx.websrv.emit('error', err);
        }
        //debug(err);
        let retcode = err.status || parseInt(code) || SC.InternalServerError;

        if(retcode >= 1000){
            ctx.status = SC.InternalServerError;
        }else{
            ctx.status = retcode;
        }

        ctx.body = {status: {code: retcode, message : err.message || err }};
    } else {
        if(ctx.websrv){
            ctx.websrv.emit('error', 'unexcepted error');
        }
        ctx.status = SC.InternalServerError;
        ctx.body = {status: {code: SC.InternalServerError, message : 'unexcepted error'}};
    }
};

global.JR = async function(ctx, body){
    ctx.body = {status: {code: 200, message: 'Success'}};

    if(body){
        //logger.debug(body);
        ctx.body.data = body;
    }
    ctx.status = SC.OK;
};
