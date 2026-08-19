import { createServer } from 'http'
const PORT = 1337
createServer((req, res) => {
    res.writeHead(200)
    throw new Error('test')
    res.end('hello')
})
.listen(PORT, () => console.log('listening to port', PORT))


// error handling
;
[
    "uncaughtException",
    "unhandledRejection"
].forEach(event =>
    process.on(event, (err) => {
        console.error(`something bad happened, event: ${event}, msg: ${err.stack || err}`)
    })
)
