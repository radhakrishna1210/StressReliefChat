'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import CallOptionCard from '@/components/CallOptionCard';
import PaymentSection from '@/components/PaymentSection';
import WalletSection from '@/components/dashboard/WalletSection';
import CallHistorySection from '@/components/dashboard/CallHistorySection';
import FavoritesSection from '@/components/dashboard/FavoritesSection';
import LoginModal from '@/components/auth/LoginModal';

import DashboardNav from '@/components/dashboard/DashboardNav';
import { FaArrowLeft, FaHistory, FaHeart, FaWallet } from 'react-icons/fa';
import {
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    getUserWalletBalance,
    setUserWalletBalance,
    getUserFavorites,
    getUserPreviousCalls,
    addUserPreviousCall,
    type User,
} from '@/lib/storage';

function DashboardPageContent() {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState<{
        type: 'ai' | 'human' | 'therapist';
        name: string;
        pricePerMin: number;
        id?: string;
    } | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [user, setUser] = useState<User | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [activeTab, setActiveTab] = useState<'options' | 'history' | 'favorites' | 'wallet'>('options');

    // Handle Google OAuth callback
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const urlParams = new URLSearchParams(window.location.search);
        const googleAuthSuccess = urlParams.get('google_auth_success');
        const userDataParam = urlParams.get('user');
        const error = urlParams.get('error');

        if (error) {
            toast.error(`Authentication error: ${error}`);
            window.history.replaceState({}, '', window.location.pathname);
            return;
        }

        if (googleAuthSuccess === 'true' && userDataParam) {
            try {
                const userData: User = JSON.parse(decodeURIComponent(userDataParam));
                setCurrentUser(userData).then(() => {
                    setUser(userData);
                    setIsLoggedIn(true);
                    setShowLogin(false);
                    const balance = getUserWalletBalance();
                    setWalletBalance(balance);
                    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.history.replaceState({}, '', redirectUrl || window.location.pathname);
                    if (redirectUrl) {
                        router.push(redirectUrl);
                    }
                    toast.success(`Welcome back, ${userData.name}!`, { icon: '👋' });
                });
            } catch (error) {
                toast.error('Failed to process authentication');
                window.history.replaceState({}, '', window.location.pathname);
            }
        }
    }, [router]);

    // Load wallet balance and user data
    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        try {
            const currentUser = getCurrentUser();
            if (currentUser) {
                setUser(currentUser);
                setIsLoggedIn(true);
                setShowLogin(false);
                const balance = getUserWalletBalance();
                setWalletBalance(balance);
            } else {
                setIsLoggedIn(false);
                setWalletBalance(0);
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    setShowLogin(true);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            // Set defaults on error
            setIsLoggedIn(false);
            setWalletBalance(0);
        }
    }, []);

    // Close profile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showProfileMenu && !target.closest('.profile-menu-container')) {
                setShowProfileMenu(false);
            }
        };

        if (showProfileMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProfileMenu]);

    const handleAISelect = useCallback(() => {
        setSelectedOption({
            type: 'ai',
            name: 'AI-First Companion',
            pricePerMin: 1,
        });
        setShowPayment(true);
    }, []);

    const handleHumanSelect = useCallback(() => {
        if (!isLoggedIn) {
            toast.error('Please login to connect with peers');
            setShowLogin(true);
            sessionStorage.setItem('redirectAfterLogin', '/call-interface?autoStart=true');
            return;
        }
        router.push('/call-interface?autoStart=true');
    }, [isLoggedIn, router]);

    const handleLoginSuccess = useCallback((userData: User) => {
        setUser(userData);
        setIsLoggedIn(true);
        setShowLogin(false);
        const balance = getUserWalletBalance();
        setWalletBalance(balance);
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        if (redirectUrl) {
            router.push(redirectUrl);
        }
    }, [router]);

    const handleLogout = useCallback(() => {
        clearCurrentUser();
        setUser(null);
        setIsLoggedIn(false);
        setWalletBalance(0);
        setShowLogin(true);
        setActiveTab('options');
        setShowProfileMenu(false);
        toast.success('Logged out successfully');
    }, []);

    const handleTherapistSelect = useCallback(() => {
        router.push('/licensed-therapists');
    }, [router]);

    const handlePaymentComplete = useCallback((paymentAmount: number) => {
        const currentWallet = getUserWalletBalance();
        const newWalletBalance = currentWallet + paymentAmount;
        setUserWalletBalance(newWalletBalance);
        setWalletBalance(newWalletBalance);

        if (selectedOption?.type === 'human') {
            router.push('/call-interface');
        } else {
            toast.success(`Payment successful! ₹${paymentAmount} added to wallet.`, { icon: '💰' });
            if (selectedOption?.id) {
                addUserPreviousCall(selectedOption.id);
            }
            setShowPayment(false);
            setSelectedOption(null);
        }
    }, [selectedOption, router]);

    // Mock call history - Replace with real data from backend
    const callHistory = useMemo(() => [
        {
            id: '1',
            type: 'human' as const,
            name: 'Priya Sharma',
            date: '2024-01-15',
            duration: 25,
            cost: 50,
            rating: 5,
        },
        {
            id: '2',
            type: 'ai' as const,
            name: 'AI Companion',
            date: '2024-01-14',
            duration: 15,
            cost: 13,
            rating: 4,
        },
        {
            id: '3',
            type: 'therapist' as const,
            name: 'Dr. Singh',
            date: '2024-01-10',
            duration: 60,
            cost: 300,
            rating: 5,
        },
    ], []);

    const favorites = useMemo(() => {
        if (!isLoggedIn || typeof window === 'undefined') return [];
        try {
            return getUserFavorites();
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }, [isLoggedIn, activeTab]);

    if (showPayment && selectedOption) {
        return (
            <main className="min-h-screen">
                <DashboardNav
                    user={user}
                    isLoggedIn={isLoggedIn}
                    walletBalance={walletBalance}
                    showProfileMenu={showProfileMenu}
                    onWalletClick={() => setActiveTab('wallet')}
                    onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                    onDashboardClick={() => {
                        if (user?.role === 'admin') {
                            router.push('/admin');
                        } else if (user?.role === 'listener') {
                            router.push('/listener');
                        } else {
                            setActiveTab('history');
                        }
                        setShowProfileMenu(false);
                    }}
                    onLogout={handleLogout}
                    onLoginClick={() => {
                        setShowLogin(true);
                        setShowProfileMenu(false);
                    }}
                />
                <div className="py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.button
                            onClick={() => setShowPayment(false)}
                            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
                            whileHover={{ x: -5 }}
                        >
                            <FaArrowLeft /> Back to options
                        </motion.button>
                        <PaymentSection
                            selectedOption={selectedOption}
                            onPaymentComplete={handlePaymentComplete}
                        />
                    </div>
                </div>
            </main>
        );
    }

    if (showLogin && !isLoggedIn) {
        return (
            <main className="min-h-screen">
                <LoginModal
                    isOpen={showLogin}
                    onClose={() => setShowLogin(false)}
                    onSuccess={handleLoginSuccess}
                />
            </main>
        );
    }

    if (isLoggedIn && activeTab !== 'options' && !selectedOption) {
        return (
            <main className="min-h-screen">
                <DashboardNav
                    user={user}
                    isLoggedIn={isLoggedIn}
                    walletBalance={walletBalance}
                    showProfileMenu={showProfileMenu}
                    onWalletClick={() => setActiveTab('wallet')}
                    onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                    onDashboardClick={() => {
                        if (user?.role === 'admin') {
                            router.push('/admin');
                        } else if (user?.role === 'listener') {
                            router.push('/listener');
                        } else {
                            setActiveTab('history');
                        }
                        setShowProfileMenu(false);
                    }}
                    onLogout={handleLogout}
                    onLoginClick={() => {
                        setShowLogin(true);
                        setShowProfileMenu(false);
                    }}
                />
                <div className="py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            className="flex justify-between items-center mb-8"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
                                <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
                            </div>
                        </motion.div>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8 border-b-2 border-gray-200 overflow-x-auto">
                            {[
                                { id: 'options', label: 'Call Options', icon: null },
                                { id: 'history', label: 'Call History', icon: FaHistory },
                                { id: 'favorites', label: 'Favorites', icon: FaHeart },
                                { id: 'wallet', label: 'Wallet', icon: FaWallet },
                            ].map((tab) => (
                                <motion.button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                        ? 'border-primary-blue text-primary-blue'
                                        : 'border-transparent text-gray-600 hover:text-gray-800'
                                        }`}
                                    whileHover={{ y: -2 }}
                                >
                                    {tab.icon && <tab.icon className="inline mr-2" />}
                                    {tab.label}
                                </motion.button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'history' && (
                                <motion.div
                                    key="history"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="glass rounded-2xl shadow-glass p-6 md:p-8">
                                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Start a New Call</h2>
                                        <p className="text-gray-600 mb-6">Choose your preferred support option</p>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { handler: handleAISelect, icon: '🤖', label: 'AI Companion', price: 'Free 2-min trial' },
                                                { handler: handleHumanSelect, icon: '👤', label: 'Random Peer', price: '₹2/min' },
                                                { handler: handleTherapistSelect, icon: '👨‍⚕️', label: 'Therapist', price: '₹5/min' },
                                            ].map((option, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    onClick={option.handler}
                                                    className="bg-gradient-to-br from-primary-blue/10 to-primary-green/10 hover:from-primary-blue/20 hover:to-primary-green/20 backdrop-blur-sm text-gray-800 rounded-xl p-4 text-center transition-all border-2 border-primary-blue/30 hover:border-primary-blue/50"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <div className="text-3xl mb-2">{option.icon}</div>
                                                    <div className="font-semibold">{option.label}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{option.price}</div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <CallHistorySection calls={callHistory} />
                                </motion.div>
                            )}

                            {activeTab === 'favorites' && (
                                <motion.div
                                    key="favorites"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <FavoritesSection favorites={favorites} />
                                </motion.div>
                            )}

                            {activeTab === 'wallet' && (
                                <motion.div
                                    key="wallet"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <WalletSection
                                        walletBalance={walletBalance}
                                        onBalanceUpdate={setWalletBalance}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        );
    }


    // Removed: if (selectedOption?.type === 'therapist' && !showPayment) { ... }
    // render block


    return (
        <main className="min-h-screen">
            <DashboardNav
                user={user}
                isLoggedIn={isLoggedIn}
                walletBalance={walletBalance}
                showProfileMenu={showProfileMenu}
                onWalletClick={() => setActiveTab('wallet')}
                onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                onDashboardClick={() => {
                    if (user?.role === 'admin') {
                        router.push('/admin');
                    } else if (user?.role === 'listener') {
                        router.push('/listener');
                    } else {
                        setActiveTab('history');
                    }
                    setShowProfileMenu(false);
                }}
                onLogout={handleLogout}
                onLoginClick={() => {
                    setShowLogin(true);
                    setShowProfileMenu(false);
                }}
            />
            <div className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.h1
                        className="text-4xl font-bold text-gray-800 mb-4 text-center"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Choose Your Support
                    </motion.h1>
                    <motion.p
                        className="text-gray-600 text-center mb-12"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        Select the type of support that feels right for you
                    </motion.p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <CallOptionCard
                            type="ai"
                            description="24/7 advanced AI voice bot simulates human talk"
                            price="Free 2-min trial"
                            features={['Always available', 'No judgment', 'Instant connection']}
                            onSelect={handleAISelect}
                        />
                        <CallOptionCard
                            type="human"
                            description="Connect randomly with empathetic peers"
                            price="₹2/min"
                            features={[
                                'Instant random pairing',
                                'Anonymous & secure',
                                'Reconnect if call drops',
                            ]}
                            onSelect={handleHumanSelect}
                        />
                        <CallOptionCard
                            type="therapist"
                            description="Pro psychologists for clinical care"
                            price="₹5/min"
                            features={['Licensed professionals', 'Clinical expertise', 'Structured therapy']}
                            onSelect={handleTherapistSelect}
                        />
                    </div>

                    {isLoggedIn && (
                        <motion.div
                            className="mt-12"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex gap-4 mb-8 border-b-2 border-gray-200 overflow-x-auto">
                                {[
                                    { id: 'history', label: 'Call History', icon: FaHistory },
                                    { id: 'favorites', label: 'Favorites', icon: FaHeart },
                                    { id: 'wallet', label: 'Wallet', icon: FaWallet },
                                ].map((tab) => (
                                    <motion.button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`px-6 py-3 font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary-blue text-primary-blue'
                                            : 'border-transparent text-gray-600 hover:text-gray-800'
                                            }`}
                                        whileHover={{ y: -2 }}
                                    >
                                        <tab.icon className="inline mr-2" />
                                        {tab.label}
                                    </motion.button>
                                ))}
                            </div>

                            <AnimatePresence mode="wait">
                                {activeTab === 'history' && (
                                    <motion.div
                                        key="history"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <CallHistorySection calls={callHistory} />
                                    </motion.div>
                                )}

                                {activeTab === 'favorites' && (
                                    <motion.div
                                        key="favorites"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <FavoritesSection favorites={favorites} />
                                    </motion.div>
                                )}

                                {activeTab === 'wallet' && (
                                    <motion.div
                                        key="wallet"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <WalletSection
                                            walletBalance={walletBalance}
                                            onBalanceUpdate={setWalletBalance}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {!isLoggedIn && (
                        <motion.div
                            className="mt-12 glass rounded-2xl shadow-glass p-6 md:p-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Features</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50/50 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Login to Track History</h3>
                                    <p className="text-sm text-gray-600">
                                        Save your call history, recordings (opt-in), and favorite listeners
                                    </p>
                                </div>
                                <div className="p-4 bg-green-50/50 rounded-xl">
                                    <h3 className="font-semibold text-gray-800 mb-2">Wallet Management</h3>
                                    <p className="text-sm text-gray-600">
                                        Add money to your wallet and manage your balance easily
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}

// Wrap in error boundary
export default function DashboardPage() {
    try {
        return <DashboardPageContent />;
    } catch (error) {
        console.error('Dashboard error:', error);
        return (
            <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Dashboard</h1>
                    <p className="text-gray-600 mb-4">Please refresh the page</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        Refresh Page
                    </button>
                </div>
            </main>
        );
    }
}
