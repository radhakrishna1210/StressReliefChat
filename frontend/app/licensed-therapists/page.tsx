'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';

import DashboardNav from '@/components/dashboard/DashboardNav';
import PaymentSection from '@/components/PaymentSection';
import LoginModal from '@/components/auth/LoginModal';
import { Therapist } from '@/lib/data'; // Keep interface, likely matches
import { adminApi } from '@/lib/api/admin';
import {
    getCurrentUser,
    clearCurrentUser,
    getUserWalletBalance,
    setUserWalletBalance,
    addUserPreviousCall,
    type User,
} from '@/lib/storage';

export default function LicensedTherapistsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Therapists State
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [loading, setLoading] = useState(true);

    // Payment state
    const [selectedTherapist, setSelectedTherapist] = useState<{
        type: 'therapist';
        name: string;
        pricePerMin: number;
        id?: string;
    } | null>(null);
    const [showPayment, setShowPayment] = useState(false);

    // Initialize user data and fetch therapists
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadData = async () => {
            try {
                // User Data
                const currentUser = getCurrentUser();
                if (currentUser) {
                    setUser(currentUser);
                    setIsLoggedIn(true);
                    const balance = getUserWalletBalance();
                    setWalletBalance(balance);
                } else {
                    setIsLoggedIn(false);
                    setWalletBalance(0);
                }

                // Fetch Therapists
                setLoading(true);
                const res = await adminApi.getTherapists();
                if (res.success) {
                    setTherapists(res.data);
                } else {
                    // toast.error('Failed to load therapists'); // Optional: don't spam error on public page
                    console.error('Failed to load therapists', res.error);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
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

    const handleLogout = useCallback(() => {
        clearCurrentUser();
        setUser(null);
        setIsLoggedIn(false);
        setWalletBalance(0);
        setShowLogin(true);
        setShowProfileMenu(false);
        toast.success('Logged out successfully');
        router.push('/dashboard');
    }, [router]);

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

    const handleBookTherapist = (therapist: Therapist) => {
        if (!isLoggedIn) {
            toast.error('Please login to book a therapist');
            setShowLogin(true);
            return;
        }

        setSelectedTherapist({
            type: 'therapist',
            name: therapist.name,
            pricePerMin: therapist.pricePerMin,
            id: therapist.id,
        });
        setShowPayment(true);
    };

    const handlePaymentComplete = useCallback((paymentAmount: number) => {
        const currentWallet = getUserWalletBalance();
        const newWalletBalance = currentWallet + paymentAmount;
        setUserWalletBalance(newWalletBalance);
        setWalletBalance(newWalletBalance);

        toast.success(`Payment successful! ₹${paymentAmount} added to wallet.`, { icon: '💰' });

        if (selectedTherapist?.id) {
            addUserPreviousCall(selectedTherapist.id);
        }
        setShowPayment(false);
        setSelectedTherapist(null);
    }, [selectedTherapist]);

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

    if (showPayment && selectedTherapist) {
        return (
            <main className="min-h-screen">
                <DashboardNav
                    user={user}
                    isLoggedIn={isLoggedIn}
                    walletBalance={walletBalance}
                    showProfileMenu={showProfileMenu}
                    onWalletClick={() => router.push('/dashboard')}
                    onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                    onDashboardClick={() => router.push('/dashboard')}
                    onLogout={handleLogout}
                    onLoginClick={() => setShowLogin(true)}
                />
                <div className="py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        <motion.button
                            onClick={() => setShowPayment(false)}
                            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
                            whileHover={{ x: -5 }}
                        >
                            <FaArrowLeft /> Cancel Payment
                        </motion.button>
                        <PaymentSection
                            selectedOption={selectedTherapist}
                            onPaymentComplete={handlePaymentComplete}
                        />
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen">
            <DashboardNav
                user={user}
                isLoggedIn={isLoggedIn}
                walletBalance={walletBalance}
                showProfileMenu={showProfileMenu}
                onWalletClick={() => router.push('/dashboard')}
                onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                onDashboardClick={() => router.push('/dashboard')}
                onLogout={handleLogout}
                onLoginClick={() => setShowLogin(true)}
            />
            <div className="py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.button
                        onClick={() => router.push('/dashboard')}
                        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        whileHover={{ x: -5 }}
                    >
                        <FaArrowLeft /> Back to Dashboard
                    </motion.button>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                        Licensed Therapists
                    </h2>
                    <p className="text-gray-600 text-center mb-8">
                        Professional psychologists for clinical care
                    </p>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {therapists.map((therapist, index) => (
                                <motion.div
                                    key={therapist.id}
                                    className="glass rounded-2xl shadow-glass hover:shadow-glass-hover p-6 transition-all border-2 border-white/30 hover:border-white/50 flex flex-col h-full"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <div className="text-center mb-4">
                                        <div className="text-6xl mb-2">{therapist.avatar}</div>
                                        <h3 className="text-xl font-bold text-gray-800">{therapist.name}</h3>
                                        <p className="text-primary-blue font-semibold text-sm">{therapist.title}</p>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-4 flex-grow">{therapist.description}</p>
                                    <div className="mb-4">
                                        <div className="text-xs text-gray-600 mb-1">
                                            <span className="font-semibold">Credentials:</span> {therapist.credentials}
                                        </div>
                                        <div className="text-xs text-gray-600 mb-2">
                                            <span className="font-semibold">Experience:</span> {therapist.experience}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {therapist.specialties && therapist.specialties.map((spec) => (
                                                <span
                                                    key={spec}
                                                    className="px-2 py-1 bg-green-50 text-primary-green rounded-lg text-xs"
                                                >
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                                            <div className="text-2xl font-bold text-primary-blue">
                                                ₹{therapist.pricePerMin}/min
                                            </div>
                                            <div className="text-sm text-gray-600">⭐ {therapist.rating?.toFixed(1) || 'N/A'}</div>
                                        </div>
                                        <motion.button
                                            onClick={() => handleBookTherapist(therapist)}
                                            className="w-full py-3 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Book Appointment
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {!loading && therapists.length === 0 && (
                        <div className="text-center py-12 text-gray-500 glass rounded-2xl">
                            <p className="text-xl">No therapists available at the moment.</p>
                            <p>Please check back later.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
