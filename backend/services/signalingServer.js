const logger = require('../utils/logger');

/**
 * WebRTC Signaling Server with Matchmaking Integration
 * Manages peer-to-peer connections between users and listeners
 */

class SignalingServer {
    constructor(io, matchmakingService) {
        this.io = io;
        this.matchmaking = matchmakingService;
        this.rooms = new Map(); // roomId -> { user: socketId, listener: socketId }
        this.users = new Map(); // socketId -> { roomId, role: 'user' | 'listener' }
    }

    initialize() {
        this.io.on('connection', (socket) => {
            logger.info(`WebRTC: New connection - ${socket.id}`);

            // ========== MATCHMAKING EVENTS ==========

            // User/Listener goes online
            socket.on('go-online', ({ name, email, role }) => {
                const stats = this.matchmaking.goOnline(socket.id, { name, email, role });
                socket.emit('online-success', { stats });
                this.io.emit('queue-update', stats);

                logger.info(`📊 Queue stats: ${stats.usersWaiting} users, ${stats.listenersAvailable} listeners`);
            });

            // User requests to be matched with a listener
            socket.on('request-match', ({ name, email, role, userName, userId }) => {
                // Handle both parameter formats: (name, email) or (userName, userId)
                const finalName = name || userName || 'Anonymous';
                const finalEmail = email || userId || `user_${socket.id}@temp.com`;
                const finalRole = role || 'client';

                // Ensure user is online first
                if (!this.matchmaking.onlineUsers.has(socket.id)) {
                    this.matchmaking.goOnline(socket.id, {
                        name: finalName,
                        email: finalEmail,
                        role: finalRole
                    });
                } else {
                    // If user is already online, update their info if role is provided
                    const existingUser = this.matchmaking.onlineUsers.get(socket.id);
                    if (existingUser) {
                        if (role) existingUser.role = role;
                        if (finalName) existingUser.name = finalName;
                        if (finalEmail) existingUser.email = finalEmail;
                    }
                }

                const result = this.matchmaking.requestMatch(socket.id);

                if (result.success && result.status === 'waiting') {
                    socket.emit('waiting-for-match', { message: 'Looking for a peer...' });
                } else if (!result.success) {
                    socket.emit('match-error', { error: result.error });
                }
                // If match was found immediately, MatchmakingService handles the emission
            });

            // Get queue stats
            socket.on('get-queue-stats', () => {
                const stats = this.matchmaking.getQueueStats();
                socket.emit('queue-update', stats);
            });

            // ========== WEBRTC SIGNALING EVENTS ==========

            // User joins a call room
            socket.on('join-room', ({ roomId, role, userId }) => {
                logger.info(`WebRTC: ${socket.id} joining room ${roomId} as ${role}`);

                socket.join(roomId);
                this.users.set(socket.id, { roomId, role, userId });

                // Initialize room if it doesn't exist
                if (!this.rooms.has(roomId)) {
                    this.rooms.set(roomId, {});
                }

                const room = this.rooms.get(roomId);
                room[role] = socket.id;

                // Notify the other peer that someone joined
                socket.to(roomId).emit('peer-joined', { role, socketId: socket.id });

                // If both peers are in the room, notify them to start connection
                if (room.user && room.listener) {
                    logger.info(`WebRTC: Room ${roomId} is ready - both peers present`);
                    this.io.to(roomId).emit('room-ready', {
                        user: room.user,
                        listener: room.listener
                    });
                }
            });

            // Forward WebRTC offer
            socket.on('offer', ({ offer, to }) => {
                logger.info(`WebRTC: Forwarding offer from ${socket.id} to ${to}`);
                socket.to(to).emit('offer', {
                    offer,
                    from: socket.id
                });
            });

            // Forward WebRTC answer
            socket.on('answer', ({ answer, to }) => {
                logger.info(`WebRTC: Forwarding answer from ${socket.id} to ${to}`);
                socket.to(to).emit('answer', {
                    answer,
                    from: socket.id
                });
            });

            // Forward ICE candidate
            socket.on('ice-candidate', ({ candidate, to }) => {
                logger.info(`WebRTC: Forwarding ICE candidate from ${socket.id} to ${to}`);
                socket.to(to).emit('ice-candidate', {
                    candidate,
                    from: socket.id
                });
            });

            // Handle call end
            socket.on('end-call', () => {
                this.handleDisconnect(socket);
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                logger.info(`WebRTC: Connection closed - ${socket.id}`);
                this.handleDisconnect(socket);

                // Remove from matchmaking
                const stats = this.matchmaking.goOffline(socket.id);
                if (stats) {
                    this.io.emit('queue-update', stats);
                }

                // Clean up any matches
                const cleanupResult = this.matchmaking.cleanupMatchesForSocket(socket.id);
                if (cleanupResult) {
                    // Notify the other peer
                    this.io.to(cleanupResult.otherSocketId).emit('peer-disconnected', {
                        message: 'Your call partner disconnected'
                    });
                }
            });
        });

        logger.info('WebRTC Signaling Server with Matchmaking initialized');
    }

    handleDisconnect(socket) {
        const userData = this.users.get(socket.id);

        if (userData) {
            const { roomId, role } = userData;
            const room = this.rooms.get(roomId);

            if (room) {
                // Notify the other peer that this peer left
                socket.to(roomId).emit('peer-left', { role });

                // Remove this peer from the room
                delete room[role];

                // If room is empty, remove it
                if (!room.user && !room.listener) {
                    this.rooms.delete(roomId);
                    logger.info(`WebRTC: Room ${roomId} deleted - empty`);
                }
            }

            this.users.delete(socket.id);
            socket.leave(roomId);
        }
    }

    // Get active rooms count (for monitoring)
    getActiveRoomsCount() {
        return this.rooms.size;
    }

    // Get active connections count
    getActiveConnectionsCount() {
        return this.users.size;
    }
}

module.exports = SignalingServer;
