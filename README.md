
# sv_node_websrv
node web service with koa

## 安装

需要node v7.6.0以上版本支持

```javascript
npm install sv_node_websrv
```

## 使用示例

```javascript
const websrv = require('sv_node_websrv')('/example/');
const debug = require('debug')('websrv:example');

//加载中间件
websrv.use(async(ctx, next)=> {
    debug('hello');
    await next();
});

websrv.router.get('test', async(ctx, next) =>{
    debug('route test ok');
    JR(ctx, 'route test ok\n');
});

//启动服务
websrv.start(9000);


//打印性能日志
setInterval(()=> debug(websrv.perf.value()), 10000);
```

> 输出:

```
[2017-07-12 10:51:59.086] [INFO] websrv - Server start, listening on port 9000
[2017-07-12 10:52:59.066] [INFO] websrv:perf - { tpmc: 17, input: 0, output: 238, art: '0.3' }
```

## 中间件

```javascript
websrv.use(async(ctx, next)=> {
    debug('hello');
    await next();
});
```

## 路由

> main.js

```javascript
require('router')(websrv.router);
````

> router.js

```javascript
router
    .get('a', func_a)
    .post('b/:id', func_b)
    .put('c/:id', func_c)
    .del('d/:id', func_d)

```

### Koa框架使用
详见 [koa](http://koajs.com/)