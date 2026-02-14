# Quick Start Guide

## Installation & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## Key Features to Test

### 1. Landing Page (`/`)
- Hero section with gradient background
- Floating chat bubble button
- "Start Free AI Triage" button
- "Emergency? Get Help" button
- AI Triage section with 3 questions

### 2. AI Triage Flow
- Answer 3 questions:
  1. Pick your stress type (Work, Relationships, General, Crisis)
  2. Select urgency level (1-5)
  3. Choose preference (AI, Human, Therapist)
- Emergency detection: Try entering "hurt myself" or selecting "Crisis" to see emergency modal

### 3. Call Options (`/call-options`)
- Three main options:
  - **AI Companion**: Free 2-min trial, then ₹1/min
  - **P2P Human Listener**: ₹2/min, shows 5 listener profiles
  - **Licensed Teletherapy**: ₹5/min, shows 3 therapist profiles

### 4. Payment Flow
- Enter name, phone, email (optional)
- Select duration: 15/30/60 minutes
- Choose payment method: UPI, Apple Pay, Google Pay, Card
- See total calculation

### 5. Dashboard (`/dashboard`)
- Login form (demo: just submit without OTP)
- Three tabs:
  - **Call History**: View past calls
  - **Favorites**: Quick connect to favorite listeners
  - **Subscription**: Monthly subscription option (₹999/month)

### 6. Emergency Page (`/emergency`)
- Direct access to crisis hotlines
- India: 9152987821
- Global helplines listed
- Online chat resources

## Dummy Data

### Listeners (5 total)
- Priya Sharma - Relationship Guru
- Sam Patel - Workaholic Recovery
- Anjali Mehta - Anxiety Companion
- Rahul Kumar - Life Transitions Guide
- Maya Desai - Grief & Loss Support

### Therapists (3 total)
- Dr. Singh - Licensed Clinical Psychologist
- Dr. Nair - Licensed Therapist
- Dr. Reddy - Licensed Psychiatrist

## Testing Emergency Detection

Try these in the AI Triage:
- Type "hurt myself" in any field
- Select "Crisis" as stress type
- Select urgency level "5"

All will trigger the emergency modal.

## Next Steps for Production

1. **Set up Twilio/Agora** for voice calls
2. **Configure Razorpay/Stripe** for payments
3. **Set up Firebase** for authentication
4. **Add environment variables** (see `.env.example`)
5. **Deploy** to Vercel/Netlify

## Notes

- All API routes are placeholders
- Payment processing is simulated
- Voice calls are not actually initiated
- OTP verification accepts "123456" for demo
- Session storage used for demo data persistence








