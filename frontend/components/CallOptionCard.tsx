'use client';

import { motion } from 'framer-motion';
import { FaRobot, FaUserFriends, FaUserMd, FaPhone } from 'react-icons/fa';

interface CallOptionCardProps {
  type: 'ai' | 'human' | 'therapist';
  name?: string;
  description: string;
  price: string;
  features?: string[];
  onSelect: () => void;
  icon?: string;
}

export default function CallOptionCard({
  type,
  name,
  description,
  price,
  features,
  onSelect,
  icon,
}: CallOptionCardProps) {
  const getIcon = () => {
    if (icon) return <span className="text-5xl">{icon}</span>;
    switch (type) {
      case 'ai':
        return <FaRobot className="text-5xl text-primary-blue" />;
      case 'human':
        return <FaUserFriends className="text-5xl text-primary-green" />;
      case 'therapist':
        return <FaUserMd className="text-5xl text-primary-purple" />;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'ai':
        return 'Start AI Call';
      case 'human':
        return 'Connect Now';
      case 'therapist':
        return 'Book Therapist';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'ai':
        return 'from-primary-blue to-blue-600';
      case 'human':
        return 'from-primary-green to-green-600';
      case 'therapist':
        return 'from-primary-purple to-purple-600';
    }
  };

  return (
    <motion.div
      className="glass rounded-2xl shadow-glass p-6 md:p-8 hover:shadow-glass-hover transition-all border-2 border-white/30 hover:border-white/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -10, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.div
        className="text-center mb-4"
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {getIcon()}
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        {name || (type === 'ai' ? 'AI-First Companion' : type === 'human' ? 'P2P Human Listener' : 'Licensed Teletherapy')}
      </h3>
      <p className="text-gray-600 mb-4 text-center">{description}</p>
      <motion.div
        className="bg-gradient-to-r from-primary-blue/10 to-primary-green/10 rounded-lg p-4 mb-4"
        whileHover={{ scale: 1.05 }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-blue">{price}</div>
          {type === 'ai' && <div className="text-sm text-gray-600 mt-1">Free 2-min trial, then ₹1/min</div>}
          {type === 'human' && <div className="text-sm text-gray-600 mt-1">15/30/60 min sessions</div>}
        </div>
      </motion.div>
      {features && features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.map((feature, idx) => (
            <motion.li
              key={idx}
              className="flex items-start text-sm text-gray-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <span className="text-primary-green mr-2 font-bold">✓</span>
              {feature}
            </motion.li>
          ))}
        </ul>
      )}
      <motion.button
        onClick={onSelect}
        className={`w-full py-4 bg-gradient-to-r ${getGradient()} text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-2`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaPhone className="text-xl" />
        {getButtonText()}
      </motion.button>
    </motion.div>
  );
}
