const http = require('http')
const response = require('./response')
const request = require('./request')
const context = require('./context')

class SimpleKoa {
    constructor() {

        this.request = request
        this.response = response
        this.context = context
    }

    use(fn) {

        this.callbackFunc = ctx => {
            return new Promise(resolve => {
                fn(ctx)
                resolve(ctx)
            })
        }
    }

    /**
     *  返回一个请求处理回调函数，用作 http.createServer() 的参数
     * 
     * @return {Function}
     */

    callback() {
        const handleRequest = (req, res) => {

            const ctx = this.createContext(req, res)
            this.callbackFunc(ctx).then(respond)

        }

        return handleRequest
    }

    createContext(req, res) {
        const context = Object.create(this.context)
        context.request = Object.create(this.request)
        context.response = Object.create(this.response)
        context.response.res = res
        context.request.req = req

        context.req = req
        context.res = res

        return context
    }

    listen(...args) {
        const server = http.createServer(this.callback())
        server.listen(...args)
    }
}

/**
 * http 响应  写入 response body 并调用 response.end() 告知结束响应
 */

function respond(ctx) {
    const { res } = ctx

    res.end()
}

module.exports = SimpleKoa