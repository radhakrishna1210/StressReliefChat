'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AITriageProps {
  onEmergencyDetected?: () => void; // Optional, kept for backward compatibility but not used
}

export default function AITriage({ onEmergencyDetected }: AITriageProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    stressType: '',
    urgency: '',
    preference: '',
  });

  const stressTypes = [
    { value: 'work', label: 'Work' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'general', label: 'General' },
    { value: 'crisis', label: 'Crisis' },
  ];

  const urgencyLevels = [
    { value: '1', label: '1 - I can wait', emoji: '😌' },
    { value: '2', label: '2 - Soon would be nice', emoji: '🙂' },
    { value: '3', label: '3 - Moderate urgency', emoji: '😐' },
    { value: '4', label: '4 - Pretty urgent', emoji: '😟' },
    { value: '5', label: '5 - Need help now', emoji: '😰' },
  ];

  const preferences = [
    { value: 'ai', label: 'AI Companion', desc: '24/7 available, free trial' },
    { value: 'human', label: 'Human Listener', desc: 'Empathetic peer support' },
    { value: 'therapist', label: 'Professional Therapist', desc: 'Licensed clinical care' },
  ];

  const handleSubmit = () => {
    // Store answers and navigate to dashboard (call options)
    // No automatic emergency detection - emergency modal only shows when user clicks "Emergency? Get Help" button
    sessionStorage.setItem('triageAnswers', JSON.stringify(answers));
    router.push('/dashboard');
  };

  const handleAnswer = (field: string, value: string) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
    
    // Auto-advance after selection
    setTimeout(() => {
      if (step < 3) {
        setStep(step + 1);
      }
    }, 300);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">What's the vibe?</h2>
      <p className="text-gray-600 text-center mb-8">Quick 3-question pulse check</p>

      <div className="space-y-6">
        {/* Question 1 */}
        <div className={`transition-all ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            1. Pick your stress:
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stressTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleAnswer('stressType', type.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  answers.stressType === type.value
                    ? 'border-primary-blue bg-blue-50 text-primary-blue'
                    : 'border-gray-200 hover:border-primary-green hover:bg-green-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        {step >= 2 && (
          <div className="transition-all animate-in fade-in">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              2. How urgent? (Scale 1-5)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {urgencyLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleAnswer('urgency', level.value)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    answers.urgency === level.value
                      ? 'border-primary-blue bg-blue-50'
                      : 'border-gray-200 hover:border-primary-green hover:bg-green-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{level.emoji}</div>
                  <div className="text-xs font-medium">{level.value}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 3 */}
        {step >= 3 && (
          <div className="transition-all animate-in fade-in">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              3. Prefer AI, Human Listener, or Pro Therapist?
            </label>
            <div className="space-y-3">
              {preferences.map((pref) => (
                <button
                  key={pref.value}
                  onClick={() => handleAnswer('preference', pref.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    answers.preference === pref.value
                      ? 'border-primary-blue bg-blue-50'
                      : 'border-gray-200 hover:border-primary-green hover:bg-green-50'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{pref.label}</div>
                  <div className="text-sm text-gray-600">{pref.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {step === 3 && answers.stressType && answers.urgency && answers.preference && (
          <button
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-primary-blue to-primary-green text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Get Matched →
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 flex justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-2 rounded-full transition-all ${
              s <= step ? 'bg-primary-blue w-8' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

