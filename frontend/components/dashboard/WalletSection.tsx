'use client';

import { motion } from 'framer-motion';
import { FaWallet, FaCreditCard, FaMobileAlt } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
    getUserWalletBalance,
    setUserWalletBalance,
    getUserTransactions,
    addUserTransaction,
} from '@/lib/storage';

interface WalletSectionProps {
    walletBalance: number;
    onBalanceUpdate: (newBalance: number) => void;
}

export default function WalletSection({ walletBalance, onBalanceUpdate }: WalletSectionProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleQuickAdd = async (amount: number) => {
        setIsLoading(true);
        try {
            const currentWallet = getUserWalletBalance();
            const newBalance = currentWallet + amount;
            await setUserWalletBalance(newBalance);
            onBalanceUpdate(newBalance);

            await addUserTransaction({
                type: 'credit',
                amount: amount,
                timestamp: new Date().toISOString(),
                description: 'Wallet top-up',
            });

            toast.success(`₹${amount} added to wallet successfully!`, {
                icon: '💰',
                duration: 3000,
            });
        } catch (error) {
            toast.error('Failed to add money. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCustomAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const amount = parseFloat(formData.get('amount') as string);

            if (!amount || amount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

            const currentWallet = getUserWalletBalance();
            const newBalance = currentWallet + amount;
            await setUserWalletBalance(newBalance);
            onBalanceUpdate(newBalance);

            await addUserTransaction({
                type: 'credit',
                amount: amount,
                timestamp: new Date().toISOString(),
                description: 'Wallet top-up',
            });

            toast.success(`₹${amount} added to wallet successfully!`, {
                icon: '💰',
                duration: 3000,
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            toast.error('Failed to add money. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const transactions = getUserTransactions();
    const recentTransactions = transactions.slice(-5).reverse();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Money to Wallet</h2>
            <div className="glass rounded-2xl shadow-glass p-8 max-w-2xl">
                {/* Current Balance Display */}
                <motion.div
                    className="bg-gradient-to-r from-primary-blue/10 to-primary-green/10 rounded-xl p-6 mb-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Current Wallet Balance</div>
                        <motion.div
                            className={`text-4xl font-bold ${walletBalance < 10 ? 'text-red-600' : 'text-primary-blue'}`}
                            key={walletBalance}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            ₹{walletBalance.toFixed(2)}
                        </motion.div>
                    </div>
                </motion.div>

                {/* Quick Amount Buttons */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Quick Add</label>
                    <div className="grid grid-cols-4 gap-3">
                        {[100, 250, 500, 1000].map((amount, index) => (
                            <motion.button
                                key={amount}
                                onClick={() => handleQuickAdd(amount)}
                                disabled={isLoading}
                                className="px-4 py-3 bg-white/50 hover:bg-primary-blue hover:text-white rounded-xl font-semibold transition-all border-2 border-gray-200 hover:border-primary-blue disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                ₹{amount}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Custom Amount Form */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Or Enter Custom Amount</label>
                    <form onSubmit={handleCustomAdd} className="flex gap-3">
                        <input
                            type="number"
                            name="amount"
                            min="1"
                            step="1"
                            placeholder="Enter amount"
                            required
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:outline-none disabled:opacity-50 transition-all"
                        />
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? 'Adding...' : 'Add Money'}
                        </motion.button>
                    </form>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            className="px-4 py-3 bg-white/50 hover:bg-white/80 rounded-xl font-semibold border-2 border-gray-200 transition flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaCreditCard className="text-primary-blue" />
                            UPI
                        </motion.button>
                        <motion.button
                            className="px-4 py-3 bg-white/50 hover:bg-white/80 rounded-xl font-semibold border-2 border-gray-200 transition flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaMobileAlt className="text-primary-green" />
                            Net Banking
                        </motion.button>
                    </div>
                </div>

                {/* Transaction History */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Transactions</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentTransactions.length === 0 ? (
                            <motion.p
                                className="text-gray-500 text-center py-8"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                No transactions yet
                            </motion.p>
                        ) : (
                            recentTransactions.map((tx: any, index: number) => (
                                <motion.div
                                    key={index}
                                    className="flex justify-between items-center p-3 bg-white/50 rounded-lg hover:bg-white/80 transition"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ x: 5 }}
                                >
                                    <div>
                                        <div className="font-semibold text-gray-800">{tx.description}</div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(tx.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
