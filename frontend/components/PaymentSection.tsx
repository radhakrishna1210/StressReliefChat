'use client';

import { useState } from 'react';
import { FaCreditCard, FaMobileAlt, FaApple, FaGoogle } from 'react-icons/fa';

interface PaymentSectionProps {
  selectedOption: {
    type: 'ai' | 'human' | 'therapist';
    name: string;
    pricePerMin: number;
    id?: string;
  } | null;
  onPaymentComplete: (amount: number) => void;
}

export default function PaymentSection({ selectedOption, onPaymentComplete }: PaymentSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [duration, setDuration] = useState(15);
  const [paymentMethod, setPaymentMethod] = useState('');

  if (!selectedOption) return null;

  const totalPrice = selectedOption.pricePerMin * duration;
  const durations = [15, 30, 60];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with Razorpay/Stripe API
    console.log('Payment initiated:', { formData, duration, paymentMethod, totalPrice });
    // Simulate payment success
    setTimeout(() => {
      onPaymentComplete(totalPrice);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">One-Click Pay</h2>
      <p className="text-gray-600 text-center mb-8">
        {selectedOption.type === 'human' 
          ? 'You\'ll be connected with a random listener after payment. Enter your details and select duration.'
          : 'Enter your details and select duration'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:outline-none"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:outline-none"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-blue focus:outline-none"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Select Duration
          </label>
          <div className="grid grid-cols-3 gap-3">
            {durations.map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setDuration(mins)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  duration === mins
                    ? 'border-primary-blue bg-blue-50 text-primary-blue'
                    : 'border-gray-200 hover:border-primary-green'
                }`}
              >
                <div className="font-bold text-lg">{mins} min</div>
                <div className="text-sm">₹{selectedOption.pricePerMin * mins}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'upi'
                  ? 'border-primary-blue bg-blue-50'
                  : 'border-gray-200 hover:border-primary-green'
              }`}
            >
              <FaMobileAlt className="text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium">UPI</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('apple')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'apple'
                  ? 'border-primary-blue bg-blue-50'
                  : 'border-gray-200 hover:border-primary-green'
              }`}
            >
              <FaApple className="text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium">Apple Pay</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('google')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'google'
                  ? 'border-primary-blue bg-blue-50'
                  : 'border-gray-200 hover:border-primary-green'
              }`}
            >
              <FaGoogle className="text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium">Google Pay</div>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-primary-blue bg-blue-50'
                  : 'border-gray-200 hover:border-primary-green'
              }`}
            >
              <FaCreditCard className="text-2xl mx-auto mb-2" />
              <div className="text-sm font-medium">Card</div>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary-blue/10 to-primary-green/10 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-semibold">Total Amount:</span>
            <span className="text-2xl font-bold text-primary-blue">₹{totalPrice}</span>
          </div>
          <div className="text-sm text-gray-600">
            {duration} minutes × ₹{selectedOption.pricePerMin}/min
          </div>
        </div>

        <button
          type="submit"
          disabled={!paymentMethod}
          className="w-full py-4 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Pay ₹{totalPrice} & Start Call
        </button>

        <p className="text-xs text-center text-gray-500">
          Call drops? Auto-reconnect option available at +10% rate
        </p>
      </form>
    </div>
  );
}

