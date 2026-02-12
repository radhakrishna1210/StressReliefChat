const io = require('socket.io-client');

// Use the WebRTC server port
const URL = 'http://localhost:5000';

const socket1 = io(URL, {
    transports: ['websocket'],
    reconnection: false,
    forceNew: true
});

const socket2 = io(URL, {
    transports: ['websocket'],
    reconnection: false,
    forceNew: true
});

function setupSocket(socket, name) {
    socket.on('connect', () => {
        console.log(`✅ ${name} connected: ${socket.id}`);
        // Go online first
        socket.emit('go-online', { name: name, email: `${name}@test.com`, role: 'user' });

        setTimeout(() => {
            console.log(`🔍 ${name} requesting match...`);
            socket.emit('request-match', { name: name, email: `${name}@test.com` });
        }, 500);
    });

    socket.on('match-found', (data) => {
        console.log(`🎉 ${name} MATCHED! Room: ${data.roomId} with ${data.peer.name}`);
        // Don't exit immediately so the other one can log too
        if (name === 'User2') {
            setTimeout(() => process.exit(0), 1000);
        }
    });

    socket.on('waiting-for-match', (data) => {
        console.log(`⏳ ${name} waiting:`, data.message);
    });

    socket.on('match-error', (err) => {
        console.error(`❌ ${name} error:`, err);
    });
}

setupSocket(socket1, 'User1');

// Delay user 2
setTimeout(() => {
    setupSocket(socket2, 'User2');
}, 1000);

// Timeout
setTimeout(() => {
    console.log('❌ Test timed out - no match found');
    process.exit(1);
}, 8000);
