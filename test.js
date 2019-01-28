// this file is used to check out implemention of SimpleKoa

const SimpleKoa = require('./lib/applications')
const app = new SimpleKoa()

app.use(ctx => {
    ctx.body = "hello koa!"
    ctx.body = '  fdasdfasdf'
    console.log(ctx.query, ctx.url)
})

app.listen(8000, () => {
    console.log('server is running on 8000')
})