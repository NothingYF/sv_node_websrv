/**
 * Created by Nothing on 2017/6/2.
 */

const websrv = require('../index')('/example/');
const logger = require('sv_node_share').logger('example');
const weblog = require('sv_node_share').logger('websrv');

const LOG_LEVELS = { DEBUG : 0, INFO : 1, WARN : 2, ERROR : 3, OPERATOR : 4};

//加载中间件
websrv.use(async(ctx, next)=> {
    logger.debug('hello');
    await next();
});

websrv.router.get('test', async(ctx, next) =>{
    logger.debug('route test ok');
    JR(ctx, 'route test ok');
});

websrv.router.post('test', async(ctx, next) =>{
    ER(ctx, new Error('test error'));
});

websrv.on('log', (level, msg)=>{
   weblog.log(level, msg);
});

websrv.on('error', (err)=>{
    weblog.error(err);
});

websrv.wsrouter.get('log/:id', async(ctx, next) =>{
    logger.debug('wsroute log ' + ctx.params.id);
    ctx.websocket.on('message', (message) => {
        logger.debug(message);
        ctx.websocket.send(ctx.params.id + ': ' + message);
    });
});

//启动服务
websrv.start(9000);

// (async()=>{
//     let a = 0;
//     websrv.test('test');
// })();

//打印性能日志
//setInterval(()=> debug(websrv.perf.value()), 60000);
