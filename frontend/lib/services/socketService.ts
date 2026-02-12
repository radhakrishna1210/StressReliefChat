import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private readonly serverUrl: string;

    constructor() {
        // IMPORTANT (LAN testing):
        // If a user opens the frontend via http://<PC_IP>:3000 on another device,
        // "localhost" would refer to THAT device, not the PC hosting the backend.
        //
        // So if NEXT_PUBLIC_API_URL isn't set (or is left as localhost), we derive the backend
        // URL from the current page hostname and assume backend is on port 5000.
        const envUrl = process.env.NEXT_PUBLIC_API_URL;
        const isBrowser = typeof window !== 'undefined';
        const host = isBrowser ? window.location.hostname : 'localhost';
        const derivedUrl = `http://${host}:5000`;

        // Prefer explicit env var, but treat localhost as a dev default that should not override LAN usage.
        this.serverUrl =
            (envUrl && envUrl !== 'http://localhost:5000' && envUrl !== 'localhost:5000')
                ? envUrl
                : derivedUrl;
    }

    connect(): Socket {
        if (!this.socket) {
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
            });

            this.socket.on('connect', () => {
                console.log('✅ Socket.IO connected:', this.socket?.id);
            });

            this.socket.on('disconnect', (reason) => {
                console.log('❌ Socket.IO disconnected:', reason);
            });

            this.socket.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error);
            });
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // WebRTC signaling methods
    joinRoom(roomId: string, role: 'user' | 'listener', userId: string) {
        if (this.socket) {
            console.log(`📞 Joining room ${roomId} as ${role}`);
            this.socket.emit('join-room', { roomId, role, userId });
        }
    }

    sendOffer(offer: RTCSessionDescriptionInit, to: string) {
        if (this.socket) {
            console.log(`📤 Sending offer to ${to}`);
            this.socket.emit('offer', { offer, to });
        }
    }

    sendAnswer(answer: RTCSessionDescriptionInit, to: string) {
        if (this.socket) {
            console.log(`📤 Sending answer to ${to}`);
            this.socket.emit('answer', { answer, to });
        }
    }

    sendIceCandidate(candidate: RTCIceCandidate, to: string) {
        if (this.socket) {
            this.socket.emit('ice-candidate', { candidate, to });
        }
    }

    endCall() {
        if (this.socket) {
            console.log('📞 Ending call');
            this.socket.emit('end-call');
        }
    }

    // Event listeners
    onPeerJoined(callback: (data: { role: string; socketId: string }) => void) {
        if (this.socket) {
            this.socket.on('peer-joined', callback);
        }
    }

    onRoomReady(callback: (data: { user: string; listener: string }) => void) {
        if (this.socket) {
            this.socket.on('room-ready', callback);
        }
    }

    onOffer(callback: (data: { offer: RTCSessionDescriptionInit; from: string }) => void) {
        if (this.socket) {
            this.socket.on('offer', callback);
        }
    }

    onAnswer(callback: (data: { answer: RTCSessionDescriptionInit; from: string }) => void) {
        if (this.socket) {
            this.socket.on('answer', callback);
        }
    }

    onIceCandidate(callback: (data: { candidate: RTCIceCandidate; from: string }) => void) {
        if (this.socket) {
            this.socket.on('ice-candidate', callback);
        }
    }

    onPeerLeft(callback: (data: { role: string }) => void) {
        if (this.socket) {
            this.socket.on('peer-left', callback);
        }
    }

    // Cleanup specific WebRTC listeners to avoid wiping everything
    cleanupWebRTCListeners() {
        if (this.socket) {
            this.socket.off('peer-joined');
            this.socket.off('room-ready');
            this.socket.off('offer');
            this.socket.off('answer');
            this.socket.off('ice-candidate');
            this.socket.off('peer-left');
        }
    }

    // Remove all listeners
    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService();
