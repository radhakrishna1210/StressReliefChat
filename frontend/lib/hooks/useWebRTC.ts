
import { useState, useEffect, useCallback, useRef } from 'react';
import socketService from '../services/socketService';

export function useWebRTC(roomId: string, role: 'user' | 'listener', userId: string) {
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const remotePeerIdRef = useRef<string | null>(null);

    // Toggle mute
    const toggleMute = useCallback(() => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [localStream]);

    // Cleanup - use refs to avoid stale closures
    const cleanup = useCallback(() => {
        console.log('🧹 Cleaning up WebRTC connection...');

        // Stop local stream using state
        setLocalStream((currentStream) => {
            if (currentStream) {
                currentStream.getTracks().forEach((track) => {
                    track.stop();
                    console.log('🛑 Stopped track:', track.kind);
                });
            }
            return null;
        });

        // Close peer connection
        if (peerConnectionRef.current) {
            console.log('🔌 Closing peer connection');
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Disconnect socket
        socketService.endCall();
        socketService.cleanupWebRTCListeners();

        setRemoteStream(null);
        setConnectionState('closed');
        setIsConnected(false);
    }, []); // No dependencies - uses refs and setState callbacks

    // Initialize Media
    const initializeMedia = useCallback(async () => {
        try {
            console.log('🎤 Requesting microphone access...');
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
            console.log('✅ Microphone access granted');
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error('❌ Microphone error:', err);
            throw new Error('Access to microphone disallowed');
        }
    }, []);

    // Create RTCPeerConnection
    const createPeerConnection = useCallback((stream: MediaStream) => {
        console.log('🛠 Creating RTCPeerConnection');
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
            ],
        });

        // Add local tracks
        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
        });

        // Handle remote stream
        pc.ontrack = (event) => {
            console.log('🌊 Received remote stream');
            setRemoteStream(event.streams[0]);
            setIsConnected(true);
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && remotePeerIdRef.current) {
                socketService.sendIceCandidate(event.candidate, remotePeerIdRef.current);
            }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
            console.log('📡 Connection state:', pc.connectionState);
            setConnectionState(pc.connectionState);
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                setIsConnected(false);
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    }, []);

    // Create Offer
    const createOffer = useCallback(async (pc: RTCPeerConnection, targetId: string) => {
        try {
            console.log('📤 Creating offer for:', targetId);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socketService.sendOffer(offer, targetId);
        } catch (err) {
            console.error('Error creating offer:', err);
        }
    }, []);

    // Handle Offer
    const handleOffer = useCallback(async (offer: RTCSessionDescriptionInit, from: string) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
            console.log('📥 Handling offer from:', from);
            remotePeerIdRef.current = from;
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketService.sendAnswer(answer, from);
        } catch (err) {
            console.error('Error handling offer:', err);
        }
    }, []);

    // Handle Answer
    const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
            console.log('📥 Handling answer');
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
            console.error('Error handling answer:', err);
        }
    }, []);

    // Handle ICE Candidate
    const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;

        try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
            console.error('Error adding ICE candidate:', err);
        }
    }, []);

    // Initialize WebRTC connection
    useEffect(() => {
        let stream: MediaStream | null = null;
        let isCleanedUp = false;

        const initializeWebRTC = async () => {
            try {
                // Connect to signaling server
                const socket = socketService.connect();

                // Get media stream
                stream = await initializeMedia();

                // Create peer connection
                const pc = createPeerConnection(stream);

                // Join the room
                socketService.joinRoom(roomId, role, userId);

                // Handle room ready (both peers present)
                socketService.onRoomReady(({ user, listener }) => {
                    console.log('🎊 Room ready! User:', user, 'Listener:', listener);

                    // User initiates the call (creates offer)
                    if (role === 'user') {
                        const remotePeerId = listener;
                        remotePeerIdRef.current = remotePeerId;
                        createOffer(pc, remotePeerId);
                    } else {
                        // Listener waits for offer
                        remotePeerIdRef.current = user;
                    }
                });

                // Handle incoming offer (listener receives this)
                socketService.onOffer(({ offer, from }) => {
                    console.log('📥 Received offer from:', from);
                    handleOffer(offer, from);
                });

                // Handle incoming answer (user receives this)
                socketService.onAnswer(({ answer, from }) => {
                    console.log('📥 Received answer from:', from);
                    handleAnswer(answer);
                });

                // Handle ICE candidates
                socketService.onIceCandidate(({ candidate, from }) => {
                    handleIceCandidate(candidate);
                });

                // Handle peer left
                socketService.onPeerLeft(({ role: peerRole }) => {
                    console.log(`👋 Peer left: ${peerRole}`);
                    setError(`${peerRole} has left the call`);
                    setIsConnected(false);
                });

            } catch (err) {
                console.error('❌ WebRTC initialization error:', err);
                setError((err as Error).message);
            }
        };

        // Cleanup handler for page unload
        const handleBeforeUnload = () => {
            if (!isCleanedUp) {
                console.log('⚠️ Page unloading - cleaning up WebRTC');
                cleanup();
                isCleanedUp = true;
            }
        };

        // Add beforeunload listener
        window.addEventListener('beforeunload', handleBeforeUnload);

        initializeWebRTC();

        // Cleanup on unmount
        return () => {
            if (!isCleanedUp) {
                cleanup();
                isCleanedUp = true;
            }
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, role, userId]); // Only re-run if these essential props change

    return {
        localStream,
        remoteStream,
        connectionState,
        isConnected,
        isMuted,
        error,
        toggleMute,
        cleanup,
    };
}
