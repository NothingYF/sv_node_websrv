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
const kcors = require('kcors');
const websockify = require('koa-websocket');
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
    const app = websockify(new koa());
    const router = new Router({prefix : prefix});
    const wsrouter = new Router({prefix : prefix});

    debug('prefix', prefix);

    this.app = app;
    this.router = router;
    this.wsrouter = wsrouter;
    this.perf = perf;
    this.filters = [];
    this.logFilters = [];

    perf.start();

    app.keys = ['#secret' + this.prefix];

    app.use(kcors({ credentials: true }));

    // 捕获异常，记录请求响应时间
    app.use(async(ctx, next) => {
        let start = new Date();
        let err = null;
        let emitLog = true;

        ctx.websrv = this;

        try {
            let baseUrl = ctx.url.substr(0, ctx.url.indexOf('?'));
            emitLog = !this.logFilters.includes(baseUrl);
            if (emitLog) {
                this.emit('log', LOG_LEVELS.INFO, `#${ctx.query.rc || ''}# ${ctx.method} ${ctx.url} `);
            }

            ctx.start = start;
            ctx.status = SC.OK;
            ctx.baseUrl = baseUrl;
            await next();
        } catch (e) {
            ER(ctx, e);
            err = e ? e.message || e : e;
        }

        if(ctx.method == 'POST' && ctx.request.body && emitLog)
            this.emit('log', LOG_LEVELS.DEBUG, `request: ${tools.isJSON(ctx.request.body) ? JSON.stringify(ctx.request.body) : ctx.request.body}`);

        let ms = new Date() - start;
        ctx.set('X-Response-Time', `${ms}ms`);
        ctx.set('X-Request-Code', `${ctx.query.rc || ''}`);

        // 记录请求用时
        ctx.time = ms;
        if (emitLog) {
            this.emit('log', LOG_LEVELS.INFO, `#${ctx.query.rc || ''}# ${ctx.method} ${ctx.url}: use ${ms}ms`);
        }

        if(ctx.body && emitLog){
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
        ER(ctx, err, SC.InternalServerError);
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
     * Websocket中间件
     */
    websrv.prototype.wsuse = function(){
        debug('wsuse', arguments);
        this.app.ws.use.apply(app, arguments);
    };

    /**
     * 过滤器
     */
    websrv.prototype.filter = function(){
        debug('filter', arguments);
        this.filters.push.apply(this.filters, arguments);
    };

    /**
     * 日志过滤
     */
    websrv.prototype.logFilter = function(){
        debug('logFilter', arguments);
        this.logFilters.push.apply(this.logFilters, arguments);
        console.log(this.logFilters, arguments)
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
        this.app.ws.use(this.wsrouter.routes(), this.wsrouter.allowedMethods());

        //处理404
        this.app.use(async(ctx, next) => {
            ER(ctx, 'Not Found ' + ctx.url, SC.NotFound);
        });

        this.app.listen(port, '0.0.0.0');
        this.app.server.on('error', (err)=>{
            this.emit('error', err);
        });
        this.app.server.on('listening', ()=>{
            this.emit('log', LOG_LEVELS.INFO, `Server start, listening on ${JSON.stringify(this.app.server.address())}`);
        });
    }

}

util.inherits(websrv, EventEmitter);

exports = module.exports = websrv;
