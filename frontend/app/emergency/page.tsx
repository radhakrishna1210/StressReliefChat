'use client';

import { emergencyHotlines } from '@/lib/data';
import { FaPhone, FaGlobe } from 'react-icons/fa';

export default function EmergencyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">🚨</div>
          <h1 className="text-4xl font-bold text-red-600 mb-3">Crisis Support Available</h1>
          <p className="text-xl text-gray-700">
            You're not alone. Help is available right now, 24/7.
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {/* India Emergency */}
          <div className="bg-red-50 border-4 border-red-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <FaPhone className="text-2xl text-red-600" />
              <h2 className="text-2xl font-bold text-red-800">India Emergency Helpline</h2>
            </div>
            <a
              href={`tel:${emergencyHotlines.india}`}
              className="block text-4xl font-bold text-red-600 hover:text-red-700 mb-2 transition"
            >
              {emergencyHotlines.india}
            </a>
            <p className="text-gray-700 font-semibold">Available 24/7 • Free & Confidential</p>
            <a
              href={`tel:${emergencyHotlines.india}`}
              className="mt-4 inline-block px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition"
            >
              Call Now
            </a>
          </div>

          {/* Global Helplines */}
          <div className="bg-blue-50 border-4 border-blue-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <FaGlobe className="text-2xl text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-800">Global Helplines</h2>
            </div>
            <div className="space-y-3">
              {emergencyHotlines.global.map((line) => (
                <div
                  key={line.country}
                  className="bg-white rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-bold text-gray-800">{line.country}</div>
                    <div className="text-sm text-gray-600">24/7 Crisis Support</div>
                  </div>
                  <a
                    href={`tel:${line.number.replace(/\s/g, '')}`}
                    className="text-xl font-bold text-blue-600 hover:text-blue-700"
                  >
                    {line.number}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Online Resources */}
          <div className="bg-green-50 border-4 border-green-300 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-3">Online Chat Support</h2>
            <p className="text-gray-700 mb-4">
              If you prefer text-based support, these resources are available:
            </p>
            <div className="space-y-2">
              <a
                href="https://www.iasp.info/resources/Crisis_Centres/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white rounded-lg hover:bg-green-100 transition"
              >
                <div className="font-semibold text-green-800">IASP Crisis Centres</div>
                <div className="text-sm text-gray-600">International chat helplines directory</div>
              </a>
              <a
                href="https://www.crisistextline.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-white rounded-lg hover:bg-green-100 transition"
              >
                <div className="font-semibold text-green-800">Crisis Text Line</div>
                <div className="text-sm text-gray-600">Text-based crisis support (Global)</div>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 text-center">
          <p className="text-gray-700 font-semibold">
            💚 Remember: Your life has value. Reach out—help is here.
          </p>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-primary-blue hover:text-primary-green font-semibold"
          >
            ← Return to Home
          </a>
        </div>
      </div>
    </main>
  );
}

