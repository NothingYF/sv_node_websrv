/**
 * Created by Nothing on 2017/6/2.
 */

const websrv = require('../index')('/example/');
const logger = require('sv_node_share').logger('example');

//加载中间件
websrv.use(async(ctx, next)=> {
    logger.debug('hello');
    await next();
});

websrv.router.get('test', async(ctx, next) =>{
    logger.debug('route test ok');
    JR(ctx, 'route test ok\n');
});

websrv.router.post('test', async(ctx, next) =>{
    ER(ctx, new Error('test error'));
});

websrv.filter(async(ctx, next)=>{
    logger.debug('filter', ctx.status);
});

//启动服务
websrv.start(9000);


//打印性能日志
//setInterval(()=> debug(websrv.perf.value()), 60000);
