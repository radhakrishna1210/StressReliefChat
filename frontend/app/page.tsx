'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AITriage from '@/components/AITriage';
import EmergencyModal from '@/components/EmergencyModal';
import { FaHeadphones, FaRobot, FaUserMd, FaClock, FaShieldAlt } from 'react-icons/fa';
import { getCurrentUser } from '@/lib/storage';

export default function Home() {
  const router = useRouter();
  const [showEmergency, setShowEmergency] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    setIsLoggedIn(!!user);
  }, []);

  // Generate stable particle positions only on client to avoid hydration mismatch
  const particles = useMemo(() => {
    if (!isMounted) return [];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: 20 + Math.random() * 40,
      height: 20 + Math.random() * 40,
      duration: 8 + Math.random() * 4,
      delay: Math.random() * 2,
    }));
  }, [isMounted]);

  const handleStartTriage = () => {
    const user = getCurrentUser();
    if (!user) {
      sessionStorage.setItem('redirectAfterLogin', '/dashboard');
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const scrollToTriage = () => {
    const triageElement = document.getElementById('ai-triage');
    if (triageElement) {
      triageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    { icon: FaHeadphones, title: 'Instant entry', desc: '3-question AI pulse', color: 'text-primary-blue' },
    { icon: FaUserMd, title: 'P2P listeners', desc: 'Shared experiences', color: 'text-primary-green' },
    { icon: FaRobot, title: '24/7 AI voice bots', desc: 'Always available', color: 'text-primary-blue' },
    { icon: FaShieldAlt, title: 'Pro teletherapy', desc: 'Licensed professionals', color: 'text-primary-green' },
    { icon: FaClock, title: 'Pay per minute', desc: '15/30/60 min sessions', color: 'text-primary-blue' },
    { icon: null, emoji: '💳', title: 'One-click pay', desc: 'UPI, Apple/Google Pay', color: 'text-primary-purple' },
  ];

  return (
    <main className="min-h-screen">
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
        {/* Floating Particles Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                width: `${particle.width}px`,
                height: `${particle.height}px`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                delay: particle.delay,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Stressed? Talk it out now –{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-primary-green">
              No signup needed
            </span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-gray-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI matches you to empathetic listeners or AI companions in seconds.{' '}
            <span className="font-semibold text-primary-green">Pay only for what you use.</span>
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <motion.button
              onClick={handleStartTriage}
              className="px-8 py-4 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Free AI Triage
            </motion.button>
            <motion.button
              onClick={() => setShowEmergency(true)}
              className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Emergency? Get Help
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass rounded-xl p-6 shadow-glass hover:shadow-glass-hover transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {feature.icon ? (
                  <feature.icon className={`text-4xl ${feature.color} mx-auto mb-3`} />
                ) : (
                  <div className="text-4xl mx-auto mb-3">{feature.emoji}</div>
                )}
                <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Triage Section */}
      <section id="ai-triage" className="py-16 px-4 bg-white/50">
        <AITriage />
      </section>

      {/* Floating Chat Bubble */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={handleStartTriage}
          className="bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all floating"
          aria-label="Start chat"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaHeadphones className="text-2xl" />
        </motion.button>
      </motion.div>
    </main>
  );
}

