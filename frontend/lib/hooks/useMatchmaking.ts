
import { useState, useEffect } from 'react';
import socketService from '../services/socketService';

export interface MatchData {
    roomId: string;
    peerId: string;
    role: 'user' | 'listener';
    peerName?: string;
    peer: {
        name: string;
        role: string;
        socketId: string;
    };
    you: {
        name: string;
        role: string;
        socketId: string;
    };
}

export function useMatchmaking(userId: string, userName: string, role: 'user' | 'listener') {
    const [matchData, setMatchData] = useState<MatchData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isWaiting, setIsWaiting] = useState(false);

    useEffect(() => {
        const socket = socketService.connect();
        if (!socket) return;

        // Match found
        const handleMatchFound = (data: MatchData) => {
            console.log('✅ Match found:', data);
            setMatchData(data);
            setIsWaiting(false);
        };

        // Peer disconnected
        const handlePeerDisconnected = () => {
            console.log('👋 Peer disconnected');
            setMatchData(null);
            setError('Your peer has disconnected');
        };

        // Match failed
        const handleMatchFailed = ({ message }: { message: string }) => {
            console.error('❌ Match failed:', message);
            setError(message);
            setIsWaiting(false);
        };

        // Register listeners
        socket.on('match-found', handleMatchFound);
        socket.on('peer-disconnected', handlePeerDisconnected);
        socket.on('match-failed', handleMatchFailed);

        return () => {
            socket.off('match-found', handleMatchFound);
            socket.off('peer-disconnected', handlePeerDisconnected);
            socket.off('match-failed', handleMatchFailed);
        };
    }, []);

    const requestMatch = () => {
        setIsWaiting(true);
        setError(null);
        setMatchData(null);

        // Ensure socket is connected
        const socket = socketService.connect();
        if (socket) {
            console.log('🔍 Requesting match as:', role, userId);
            socket.emit('request-match', { userId, userName, role });
        } else {
            setError('Connection failed. Please refresh.');
            setIsWaiting(false);
        }
    };

    const cancelMatch = () => {
        setIsWaiting(false);
        const socket = socketService.connect();
        if (socket) {
            socket.emit('leave-queue', { userId });
        }
    };

    return {
        matchData,
        error,
        isWaiting,
        requestMatch,
        cancelMatch
    };
}
