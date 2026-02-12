const logger = require('../utils/logger');

/**
 * Matchmaking Service
 * Manages online presence and automatic pairing of users with listeners
 */

class MatchmakingService {
    constructor(io) {
        this.io = io;
        // Store online users by socket ID
        this.onlineUsers = new Map(); // socketId -> {name, email, role, status, joinedAt}

        // Separate queues for role-based matching
        this.clientQueue = new Set(); // Set of client socketIds waiting for a match
        this.listenerQueue = new Set(); // Set of listener socketIds waiting for a match

        // Active matches
        this.activeMatches = new Map(); // roomId -> {userSocketId, listenerSocketId, startedAt}

        // Debug logging
        setInterval(() => {
            logger.info(`🔍 Queue Status: ${this.clientQueue.size} clients, ${this.listenerQueue.size} listeners waiting | ${this.onlineUsers.size} online, ${this.activeMatches.size} active matches`);
            if (this.clientQueue.size > 0) {
                logger.info(`   Clients waiting: ${Array.from(this.clientQueue).join(', ')}`);
            }
            if (this.listenerQueue.size > 0) {
                logger.info(`   Listeners waiting: ${Array.from(this.listenerQueue).join(', ')}`);
            }
        }, 10000);
    }

    /**
     * Add user to online presence
     */
    goOnline(socketId, userData) {
        const { name, email, role } = userData;

        this.onlineUsers.set(socketId, {
            name: name || 'Anonymous',
            email: email || 'anonymous@example.com',
            role: role || 'user',
            status: 'online',
            joinedAt: Date.now()
        });

        logger.info(`👥 User went online: ${socketId} as ${role} (${name})`);

        // Everyone is treated equally - no auto-queue for listeners
        // Users must explicitly request a match

        return this.getQueueStats();
    }

    /**
     * Remove user from online presence
     */
    goOffline(socketId) {
        const user = this.onlineUsers.get(socketId);
        if (!user) return;

        logger.info(`👋 User went offline: ${socketId} (${user.name})`);

        // Remove from both queues (whichever they're in)
        this.clientQueue.delete(socketId);
        this.listenerQueue.delete(socketId);

        // Remove from online users
        this.onlineUsers.delete(socketId);

        // Clean up any active matches
        this.cleanupMatchesForSocket(socketId);

        return this.getQueueStats();
    }

    /**
     * Request a match
     * Used by both users and listeners (implicitly or explicitly)
     */
    requestMatch(socketId) {
        const user = this.onlineUsers.get(socketId);
        if (!user) {
            return { success: false, error: 'User not found' };
        }

        // Add to appropriate queue based on role
        if (user.role === 'listener') {
            this.listenerQueue.add(socketId);
            logger.info(`🎧 Listener joined queue: ${socketId} (${user.name})`);
        } else {
            // Default to client queue for 'client', 'user', or any other role
            this.clientQueue.add(socketId);
            logger.info(`👤 Client joined queue: ${socketId} (${user.name})`);
        }

        user.status = 'waiting';

        // Try to find a match immediately
        this.tryMatch();

        // Check if user was matched (removed from queue)
        const stillWaiting = this.clientQueue.has(socketId) || this.listenerQueue.has(socketId);
        if (stillWaiting) {
            return { success: true, status: 'waiting' };
        } else {
            return { success: true, status: 'matched' };
        }
    }

    /**
     * Try to match users in the queue
     */
    /**
     * Try to match users in the queue
     * Only matches clients with listeners (role-based matching)
     */
    tryMatch() {
        logger.info(`🎲 tryMatch checking queues: ${this.clientQueue.size} clients, ${this.listenerQueue.size} listeners`);

        // Need at least one client AND one listener to match
        while (this.clientQueue.size >= 1 && this.listenerQueue.size >= 1) {
            // Get one client and one listener
            const clientArray = Array.from(this.clientQueue);
            const listenerArray = Array.from(this.listenerQueue);

            const clientId = clientArray[0];
            const listenerId = listenerArray[0];

            const client = this.onlineUsers.get(clientId);
            const listener = this.onlineUsers.get(listenerId);

            logger.info(`🤝 Attempting to match: Client ${clientId} (${client?.name}) ⚡ Listener ${listenerId} (${listener?.name})`);

            const result = this.createMatch(clientId, listenerId);

            // If match failed (ghost users?), we continue loop to try next pair
            if (!result) {
                logger.warn(`⚠️ Match failed for ${clientId} or ${listenerId}, retrying...`);
                // createMatch handles cleanup of ghosts
                continue;
            }

            // If success, we matched a client with a listener. Loop continues if more pairs available.
        }

        // Log if users are waiting but can't be matched
        if (this.clientQueue.size > 0 && this.listenerQueue.size === 0) {
            logger.info(`⏳ ${this.clientQueue.size} client(s) waiting for listeners`);
        }
        if (this.listenerQueue.size > 0 && this.clientQueue.size === 0) {
            logger.info(`⏳ ${this.listenerQueue.size} listener(s) waiting for clients`);
        }
    }

