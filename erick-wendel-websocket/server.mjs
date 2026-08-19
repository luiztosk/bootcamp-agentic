import { createServer } from 'http'
import crypto, { hash, webcrypto } from 'crypto'

const PORT = 1337
const WEBSOCK_MG_STR_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const server = createServer((req, res) => {
    res.writeHead(200)
    res.end('hello')
})
.listen(PORT, () => console.log('listening to port', PORT))

server.on('upgrade', onSocketUpgrade)

function onSocketUpgrade(req, socket, head) {
    const { 'sec-websocket-key': webClientSocketKey } = req.headers
    console.log(`${webClientSocketKey} connected!`)
    const headers = prepareHandshakeHeaders(webClientSocketKey)
    console.log({ headers })
    // console.log(`example MDN key: ${createSocketAccept('dGhlIHNhbXBsZSBub25jZQ==')}`)
    socket.write(headers)
}

function prepareHandshakeHeaders(id) {
    const acceptKey = createSocketAccept(id)
    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        ''
    ].map(line => line.concat('\r\n')).join('')
    // ].join('\r\n').concat('\r\n')
    return headers
}

function createSocketAccept(id) {
    const sha1 = crypto.createHash('sha1')
    sha1.update(id + WEBSOCK_MG_STR_KEY)
    return sha1.digest('base64')
}





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
