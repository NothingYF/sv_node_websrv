/**
 * Created by Nothing on 2017/6/1.
 */
require('./response');
const logger = require('sv_node_share').logger('websrv');
const http = require('http');

const koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');

const debug = require('debug')('websrv');
const perf = require('./perf')();

/**
 * websrv
 */
function websrv(prefix){

    if(!(this instanceof websrv)){
        return new websrv(prefix);
    }
    
    /**
     * 初始化
     * @param prefix
     */
    

    const app = new koa();
    const router = new Router({prefix : prefix});
    
    debug('prefix', prefix);

    this.app = app;
    this.router = router;
    this.perf = perf;

    perf.start();

    app.keys = ['#secret' + this.prefix];

    // 捕获异常，记录请求响应时间
    app.use(async(ctx, next) => {
        let start = new Date();
        let err = null;
        try {
            logger.info(`${ctx.method} ${ctx.url} `);
            ctx.status = SC.OK;
            await next();

        } catch (e) {
            ER(ctx, e);
            err = e ? e.message || e : e;
        }


        let ms = new Date() - start;
        logger.info(`${ctx.method} ${ctx.url}: use ${ms}ms`);

        this.perf.add_task();
        this.perf.rt(ms);

        if(ctx.body && ctx.body.length)
            this.perf.output(ctx.body.length);

        if(ctx.request.body && ctx.request.body.length)
            this.perf.intput(ctx.request.body.length);

    });

    app.on('error', function (err, ctx) {
        ER(ctx. err, SC.InternalServerError);
    });

    process.on('uncaughtException', function(err) {
        // handle the error safely
        logger.error('uncaughtException', err);
    });
    

    /**
     * 中间件
     */
    websrv.prototype.use = function(){

        debug('use', arguments);

        this.app.use.apply(app, arguments);
    }

    /**
     * 启动服务
     * @param port
     */
    websrv.prototype.start = function(port){

        // 消息体解析
        this.app.use(bodyparser());

        debug('routes', this.router.routes().length);

        this.app.use(this.router.routes(), this.router.allowedMethods());

        //处理404
        this.app.use(async(ctx, next) => {
            ER(ctx, 'Not Found ' + ctx.url, SC.NotFound);
        });

        /**
         * Create HTTP server.
         */
        let server = http.createServer(this.app.callback());

        /**
         * Listen on provided port, on all network interfaces.
         */

        server.listen(normalizePort(port));
        server.on('error', onError);
        server.on('listening', onListening);

        /**
         * Normalize a port into a number, string, or false.
         */

        function normalizePort(val = 8080) {
            let port = parseInt(val, 10);

            if (isNaN(port)) {
                // named pipe
                return val;
            }

            if (port >= 0) {
                // port number
                return port;
            }

            return false;
        }

        /**
         * Event listener for HTTP server "error" event.
         */

        function onError(error) {
            if (error.syscall !== 'listen') {
                throw error;
            }

            let bind = typeof port === 'string'
                ? 'Pipe ' + port
                : 'Port ' + port;

            // handle specific listen errors with friendly messages
            switch (error.code) {
                case 'EACCES':
                    logger.error(bind + ' requires elevated privileges');
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger.error(bind + ' is already in use');
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        }

        /**
         * Event listener for HTTP server "listening" event.
         */

        function onListening() {
            let addr = server.address();
            let bind = typeof addr === 'string'
                ? 'pipe ' + addr
                : 'port ' + addr.port;
            logger.info('Server start, listening on ' + bind);
        }

    }

}

exports = module.exports = websrv;
