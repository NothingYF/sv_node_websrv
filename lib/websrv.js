/**
 * Created by Nothing on 2017/6/1.
 */
require('./response');
const http = require('http');
const EventEmitter = require('events').EventEmitter;
const util = require('util');
const koa = require('koa');
const bodyparser = require('koa-bodyparser');
const Router = require('koa-router');
const tools = require('sv_node_share').tools;
const debug = require('debug')('websrv');
const perf = require('./perf')();

const LOG_LEVELS = { DEBUG : 0, INFO : 1, WARN : 2, ERROR : 3, OPERATOR : 4};

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

    EventEmitter.call(this);

    const app = new koa();
    const router = new Router({prefix : prefix});
    
    debug('prefix', prefix);

    this.app = app;
    this.router = router;
    this.perf = perf;
    this.filters = [];

    perf.start();

    app.keys = ['#secret' + this.prefix];

    // 捕获异常，记录请求响应时间
    app.use(async(ctx, next) => {
        let start = new Date();
        let err = null;

        ctx.websrv = this;

        try {
            this.emit('log', LOG_LEVELS.INFO, `#${ctx.query.rc || ''}# ${ctx.method} ${ctx.url} `);

            ctx.status = SC.OK;
            await next();

        } catch (e) {
            ER(ctx, e);
            err = e ? e.message || e : e;
        }

        if(ctx.method == 'POST' && ctx.request.body)
            this.emit('log', LOG_LEVELS.DEBUG, `request: ${tools.isJSON(ctx.request.body) ? JSON.stringify(ctx.request.body) : ctx.request.body}`);

        let ms = new Date() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
        ctx.set('X-Request-Code', `${ctx.query.rc || ''}`);

        this.emit('log', LOG_LEVELS.INFO, `#${ctx.query.rc || ''}# ${ctx.method} ${ctx.url}: use ${ms}ms`);

        if(ctx.body){
            this.emit('log', LOG_LEVELS.DEBUG, `response: ${tools.isJSON(ctx.body) ? JSON.stringify(ctx.body) : ctx.body}`);
        }

        this.perf.add_task();
        this.perf.rt(ms);

        if(ctx.body && ctx.body.length)
            this.perf.output(ctx.body.length);

        if(ctx.request.body && ctx.request.body.length)
            this.perf.input(ctx.request.body.length);

        //执行过滤器
        for(let i = 0; i < this.filters.length; i++ ){
            try{
                await this.filters[i].call(this, ctx, next);
            }catch(e){
                this.emit('log', LOG_LEVELS.ERROR, e);
            }
        }

    });

    app.on('error', function (err, ctx) {
        ER(ctx. err, SC.InternalServerError);
    });

    process.on('uncaughtException', (err) => {
        // handle the error safely
        this.emit('error', err);
    });

    process.on('unhandledRejection', (reason, p) => {
        this.emit('error', util.format("Unhandled Rejection at: Promise ", p));
    });
    

    /**
     * 中间件
     */
    websrv.prototype.use = function(){

        debug('use', arguments);

        this.app.use.apply(app, arguments);
    };

    /**
     * 过滤器
     */
    websrv.prototype.filter = function(){

        debug('filter', arguments);

        this.filters.push.apply(this.filters, arguments);
    };

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

        server.listen(port, '0.0.0.0');
        server.on('error', (err)=>{
            this.emit('error', err);
        });
        server.on('listening', ()=>{
            this.emit('log', LOG_LEVELS.INFO, `Server start, listening on ${JSON.stringify(server.address())}`);
        });
    }

}

util.inherits(websrv, EventEmitter);

exports = module.exports = websrv;
