'use client';

import { useEffect } from 'react';
import { emergencyHotlines } from '@/lib/data';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyModal({ isOpen, onClose }: EmergencyModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🚨</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Crisis Support Available</h2>
          <p className="text-gray-600">You're not alone. Help is available right now.</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">India Emergency Helpline</h3>
            <a
              href={`tel:${emergencyHotlines.india}`}
              className="text-2xl font-bold text-red-600 hover:text-red-700 block"
            >
              {emergencyHotlines.india}
            </a>
            <p className="text-sm text-gray-600 mt-1">Available 24/7</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Global Helplines</h3>
            <div className="space-y-2">
              {emergencyHotlines.global.map((line) => (
                <div key={line.country} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{line.country}:</span>
                  <a
                    href={`tel:${line.number.replace(/\s/g, '')}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {line.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2">Online Chat Support</h3>
            <p className="text-sm text-gray-600">
              Visit <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">IASP Crisis Centres</a> for chat helplines
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            I'm Safe
          </button>
          <a
            href={`tel:${emergencyHotlines.india}`}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition text-center"
          >
            Call Now
          </a>
        </div>
      </div>
    </div>
  );
}

