import { createServer } from 'http'
import crypto, { hash, webcrypto } from 'crypto'

const PORT = 1337
const WEBSOCK_MG_STR_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

const FIRST_BIT = 128
const SEVEN_BITS_INTEGER_MARKER = 125
const SIXTEEN_BITS_INTEGER_MARKER = 126
const SIXTYFOUR_BITS_INTEGER_MARKER = 127
const MASK_KEY_BYTES_LENGH = 4

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
    socket.on('readable', () => onSocketReadable(socket))
}

function onSocketReadable(socket) {
    // consume optcode (first byte)
    socket.read(1)
    const [markerAndPayloadLength] = socket.read(1)
    const lengthIndicatorInBits = markerAndPayloadLength - FIRST_BIT

    let messageLength = 0
    if(lengthIndicatorInBits <= SEVEN_BITS_INTEGER_MARKER) {
        messageLength = lengthIndicatorInBits
    } else {
        throw new Error('message too long cant handle')
    }    
    const maskKey = socket.read(MASK_KEY_BYTES_LENGH)
    const encodedMessage = socket.read(messageLength)
    const decodedMessage = encodedMessage.map((byte, i) => byte ^ maskKey[i % 4]).toString()
    console.log(`${messageLength} bytes message received:`, decodedMessage)
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
