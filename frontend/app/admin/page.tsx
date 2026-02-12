'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { adminApi } from '@/lib/api/admin';
import { getCurrentUser, clearCurrentUser, type User } from '@/lib/storage';
import DashboardNav from '@/components/dashboard/DashboardNav';

interface Listener {
    id: string;
    name: string;
    email: string;
    isAvailable: boolean;
    totalCalls: number;
    rating: number;
    specialties: string[];
    bio: string;
    createdAt: string;
}



export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [listeners, setListeners] = useState<Listener[]>([]);

    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingListener, setEditingListener] = useState<Listener | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialties: '',
        bio: '',
    });

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            toast.error('Please login to access admin dashboard');
            router.push('/dashboard');
            return;
        }

        if (currentUser.role !== 'admin') {
            toast.error('Access denied. Admin privileges required.');
            router.push('/dashboard');
            return;
        }

        setUser(currentUser);
        loadData();
    }, [router]);

    const loadData = async () => {
        setLoading(true);
        try {
            const listenersRes = await adminApi.getListeners();

            if (listenersRes.success) {
                setListeners(listenersRes.data.listeners);
            } else {
                toast.error('Failed to load listeners');
            }
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleAddListener = async (e: React.FormEvent) => {
        e.preventDefault();

        const specialtiesArray = formData.specialties
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const result = await adminApi.addListener({
            name: formData.name,
            email: formData.email,
            specialties: specialtiesArray,
            bio: formData.bio,
        });

        if (result.success) {
            toast.success('Listener added successfully');
            setShowAddModal(false);
            setFormData({ name: '', email: '', specialties: '', bio: '' });
            loadData();
        } else {
            toast.error(result.error || 'Failed to add listener');
        }
    };

    const handleUpdateListener = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingListener) return;

        const specialtiesArray = formData.specialties
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const result = await adminApi.updateListener(editingListener.id, {
            name: formData.name,
            email: formData.email,
            specialties: specialtiesArray,
            bio: formData.bio,
        });

        if (result.success) {
            toast.success('Listener updated successfully');
            setEditingListener(null);
            setFormData({ name: '', email: '', specialties: '', bio: '' });
            loadData();
        } else {
            toast.error(result.error || 'Failed to update listener');
        }
    };

    const handleDeleteListener = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listener?')) return;

        const result = await adminApi.deleteListener(id);

        if (result.success) {
            toast.success('Listener deleted successfully');
            loadData();
        } else {
            toast.error(result.error || 'Failed to delete listener');
        }
    };

    const openEditModal = (listener: Listener) => {
        setEditingListener(listener);
        setFormData({
            name: listener.name,
            email: listener.email,
            specialties: listener.specialties.join(', '),
            bio: listener.bio,
        });
    };

    const handleLogout = () => {
        clearCurrentUser();
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/dashboard');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl font-bold text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <main className="min-h-screen">
            <DashboardNav
                user={user}
                isLoggedIn={true}
                walletBalance={0}
                showProfileMenu={showProfileMenu}
                onWalletClick={() => { }}
                onProfileClick={() => setShowProfileMenu(!showProfileMenu)}
                onDashboardClick={() => setShowProfileMenu(false)}
                onLogout={handleLogout}
                onLoginClick={() => { }}
            />

            <div className="py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <motion.div
                        className="flex justify-between items-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                            <p className="text-gray-600 mt-1">Manage listeners</p>
                        </div>
                        <motion.button
                            onClick={() => router.push('/dashboard')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaArrowLeft /> Back to Dashboard
                        </motion.button>
                    </motion.div>



                    {/* Listeners Section */}
                    <motion.div
                        className="glass rounded-2xl shadow-glass p-6 md:p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Listeners Management</h2>
                            <motion.button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-lg font-semibold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaPlus /> Add Listener
                            </motion.button>
                        </div>

                        {/* Listeners Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Calls</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listeners.map((listener, idx) => (
                                        <motion.tr
                                            key={listener.id}
                                            className="border-b border-gray-100 hover:bg-gray-50"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td className="py-3 px-4">{listener.name}</td>
                                            <td className="py-3 px-4">{listener.email}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${listener.isAvailable
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                        }`}
                                                >
                                                    {listener.isAvailable ? 'Online' : 'Offline'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">{listener.totalCalls}</td>
                                            <td className="py-3 px-4">⭐ {listener.rating.toFixed(1)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openEditModal(listener)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        <FaEdit />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteListener(listener.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>

                            {listeners.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No listeners found. Add your first listener to get started.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {(showAddModal || editingListener) && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowAddModal(false);
                            setEditingListener(null);
                            setFormData({ name: '', email: '', specialties: '', bio: '' });
                        }}
                    >
                        <motion.div
                            className="glass rounded-2xl shadow-glass p-8 max-w-md w-full"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingListener ? 'Edit Listener' : 'Add New Listener'}
                            </h2>

                            <form onSubmit={editingListener ? handleUpdateListener : handleAddListener}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Specialties (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.specialties}
                                            onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            placeholder="e.g., Anxiety, Depression, Stress"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Bio
                                        </label>
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            rows={3}
                                            placeholder="Brief description..."
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setEditingListener(null);
                                            setFormData({ name: '', email: '', specialties: '', bio: '' });
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-lg font-semibold hover:shadow-lg transition"
                                    >
                                        {editingListener ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
