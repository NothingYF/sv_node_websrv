
# sv_node_websrv
node web service with koa

## 安装

需要node v7.6.0以上版本支持

```
npm install sv_node_websrv
```

## 使用示例

---

```javascript
const websrv = require('../index')('/example/');
const debug = require('debug')('websrv');

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

### WebService
详见 [koa](http://koajs.com/)