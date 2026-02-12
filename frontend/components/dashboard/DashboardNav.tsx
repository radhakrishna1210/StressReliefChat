'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FaWallet, FaUserCircle } from 'react-icons/fa';
import { User } from '@/lib/storage';

interface DashboardNavProps {
    user: User | null;
    isLoggedIn: boolean;
    walletBalance: number;
    showProfileMenu: boolean;
    onWalletClick: () => void;
    onProfileClick: () => void;
    onDashboardClick: () => void;
    onLogout: () => void;
    onLoginClick: () => void;
}

export default function DashboardNav({
    user,
    isLoggedIn,
    walletBalance,
    showProfileMenu,
    onWalletClick,
    onProfileClick,
    onDashboardClick,
    onLogout,
    onLoginClick,
}: DashboardNavProps) {
    return (
        <nav className="glass sticky top-0 z-50 border-b border-white/20">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Wallet Balance - Left - Only show when logged in */}
                    {isLoggedIn && (
                        <motion.button
                            onClick={onWalletClick}
                            className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                animate={{
                                    rotate: walletBalance < 10 ? [0, -10, 10, -10, 0] : 0,
                                }}
                                transition={{ duration: 0.5 }}
                            >
                                <FaWallet className="text-primary-blue text-2xl" />
                            </motion.div>
                            <div>
                                <div className="text-xs text-gray-600">Wallet Balance</div>
                                <motion.div
                                    className={`text-xl font-bold ${walletBalance < 10 ? 'text-red-600' : 'text-primary-blue'}`}
                                    key={walletBalance}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                >
                                    ₹{walletBalance.toFixed(2)}
                                </motion.div>
                            </div>
                        </motion.button>
                    )}
                    {!isLoggedIn && <div></div>}

                    {/* Profile Icon - Right */}
                    <div className="relative profile-menu-container">
                        <motion.button
                            onClick={onProfileClick}
                            className="flex items-center gap-2 p-2 rounded-full hover:bg-white/20 transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaUserCircle className="text-3xl text-gray-600" />
                            {user && (
                                <span className="text-sm font-semibold text-gray-700 hidden md:block">
                                    {user.name}
                                </span>
                            )}
                        </motion.button>

                        {/* Profile Dropdown Menu */}
                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-glass border-2 border-white/30 py-2 z-50 profile-menu-container"
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {user ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-white/20">
                                                <div className="font-semibold text-gray-800">{user.name}</div>
                                                <div className="text-xs text-gray-600">{user.email}</div>
                                            </div>
                                            <motion.button
                                                onClick={onDashboardClick}
                                                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-white/20 transition"
                                                whileHover={{ x: 5 }}
                                            >
                                                {user.role === 'admin' ? 'Admin Dashboard' : user.role === 'listener' ? 'Listener Dashboard' : 'Dashboard'}
                                            </motion.button>
                                            <motion.button
                                                onClick={onLogout}
                                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50/50 transition"
                                                whileHover={{ x: 5 }}
                                            >
                                                Logout
                                            </motion.button>
                                        </>
                                    ) : (
                                        <motion.button
                                            onClick={onLoginClick}
                                            className="w-full text-left px-4 py-2 text-gray-700 hover:bg-white/20 transition"
                                            whileHover={{ x: 5 }}
                                        >
                                            Login / Sign Up
                                        </motion.button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </nav>
    );
}
