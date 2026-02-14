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
    const [activeTab, setActiveTab] = useState<'listeners' | 'therapists'>('listeners');

    // Listeners State
    const [listeners, setListeners] = useState<Listener[]>([]);
    const [listenerLoading, setListenerLoading] = useState(true);
    const [showListenerModal, setShowListenerModal] = useState(false);
    const [editingListener, setEditingListener] = useState<Listener | null>(null);

    // Therapists State
    const [therapists, setTherapists] = useState<any[]>([]);
    const [therapistLoading, setTherapistLoading] = useState(true);
    const [showTherapistModal, setShowTherapistModal] = useState(false);
    const [editingTherapist, setEditingTherapist] = useState<any | null>(null);

    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Listener Form State
    const [listenerForm, setListenerForm] = useState({
        name: '',
        email: '',
        specialties: '',
        bio: '',
    });

    // Therapist Form State
    const [therapistForm, setTherapistForm] = useState({
        name: '',
        title: '',
        description: '',
        credentials: '',
        specialties: '',
        pricePerMin: 5,
        avatar: '👨‍⚕️',
        experience: '',
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
        loadListeners();
        loadTherapists();
    }, [router]);

    const loadListeners = async () => {
        setListenerLoading(true);
        try {
            const res = await adminApi.getListeners();
            if (res.success) {
                setListeners(res.data.listeners);
            } else {
                toast.error('Failed to load listeners');
            }
        } catch (error) {
            console.error('Error loading listeners:', error);
        } finally {
            setListenerLoading(false);
        }
    };

    const loadTherapists = async () => {
        setTherapistLoading(true);
        try {
            const res = await adminApi.getTherapists();
            if (res.success) {
                setTherapists(res.data);
            } else {
                toast.error('Failed to load therapists');
            }
        } catch (error) {
            console.error('Error loading therapists:', error);
        } finally {
            setTherapistLoading(false);
        }
    };

    // Listener Handlers
    const handleAddListener = async (e: React.FormEvent) => {
        e.preventDefault();
        const specialtiesArray = listenerForm.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const result = await adminApi.addListener({
            name: listenerForm.name,
            email: listenerForm.email,
            specialties: specialtiesArray,
            bio: listenerForm.bio,
        });

        if (result.success) {
            toast.success('Listener added successfully');
            setShowListenerModal(false);
            setListenerForm({ name: '', email: '', specialties: '', bio: '' });
            loadListeners();
        } else {
            toast.error(result.error || 'Failed to add listener');
        }
    };

    const handleUpdateListener = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingListener) return;
        const specialtiesArray = listenerForm.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const result = await adminApi.updateListener(editingListener.id, {
            name: listenerForm.name,
            email: listenerForm.email,
            specialties: specialtiesArray,
            bio: listenerForm.bio,
        });

        if (result.success) {
            toast.success('Listener updated successfully');
            setEditingListener(null);
            setListenerForm({ name: '', email: '', specialties: '', bio: '' });
            loadListeners();
        } else {
            toast.error(result.error || 'Failed to update listener');
        }
    };

    const handleDeleteListener = async (id: string) => {
        if (!confirm('Are you sure you want to delete this listener?')) return;
        const result = await adminApi.deleteListener(id);
        if (result.success) {
            toast.success('Listener deleted successfully');
            loadListeners();
        } else {
            toast.error(result.error || 'Failed to delete listener');
        }
    };

    // Therapist Handlers
    const handleAddTherapist = async (e: React.FormEvent) => {
        e.preventDefault();
        const specialtiesArray = therapistForm.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const result = await adminApi.addTherapist({
            ...therapistForm,
            specialties: specialtiesArray,
            pricePerMin: Number(therapistForm.pricePerMin),
        });

        if (result.success) {
            toast.success('Therapist added successfully');
            setShowTherapistModal(false);
            setTherapistForm({
                name: '', title: '', description: '', credentials: '',
                specialties: '', pricePerMin: 5, avatar: '👨‍⚕️', experience: ''
            });
            loadTherapists();
        } else {
            toast.error(result.error || 'Failed to add therapist');
        }
    };

    const handleUpdateTherapist = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTherapist) return;
        const specialtiesArray = therapistForm.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const result = await adminApi.updateTherapist(editingTherapist.id, {
            ...therapistForm,
            specialties: specialtiesArray,
            pricePerMin: Number(therapistForm.pricePerMin),
        });

        if (result.success) {
            toast.success('Therapist updated successfully');
            setEditingTherapist(null);
            setTherapistForm({
                name: '', title: '', description: '', credentials: '',
                specialties: '', pricePerMin: 5, avatar: '👨‍⚕️', experience: ''
            });
            loadTherapists();
        } else {
            toast.error(result.error || 'Failed to update therapist');
        }
    };

    const handleDeleteTherapist = async (id: string) => {
        if (!confirm('Are you sure you want to delete this therapist?')) return;
        const result = await adminApi.deleteTherapist(id);
        if (result.success) {
            toast.success('Therapist deleted successfully');
            loadTherapists();
        } else {
            toast.error(result.error || 'Failed to delete therapist');
        }
    };

    const handleLogout = () => {
        clearCurrentUser();
        setUser(null);
        toast.success('Logged out successfully');
        router.push('/dashboard');
    };

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
                            <p className="text-gray-600 mt-1">Manage platform resources</p>
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

                    {/* Tabs */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setActiveTab('listeners')}
                            className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'listeners'
                                ? 'bg-primary-blue text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Listeners
                        </button>
                        <button
                            onClick={() => setActiveTab('therapists')}
                            className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'therapists'
                                ? 'bg-primary-blue text-white shadow-lg'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Therapists
                        </button>
                    </div>

                    {/* Content */}
                    <motion.div
                        className="glass rounded-2xl shadow-glass p-6 md:p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeTab}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {activeTab === 'listeners' ? 'Listeners Management' : 'Therapists Management'}
                            </h2>
                            <motion.button
                                onClick={() => activeTab === 'listeners' ? setShowListenerModal(true) : setShowTherapistModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-lg font-semibold"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaPlus /> Add {activeTab === 'listeners' ? 'Listener' : 'Therapist'}
                            </motion.button>
                        </div>

                        {activeTab === 'listeners' ? (
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
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${listener.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                        {listener.isAvailable ? 'Online' : 'Offline'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">{listener.totalCalls}</td>
                                                <td className="py-3 px-4">⭐ {listener.rating.toFixed(1)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingListener(listener);
                                                                setListenerForm({
                                                                    name: listener.name,
                                                                    email: listener.email,
                                                                    specialties: listener.specialties.join(', '),
                                                                    bio: listener.bio,
                                                                });
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteListener(listener.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {listeners.length === 0 && !listenerLoading && (
                                    <div className="text-center py-8 text-gray-500">No listeners found.</div>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Price/Min</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Experience</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {therapists.map((therapist, idx) => (
                                            <motion.tr
                                                key={therapist.id}
                                                className="border-b border-gray-100 hover:bg-gray-50"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                            >
                                                <td className="py-3 px-4 flex items-center gap-2">
                                                    <span className="text-2xl">{therapist.avatar}</span>
                                                    {therapist.name}
                                                </td>
                                                <td className="py-3 px-4">{therapist.title}</td>
                                                <td className="py-3 px-4">₹{therapist.pricePerMin}</td>
                                                <td className="py-3 px-4">{therapist.experience}</td>
                                                <td className="py-3 px-4">⭐ {therapist.rating?.toFixed(1)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTherapist(therapist);
                                                                setTherapistForm({
                                                                    name: therapist.name,
                                                                    title: therapist.title,
                                                                    description: therapist.description,
                                                                    credentials: therapist.credentials,
                                                                    specialties: therapist.specialties.join(', '),
                                                                    pricePerMin: therapist.pricePerMin,
                                                                    avatar: therapist.avatar,
                                                                    experience: therapist.experience,
                                                                });
                                                            }}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTherapist(therapist.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {therapists.length === 0 && !therapistLoading && (
                                    <div className="text-center py-8 text-gray-500">No therapists found.</div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Listener Modal */}
            <AnimatePresence>
                {(showListenerModal || (editingListener && !showTherapistModal)) && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowListenerModal(false);
                            setEditingListener(null);
                            setListenerForm({ name: '', email: '', specialties: '', bio: '' });
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
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                        <input
                                            type="text"
                                            value={listenerForm.name}
                                            onChange={(e) => setListenerForm({ ...listenerForm, name: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={listenerForm.email}
                                            onChange={(e) => setListenerForm({ ...listenerForm, email: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Specialties (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={listenerForm.specialties}
                                            onChange={(e) => setListenerForm({ ...listenerForm, specialties: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            placeholder="e.g., Anxiety, Depression"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
                                        <textarea
                                            value={listenerForm.bio}
                                            onChange={(e) => setListenerForm({ ...listenerForm, bio: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowListenerModal(false);
                                            setEditingListener(null);
                                            setListenerForm({ name: '', email: '', specialties: '', bio: '' });
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

            {/* Therapist Modal */}
            <AnimatePresence>
                {(showTherapistModal || editingTherapist) && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => {
                            setShowTherapistModal(false);
                            setEditingTherapist(null);
                            setTherapistForm({
                                name: '', title: '', description: '', credentials: '',
                                specialties: '', pricePerMin: 5, avatar: '👨‍⚕️', experience: ''
                            });
                        }}
                    >
                        <motion.div
                            className="glass rounded-2xl shadow-glass p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}
                            </h2>
                            <form onSubmit={editingTherapist ? handleUpdateTherapist : handleAddTherapist}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                                            <input
                                                type="text"
                                                value={therapistForm.name}
                                                onChange={(e) => setTherapistForm({ ...therapistForm, name: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={therapistForm.title}
                                                onChange={(e) => setTherapistForm({ ...therapistForm, title: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            value={therapistForm.description}
                                            onChange={(e) => setTherapistForm({ ...therapistForm, description: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            rows={2}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Credentials</label>
                                        <input
                                            type="text"
                                            value={therapistForm.credentials}
                                            onChange={(e) => setTherapistForm({ ...therapistForm, credentials: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Specialties (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={therapistForm.specialties}
                                            onChange={(e) => setTherapistForm({ ...therapistForm, specialties: e.target.value })}
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price/Min (₹)</label>
                                            <input
                                                type="number"
                                                value={therapistForm.pricePerMin}
                                                onChange={(e) => setTherapistForm({ ...therapistForm, pricePerMin: Number(e.target.value) })}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Experience</label>
                                            <input
                                                type="text"
                                                value={therapistForm.experience}
                                                onChange={(e) => setTherapistForm({ ...therapistForm, experience: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-blue focus:outline-none"
                                                placeholder="e.g. 5 years"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gender / Avatar</label>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setTherapistForm({ ...therapistForm, avatar: '👨‍⚕️' })}
                                                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${therapistForm.avatar === '👨‍⚕️'
                                                        ? 'border-primary-blue bg-blue-50 text-primary-blue font-bold'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <span className="text-2xl">👨‍⚕️</span> Male
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTherapistForm({ ...therapistForm, avatar: '👩‍⚕️' })}
                                                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${therapistForm.avatar === '👩‍⚕️'
                                                        ? 'border-pink-500 bg-pink-50 text-pink-600 font-bold'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <span className="text-2xl">👩‍⚕️</span> Female
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowTherapistModal(false);
                                            setEditingTherapist(null);
                                            setTherapistForm({
                                                name: '', title: '', description: '', credentials: '',
                                                specialties: '', pricePerMin: 5, avatar: '👨‍⚕️', experience: ''
                                            });
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-lg font-semibold hover:shadow-lg transition"
                                    >
                                        {editingTherapist ? 'Update' : 'Add'}
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