    /**
     * Create a match between two peers
     */
    createMatch(socketId1, socketId2) {
        const peer1 = this.onlineUsers.get(socketId1);
        const peer2 = this.onlineUsers.get(socketId2);

        // Handle ghost users
        if (!peer1) {
            logger.warn(`👻 Ghost user found in queue: ${socketId1} - removing`);
            this.clientQueue.delete(socketId1);
            this.listenerQueue.delete(socketId1);
        }
        if (!peer2) {
            logger.warn(`👻 Ghost user found in queue: ${socketId2} - removing`);
            this.clientQueue.delete(socketId2);
            this.listenerQueue.delete(socketId2);
        }

        if (!peer1 || !peer2) return null;

        // Remove both from their respective queues
        this.clientQueue.delete(socketId1);
        this.listenerQueue.delete(socketId1);
        this.clientQueue.delete(socketId2);
        this.listenerQueue.delete(socketId2);

        peer1.status = 'busy';
        peer2.status = 'busy';

        const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store match
        this.activeMatches.set(roomId, {
            userSocketId: socketId1,
            listenerSocketId: socketId2,
            startedAt: Date.now()
        });

        logger.info(`✨ Match created: ${roomId} (${peer1.name} ↔️ ${peer2.name})`);

        // Notify Peer 1 (acts as 'user' / initiator)
        if (this.io) {
            this.io.to(socketId1).emit('match-found', {
                roomId,
                role: 'user', // Initiator
                peer: {
                    name: peer2.name,
                    role: peer2.role,
                    socketId: socketId2
                },
                you: {
                    name: peer1.name,
                    role: peer1.role,
                    socketId: socketId1
                }
            });

            // Notify Peer 2 (acts as 'listener' / receiver)
            this.io.to(socketId2).emit('match-found', {
                roomId,
                role: 'listener', // Receiver
                peer: {
                    name: peer1.name,
                    role: peer1.role,
                    socketId: socketId1
                },
                you: {
                    name: peer2.name,
                    role: peer2.role,
                    socketId: socketId2
                }
            });

            // Broadcast updated queue stats
            this.io.emit('queue-update', this.getQueueStats());
        }

        return { roomId };
    }

    /**
     * End a match
     */
    endMatch(roomId) {
        const match = this.activeMatches.get(roomId);
        if (!match) return null;

        logger.info(`🔚 Match ended: ${roomId}`);

        // Update user statuses
        const user = this.onlineUsers.get(match.userSocketId);
        const listener = this.onlineUsers.get(match.listenerSocketId);

        if (user) user.status = 'online';
        if (listener) listener.status = 'online';

        // Remove match
        this.activeMatches.delete(roomId);

        return match;
    }

    /**
     * Clean up matches when a socket disconnects
     */
    cleanupMatchesForSocket(socketId) {
        for (const [roomId, match] of this.activeMatches.entries()) {
            if (match.userSocketId === socketId || match.listenerSocketId === socketId) {
                logger.info(`🧹 Cleaning up match due to disconnect: ${roomId}`);
                this.activeMatches.delete(roomId);

                // Notify the other peer
                const otherSocketId = match.userSocketId === socketId ? match.listenerSocketId : match.userSocketId;

                if (this.io) {
                    this.io.to(otherSocketId).emit('peer-disconnected');
                }

                return { roomId, otherSocketId };
            }
        }
        return null;
    }

    /**
     * Get queue statistics
     */
    getQueueStats() {
        return {
            clientsWaiting: this.clientQueue.size,
            listenersWaiting: this.listenerQueue.size,
            usersWaiting: this.clientQueue.size + this.listenerQueue.size, // Total for backward compatibility
            onlineUsers: this.onlineUsers.size,
            activeMatches: this.activeMatches.size
        };
    }

    /**
     * Get all online listeners (for display)
     */
    getOnlineListeners() {
        const listeners = [];
        for (const [socketId, user] of this.onlineUsers.entries()) {
            if (user.role === 'listener') {
                listeners.push({
                    socketId,
                    name: user.name,
                    status: user.status,
                    joinedAt: user.joinedAt
                });
            }
        }
        return listeners;
    }

    /**
     * Check if user is in a match
     */
    isInMatch(socketId) {
        for (const match of this.activeMatches.values()) {
            if (match.userSocketId === socketId || match.listenerSocketId === socketId) {
                return true;
            }
        }
        return false;
    }
}

module.exports = MatchmakingService;
