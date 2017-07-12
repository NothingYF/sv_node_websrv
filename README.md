
# sv_node_websrv
node web service with koa

## 安装

需要node v7.6.0以上版本支持

```javascript
npm set registry http://npm.scsv.online

npm adduser --registry http://npm.scsv.online
$ Username: scsv
$ Password: scsv
$ Email: scsv@scsv.online

npm install sv_node_websrv --save
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


//每分钟上报性能报告
setInterval(()=>
    {
        status_report(websrv.perf.value());
    },
    60000);
```

> 请求

```
curl http://localhost:9000/example/test

```


> 输出:

```
[2017-07-12 10:51:59.086] [INFO] websrv - Server start, listening on port 9000
[2017-07-12 10:52:02.120] [INFO] websrv - GET /example/test
  websrv hello +3s
  websrv route test ok +5ms
[2017-07-12 10:52:02.128] [INFO] websrv - GET /example/test: use 9ms
[2017-07-12 10:52:59.066] [INFO] websrv:perf - { tpmc: 37, input: 0, output: 238, art: '0.3' }
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
module.exports =  (router) => {
    router
        .get('a', func_a)
        .post('b/:id', func_b)
        .put('c/:id', func_c)
        .del('d/:id', func_d)
}
```

### Koa框架使用
详见 [koa](http://koajs.com/)