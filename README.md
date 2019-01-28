# 从 0 实现 koa 

本节我们仿照源码的思路尝试自己写一个 koa demo，实现 koa 的基本功能 [注：本文注释采用 koa 源码风格]

## 技术储备要求

1. 对 Node 有基本的了解
2. 熟悉 [node http 模块](https://javascript.ruanyifeng.com/nodejs/http.html)
3. 理解 [ES6 Promise](http://es6.ruanyifeng.com/#docs/promise) 、 [async await](https://tutorialzine.com/2017/07/javascript-async-await-explained) 等
4. 了解 [koa](http://www.ruanyifeng.com/blog/2017/08/koa.html) 的基本用法

## koa2 源码结构

```
├── lib
│   ├── application.js    // 入口文件，包含核心的中间件处理流程 
│   ├── context.js       
│   ├── request.js
│   └── response.js
└── package.json
```

## 开始实现

koa 源码思路大致分为如下四个步骤

1. 封装node http Server
2. 构造resquest, response, context对象
3. 中间件机制
4. 错误处理

### 最简 koa

先来看一下原生 node http 模块如何实现一个 web 服务器。（如遇原生 http 不熟悉 api 可自行查阅 [Node.js 中文网](http://nodejs.cn/api/http.html) ）

```js
const http = require('http')

const PORT = 8080,
   HOST = '127.0.0.1'

// http.createServer() 返回 server 实例
http.createServer((request, response) => {

    /**
     * 写入 HTTP 回应的头部信息（发送一个响应头给请求）
     * 
     * @param {number} statusCode  状态码
     * @param {string} statusMessage  
     * @param {Object} headers 
     */

    response.writeHead(200, 'ok===', {
        'Content-Type': 'text/plain'
    })

    /**
     * 写入响应主体内容
     * 
     * @param {string/Buffer} chunk 写入 response.body 的内容
     * @param {string} encoding 编码方式
     * @param {Function} callback 回调
     * 
     */

    response.write('Hello')

    /**
     * 通知服务器，所有响应头和相应主体都已经发送，每次响应都必须调用 response.end()
     * 
     * @param {string} data 如果指定了该参数则相当于调用了 response.write() 之后再调用 response.end(callback)
     * @param {string} encoding
     * @param {Function} callback  如果指定了 callback 则当响应流结束时被调用
     * @return this
     * 
     */

    response.end()

}).listen(PORT, HOST) // 监听本机的 8080 端口

```

koa 实质上就是对原生 node-http 模块用法进行封装，使得比原生 api 用起来更简单。
首先我们先实现最简 koa, 可以使用 `use` 添加一个请求的监听函数，并实现 `listen` 

```js
// application.js
class SimpleKoa {
    constructor() {

    }

    use(fn) {
        this.callbackFunc = fn
    }

    listen(...args) {
        http.createServer(this.callbackFunc).listen(...args)
    }
}

module.exports = SimpleKoa


// test.js

// 测试一下
const SimpleKoa = require('./applications')
const app = new SimpleKoa()

app.use((req, res) => {
    res.writeHead(200)
    res.end('hello koa')
})

app.listen(3000, () => {
    console.log('server is running on 3000')
})

```

至此我们的 koa-demo 已经有模有样了，但是官方 use 方法传参是`(ctx,next)`, ctx(context) 代表包含了 req/res 的上下文对象，通过这个对象，我们可以获取很多有用的信息，例如通过 ctx.url 获取 request 路径，通过 ctx.body 设置响应体，

接下来我们就继续完善它。要创建 context ,首先需要构建 request 以及 response 

多发点1[^footnote]
[^footnote]:testdfja

```
对象访问器属性 setter 和 getter 详见《javascript 高级程序设计》P 141
```

```js

// lib/request.js
const url = require('url')

module.exports = {


    /**
     * Get the request URL 
     */

    get url() {
        return this.req.url
    },

    /**
     * Get parsed query-string
     * 
     * @return {Object}
     */

    get query() {
        return url.parse(this.req.url, true).query
    }
}
```

```js
// lib/response.js

module.exports = {

    /**
     * Get response body
     * 
     * @return {Mixed}
     */

    get body() {
        return this.res.body
    },

    /**
     * Set response body
     * 
     * @param {String|Buffer|Object|Stream} val
     */

    set body(val) {
        this.res.write(val)
    },

    /**
     * Get response status code 
     * 
     * @return {number}
     */

    get status() {
        return this.res.status
    },

    /**
     * Set response status code
     * 
     * @param {number} val
     */

    set status(code) {
        this.res.status = code
    }
}
```