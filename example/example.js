/**
 * Created by Nothing on 2017/6/2.
 */

const websrv = require('../index')('/example/');
const debug = require('debug')('websrv');

//日志回调
websrv.on('log', (...msg)=>{
    debug('weblog: ', msg.join(' '));
});

websrv.on('error', (err)=>{
    debug(err);
});

//加载中间件
websrv.use(async(ctx, next)=> {
    debug('hello');
    await next();
});

websrv.router.get('test', async(ctx, next) =>{
    debug('route test ok');
    JR(ctx, 'route test ok\n');
});

websrv.router.post('test', async(ctx, next) =>{
    ER(ctx, new Error('test error'));
});

websrv.filter(async(ctx, next)=>{
   debug('filter', ctx.status);
});

//启动服务
websrv.start(9000);


//打印性能日志
//setInterval(()=> debug(websrv.perf.value()), 60000);
