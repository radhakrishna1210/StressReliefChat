'use client';

import { motion } from 'framer-motion';
import { FaPhone, FaHeart } from 'react-icons/fa';

interface Listener {
    id: string;
    name: string;
    avatar: string;
    tagline: string;
    description: string;
    pricePerMin: number;
}

interface FavoritesSectionProps {
    favorites: Listener[];
    onConnect?: (listenerId: string) => void;
    onRemoveFavorite?: (listenerId: string) => void;
}

export default function FavoritesSection({ favorites, onConnect, onRemoveFavorite }: FavoritesSectionProps) {
    if (favorites.length === 0) {
        return (
            <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-6xl mb-4">❤️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h3>
                <p className="text-gray-600 mb-6">
                    Mark listeners as favorites during or after calls to see them here
                </p>
            </motion.div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Favorite Listeners</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {favorites.map((listener, index) => (
                    <motion.div
                        key={listener.id}
                        className="glass rounded-xl shadow-glass hover:shadow-glass-hover p-6 transition-all"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <motion.div
                                className="text-5xl"
                                whileHover={{ scale: 1.2, rotate: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {listener.avatar}
                            </motion.div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{listener.name}</h3>
                                        <p className="text-primary-green font-semibold">{listener.tagline}</p>
                                    </div>
                                    {onRemoveFavorite && (
                                        <motion.button
                                            onClick={() => onRemoveFavorite(listener.id)}
                                            className="text-red-500 hover:text-red-600 transition"
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            aria-label="Remove from favorites"
                                        >
                                            <FaHeart className="text-xl" />
                                        </motion.button>
                                    )}
                                </div>
                                <p className="text-gray-600 text-sm mt-1">{listener.description}</p>
                            </div>
                        </div>
                        {onConnect && (
                            <motion.button
                                onClick={() => onConnect(listener.id)}
                                className="w-full py-3 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FaPhone />
                                Quick Connect (₹{(listener.pricePerMin * 1.2).toFixed(0)}/min)
                            </motion.button>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
