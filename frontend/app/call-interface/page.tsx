'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaPhone, FaStar, FaClock, FaWallet, FaMicrophone, FaMicrophoneSlash, FaHeart, FaSearch, FaSpinner } from 'react-icons/fa';
import {
  getCurrentUser,
  getUserWalletBalance,
  setUserWalletBalance,
  getUserFavorites,
  setUserFavorites,
  addUserTransaction,
  getUserPreviousCalls,
  addUserPreviousCall,
} from '@/lib/storage';
import { useWebRTC } from '@/lib/hooks/useWebRTC';
import { useMatchmaking } from '@/lib/hooks/useMatchmaking';

// Extended listener type for UI
interface ListenerProfile {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  description: string;
  rating: number;
  totalCalls: number;
  pricePerMin: number;
  specialties: string[];
  experience: string;
}

function CallInterfacePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);
  const [activeCallListener, setActiveCallListener] = useState<string | null>(null);
  const [currentListener, setCurrentListener] = useState<ListenerProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);
  const [lastChargeTime, setLastChargeTime] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [myRole, setMyRole] = useState<'user' | 'listener'>('user');

  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  // Get current user for matchmaking
  const currentUser = getCurrentUser();
  const userId = currentUser?.email || 'anonymous';
  const userName = currentUser?.name || 'Anonymous User';
  const userRole = (currentUser?.role === 'listener' ? 'listener' : 'user') as 'user' | 'listener';

  // Matchmaking hook
  const {
    requestMatch,
    matchData,
    isWaiting,
    error: matchmakingError,
    cancelMatch
  } = useMatchmaking(userId, userName, userRole);

  // Check if user is logged in
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/call-interface');
      router.push('/dashboard');
      return;
    }
    setIsLoggedIn(true);
    const balance = getUserWalletBalance();
    setWalletBalance(balance);
  }, [router]);

  // Handle incoming match or URL parameters (for listeners redirecting or auto-start)
  useEffect(() => {
    // 1. Check if we were redirected here with a match (e.g. from listener room)
    const urlRoom = searchParams.get('room');
    const urlRole = searchParams.get('role');
    const urlPeer = searchParams.get('peer');
    const autoStart = searchParams.get('autoStart');

    // Listener joining an existing match
    if (urlRoom && urlRole && urlPeer && !isCallActive) {
      setRoomId(urlRoom);
      const peerProfile: ListenerProfile = {
        id: 'peer',
        name: urlPeer,
        avatar: '👤',
        tagline: 'Connected User',
        description: 'Ongoing voice call',
        rating: 5.0,
        totalCalls: 1,
        pricePerMin: 0,
        specialties: ['General'],
        experience: 'User'
      };
      setCurrentListener(peerProfile);
      setActiveCallListener('peer');
      setIsCallActive(true);
      setCallDuration(0);
      setLastChargeTime(Date.now());
    }
    // 2. Check if we got a match via the hook (as a user)
    else if (matchData && !isCallActive) {
      setRoomId(matchData.roomId);
      setMyRole(matchData.role);

      const peerProfile: ListenerProfile = {
        id: matchData.peer.socketId,
        name: matchData.peer.name,
        avatar: '🎧',
        tagline: 'Live Listener',
        description: 'Matched via real-time matchmaking',
        rating: 5.0,
        totalCalls: 1,
        pricePerMin: 5.0, // Default rate for testing
        specialties: ['Listening'],
        experience: 'Verified Listener'
      };

      setCurrentListener(peerProfile);
      setActiveCallListener(matchData.peer.socketId);
      setIsCallActive(true);
      setCallDuration(0);
      setLastChargeTime(Date.now());
    }
    // 3. Check for auto-start parameter (Instant Match)
    else if (autoStart === 'true' && !isCallActive && !isWaiting && !matchData && isLoggedIn) {
      requestMatch();
      // Remove query param to prevent re-triggering
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('autoStart');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [matchData, searchParams, isCallActive, isWaiting, isLoggedIn, requestMatch]);

  // WebRTC hook
  const {
    remoteStream,
    connectionState,
    isConnected,
    isMuted,
    error: webrtcError,
    toggleMute,
    cleanup: webrtcCleanup,
  } = useWebRTC(roomId || 'default', myRole, userId);

  // Play remote audio stream
  useEffect(() => {
    if (remoteStream && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch(err => {
        console.error('Error playing remote audio:', err);
      });
    }
  }, [remoteStream]);

  // Call duration timer and wallet deduction
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCallActive && currentListener) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);

        const pricePerMin = currentListener.pricePerMin;
        const chargePerSecond = pricePerMin / 60;
        const currentBalance = getUserWalletBalance();

        if (currentBalance >= chargePerSecond) {
          const newBalance = currentBalance - chargePerSecond;
          setUserWalletBalance(newBalance).catch(console.error);
          setWalletBalance(newBalance);
          setTotalCharged(prev => prev + chargePerSecond);

          const currentTime = Date.now();
          if (currentTime - lastChargeTime >= 60000) {
            addUserTransaction({
              type: 'debit',
              amount: pricePerMin,
              timestamp: new Date().toISOString(),
              description: `Call charge for ${currentListener.name}`,
            }).catch(console.error);
            setLastChargeTime(currentTime);
          }
        } else {
          // Warning at low balance, end at 0
          if (currentBalance <= 0) {
            alert('Wallet balance insufficient! Call ending...');
            handleEndCall();
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, currentListener, lastChargeTime]);

  const handleStartSearch = () => {
    requestMatch();
  };

  const handleEndCall = async () => {
    if (activeCallListener && currentListener) {
      await addUserPreviousCall(activeCallListener);

      if (totalCharged > 0) {
        await addUserTransaction({
          type: 'debit',
          amount: parseFloat(totalCharged.toFixed(2)),
          timestamp: new Date().toISOString(),
          description: `Final call charge for ${currentListener.name}`,
        });
      }
    }

    // Cleanup WebRTC and Matchmaking
    webrtcCleanup();
    cancelMatch(); // Ensure we leave matchmaking queue/room

    setIsCallActive(false);
    setActiveCallListener(null);
    setCallDuration(0);
    setTotalCharged(0);
    setCurrentListener(null);
    setRoomId('');
    router.push('/dashboard');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number) => {
    return price ? `₹${price.toFixed(2)}` : 'Free';
  };

  const handleAddToFavorites = async () => {
    if (currentListener) {
      const favorites = getUserFavorites();
      if (!favorites.some((fav: any) => fav.id === currentListener.id)) {
        const updatedFavorites = [...favorites, {
          ...currentListener,
          addedAt: new Date().toISOString(),
        }];
        await setUserFavorites(updatedFavorites);
        setIsFavorite(true);
        alert(`${currentListener.name} added to favorites!`);
      } else {
        alert(`${currentListener.name} is already in favorites!`);
      }
    }
  };

  // Connection status text
  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connecting':
      case 'new': return '🔄 Connecting...';
      case 'connected': return '✅ Connected';
      case 'disconnected':
      case 'failed': return '❌ Disconnected';
      case 'closed': return '📞 Call Ended';
      default: return '🔄 Connecting...';
    }
  };

  // Allow canceling the search
  const handleCancelSearch = () => {
    cancelMatch();
    // Remove autoStart query param if present
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('autoStart');
    window.history.replaceState({}, '', newUrl.toString());
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaWallet className="text-primary-blue text-xl" />
            <div>
              <div className="text-xs text-gray-600">Wallet Balance</div>
              <div className={`text-lg font-bold ${walletBalance < 10 ? 'text-red-600' : 'text-primary-blue'}`}>
                ₹{walletBalance.toFixed(2)}
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isCallActive ? 'Active Call' : 'Find a Listener'}
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800 font-semibold"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* State 1: Search / Waiting UI */}
        {!isCallActive && (
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center transition-all">
            <div className="mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                {isWaiting ? (
                  <FaSpinner className="text-4xl text-blue-600 animate-spin" />
                ) : (
                  <FaSearch className="text-4xl text-blue-600" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {isWaiting ? 'Finding a Listener...' : 'Talk to Someone Now'}
              </h2>
              <p className="text-gray-600 text-lg max-w-lg mx-auto">
                {isWaiting
                  ? 'We are looking for an available listener to match with you. This usually takes less than a minute.'
                  : 'Connect with a supportive listener instantly. Our matchmaking system will pair you with someone ready to help.'}
              </p>
            </div>

            {matchmakingError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 max-w-md mx-auto">
                ⚠️ {matchmakingError}
              </div>
            )}

            {!isWaiting ? (
              <button
                onClick={handleStartSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-3 mx-auto"
              >
                <FaPhone className="rotate-90" />
                Find Random Listener
              </button>
            ) : (
              <button
                onClick={handleCancelSearch}
                className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-lg transition-all mx-auto"
              >
                Cancel Search
              </button>
            )}
          </div>
        )}

        {/* State 2: Active Call UI */}
        {isCallActive && currentListener && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center animate-fade-in">
            {/* Connection Status */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                <span className={`font-semibold text-lg ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                  {getConnectionStatus()}
                </span>
              </div>
              {webrtcError && (
                <div className="text-red-600 text-sm mt-2">⚠️ {webrtcError}</div>
              )}
            </div>

            <div className="text-8xl mb-6">{currentListener.avatar}</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">{currentListener.name}</h2>
            <p className="text-primary-green font-semibold text-xl mb-4">{currentListener.tagline}</p>

            <div className="flex items-center justify-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <FaStar className="text-yellow-500" />
                <span className="font-semibold">{currentListener.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-primary-blue" />
                <span>{currentListener.totalCalls} calls</span>
              </div>
            </div>

            {/* Call Duration and Charges */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-r from-primary-blue/10 to-primary-green/10 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-primary-blue mb-2">
                  {formatDuration(callDuration)}
                </div>
                <div className="text-gray-600 text-sm">Call Duration</div>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  ₹{totalCharged.toFixed(2)}
                </div>
                <div className="text-gray-600 text-sm">Charged</div>
              </div>
            </div>

            {/* Low Balance Warning */}
            {walletBalance < 10 && walletBalance > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6 text-center">
                <p className="text-yellow-800 font-semibold">
                  ⚠️ Low wallet balance! Add funds to continue the call.
                </p>
              </div>
            )}

            {/* Listener Info */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
              <p className="text-gray-700 mb-4 leading-relaxed">{currentListener.description}</p>
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2 font-semibold">Specialties:</div>
                <div className="flex flex-wrap gap-2">
                  {currentListener.specialties.map((spec) => (
                    <span
                      key={spec}
                      className="px-3 py-1 bg-blue-50 text-primary-blue rounded-lg text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-gray-500">{currentListener.experience}</div>
            </div>

            {/* Call Control Buttons */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={toggleMute}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isMuted
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {isMuted ? (
                  <>
                    <FaMicrophoneSlash />
                    Unmute
                  </>
                ) : (
                  <>
                    <FaMicrophone />
                    Mute
                  </>
                )}
              </button>
              <button
                onClick={handleAddToFavorites}
                disabled={isFavorite}
                className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${isFavorite
                  ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
              >
                <FaHeart className={isFavorite ? 'text-yellow-600' : 'text-blue-600'} />
                {isFavorite ? 'In Favorites' : 'Add to Favorites'}
              </button>
              <button
                onClick={handleEndCall}
                className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <FaPhone className="rotate-135" />
                End Call
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call Status Footer */}
      {isCallActive && currentListener && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg animate-slide-up">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{currentListener.avatar}</div>
              <div className="hidden sm:block">
                <div className="font-bold text-gray-800 text-lg">{currentListener.name}</div>
                <div className="text-sm text-gray-600">
                  Duration: {formatDuration(callDuration)} •
                  {formatPrice(currentListener.pricePerMin)}/min
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-600">Connection</div>
                <div className={`text-sm font-bold ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isConnected ? 'Connected' : 'Connecting...'}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-600">Wallet</div>
                <div className={`text-lg font-bold ${walletBalance < 10 ? 'text-red-600' : 'text-primary-blue'}`}>
                  ₹{walletBalance.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className={`p-3 rounded-xl transition-all ${isMuted
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button
                  onClick={handleEndCall}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition flex items-center gap-2"
                >
                  <FaPhone className="rotate-135" />
                  <span className="hidden sm:inline">End Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CallInterfacePage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center">Loading...</main>}>
      <CallInterfacePageInner />
    </Suspense>
  );
}
