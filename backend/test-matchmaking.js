const io = require('socket.io-client');

const URL = 'http://localhost:5000';

const socket1 = io(URL, { transports: ['websocket'] });
const socket2 = io(URL, { transports: ['websocket'] });

function setupSocket(socket, name) {
    socket.on('connect', () => {
        console.log(`✅ ${name} connected: ${socket.id}`);
        // Request match immediately
        socket.emit('request-match', { name: name, email: `${name}@test.com` });
    });

    socket.on('match-found', (data) => {
        console.log(`🎉 ${name} MATCHED!`, data);
        process.exit(0); // Success!
    });

    socket.on('waiting-for-match', (data) => {
        console.log(`⏳ ${name} waiting:`, data);
    });

    socket.on('match-error', (err) => {
        console.error(`❌ ${name} error:`, err);
    });
}

setupSocket(socket1, 'User1');

// Delay user 2 slightly
setTimeout(() => {
    setupSocket(socket2, 'User2');
}, 1000);

// Timeout
setTimeout(() => {
    console.log('❌ Test timed out - no match found');
    process.exit(1);
}, 5000);
