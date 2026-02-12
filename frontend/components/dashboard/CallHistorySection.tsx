'use client';

import { motion } from 'framer-motion';
import { FaPhone, FaStar } from 'react-icons/fa';
import { format } from 'date-fns';

interface Call {
    id: string;
    type: 'ai' | 'human' | 'therapist';
    name: string;
    date: string;
    duration: number;
    cost: number;
    rating: number;
}

interface CallHistorySectionProps {
    calls: Call[];
    onReconnect?: (callId: string) => void;
}

export default function CallHistorySection({ calls, onReconnect }: CallHistorySectionProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case 'ai': return '🤖';
            case 'human': return '👤';
            case 'therapist': return '👨‍⚕️';
            default: return '📞';
        }
    };

    if (calls.length === 0) {
        return (
            <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-6xl mb-4">📞</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Call History Yet</h3>
                <p className="text-gray-600 mb-6">Start your first conversation to see your history here</p>
            </motion.div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Call History</h2>
            {calls.map((call, index) => (
                <motion.div
                    key={call.id}
                    className="glass rounded-xl shadow-glass hover:shadow-glass-hover p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                >
                    <div className="flex items-start gap-4">
                        <motion.div
                            className="text-4xl"
                            whileHover={{ scale: 1.2, rotate: 10 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            {getIcon(call.type)}
                        </motion.div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{call.name}</h3>
                            <p className="text-gray-600 text-sm">
                                {format(new Date(call.date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-gray-600 text-sm">
                                Duration: {call.duration} min • Cost: ₹{call.cost}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <FaStar />
                            <span className="font-semibold">{call.rating}</span>
                        </div>
                        {onReconnect && (
                            <motion.button
                                onClick={() => onReconnect(call.id)}
                                className="px-4 py-2 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-lg hover:shadow-lg transition flex items-center gap-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaPhone className="text-sm" />
                                Reconnect (+20%)
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
