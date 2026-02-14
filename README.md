# StressReliefChat - Instant Stress Conversation Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![Production Ready](https://img.shields.io/badge/production-ready-success)](docs/DEPLOYMENT.md)

A calming, no-signup website for stressed users to instantly connect via AI triage to P2P empathetic listeners, AI voice companions, or licensed teletherapy.

## ✨ Features

- **Instant Entry**: 3-question AI triage with no signup required
- **Multiple Support Options**:
  - AI-First Companion (Free 2-min trial, then ₹1/min)
  - P2P Human Listeners (₹2/min, 15/30/60 min sessions)
  - Licensed Teletherapy (₹5/min)
- **Emergency Detection**: Automatic crisis keyword detection with immediate hotline access
- **One-Click Payments**: UPI, Apple Pay, Google Pay, Cards via Razorpay/Stripe
- **Advanced Features**:
  - Call history and recordings (opt-in)
  - Favorite listeners for quick reconnect (+20% price hike)
  - Monthly subscription: Hire one human for ₹999/month
  - Optional login for history tracking

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js with comprehensive middleware
- **Database**: MongoDB with optimized indexes
- **Authentication**: JWT-based secure authentication
- **Security**: Helmet.js, rate limiting, input validation, CORS
- **Logging**: Winston with file rotation
- **Deployment**: Docker, Docker Compose, CI/CD ready

See [Architecture Documentation](docs/ARCHITECTURE.md) for detailed system design.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (Atlas account or local installation)

### Development Setup

1. **Clone and setup backend:**
```bash
# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Start backend server
npm run dev
```

2. **Setup frontend:**
```bash
# Install frontend dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start frontend
npm run dev
```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📁 Project Structure

```
StressReliefChat/
├── frontend/           # Next.js application
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities & helpers
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript types
├── backend/           # Express.js API server
│   ├── config/        # Configuration files
│   ├── controllers/   # Request handlers
│   ├── middleware/    # Express middleware
│   ├── routes/        # API routes
│   ├── utils/         # Utility functions
│   └── logs/          # Application logs
└── docs/              # Documentation
```

## 🔒 Security Features

- **JWT Authentication** for API endpoints
- **Rate Limiting** (API: 100/15min, Auth: 5/15min, Payment: 10/hour)
- **Input Validation** and sanitization
- **Helmet.js** security headers
- **CORS** configuration
- **Error Handling** without sensitive data exposure
- **Logging** with Winston (production-ready)

See [Security Documentation](docs/SECURITY.md) for details.

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

See [Deployment Guide](docs/DEPLOYMENT.md) for production deployment options.

## 📚 Documentation

- [API Documentation](docs/API.md) - Complete API reference
- [Architecture](docs/ARCHITECTURE.md) - System design and data flow  
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Security Policy](docs/SECURITY.md) - Security measures and best practices
- [Backend Setup](BACKEND_SETUP.md) - MongoDB and backend configuration
- [Quick Start](QUICKSTART.md) - Feature testing guide

## 🧪 Testing

```bash
# Backend tests (when configured)
cd backend
npm test

# Frontend linting
cd frontend
npm run lint

# Security audit
npm audit
```

## 🛠️ Production Enhancements

Recent improvements for production readiness:

### Backend
- ✅ JWT authentication middleware
- ✅ Rate limiting (general, auth, payment)
- ✅ Winston logging with file rotation
- ✅ Input validation and sanitization
- ✅ Enhanced error handling
- ✅ MongoDB connection pooling
- ✅ Database indexes for performance
- ✅ Health check endpoints
- ✅ Security headers (Helmet.js)
- ✅ Request logging with metrics

### Frontend
- ✅ Error boundaries for graceful error handling
- ✅ Loading spinners and skeletons
- ✅ Form validation with Zod
- ✅ Centralized error handling
- ✅ Custom API hooks (useApi)
- ✅ TypeScript validation schemas

### Infrastructure
- ✅ Docker and Docker Compose configuration
- ✅ GitHub Actions CI/CD pipeline
- ✅ ESLint and Prettier setup
- ✅ Production-optimized Next.js config
- ✅ Environment templates for all stages

## 🔄 CI/CD

GitHub Actions pipeline includes:
- Automated testing
- Linting checks
- Security audits
- Docker image builds

## 🌐 Deployment Options

1. **Docker** - Containerized deployment
2. **Vercel** (Frontend) + Render/Railway (Backend)
3. **Traditional VPS** with Nginx + PM2
4. **Kubernetes** (for large scale)

## 📊 Monitoring & Logging

- **Winston** structured logging with daily rotation
- **Health checks** at `/health`, `/health/detailed`, `/health/ready`, `/health/live`
- **Request logging** with performance metrics
- **Error tracking** ready for Sentry integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Run linting: `npm run lint`
4. Commit your changes
5. Push and create a Pull Request

## 📝 License

This project is for demonstration purposes. Ensure proper licensing for production use.

## 🆘 Support

- **Documentation**: See `/docs` folder
- **Issues**: GitHub Issues
- **Security**: See [SECURITY.md](docs/SECURITY.md)

## 🎯 Roadmap

- [ ] Integration with voice call services (Twilio/Agora)
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Firebase authentication
- [ ] Real-time call functionality
- [ ] Mobile applications (React Native)
- [ ] Advanced analytics dashboard
- [ ] Automated testing suite
- [ ] Sentry error tracking integration

---

**Developer Note**: This application now includes production-grade security, monitoring, and deployment configurations. Review the documentation before deploying to production.


A calming, no-signup website for stressed users to instantly connect via AI triage to P2P empathetic listeners, AI voice companions, or licensed teletherapy.

## Features

- **Instant Entry**: 3-question AI triage with no signup required
- **Multiple Support Options**:
  - AI-First Companion (Free 2-min trial, then ₹1/min)
  - P2P Human Listeners (₹2/min, 15/30/60 min sessions)
  - Licensed Teletherapy (₹5/min)
- **Emergency Detection**: Automatic crisis keyword detection with immediate hotline access
- **One-Click Payments**: UPI, Apple Pay, Google Pay, Cards via Razorpay/Stripe
- **Advanced Features**:
  - Call history and recordings (opt-in)
  - Favorite listeners for quick reconnect (+20% price hike)
  - Monthly subscription: Hire one human for ₹999/month
  - Optional login for history tracking

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Voice Calls**: Twilio/Agora (placeholders)
- **Payments**: Razorpay/Stripe (placeholders)
- **Auth**: Firebase (placeholders)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/              # API routes (payment, call, auth)
│   ├── call-options/     # Call selection page
│   ├── dashboard/        # User dashboard (requires login)
│   ├── emergency/        # Emergency support page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── AITriage.tsx      # AI triage questionnaire
│   ├── CallOptionCard.tsx # Call option display card
│   ├── EmergencyModal.tsx # Emergency crisis modal
│   └── PaymentSection.tsx # Payment form component
├── lib/
│   └── data.ts           # Dummy data (listeners, therapists)
└── public/               # Static assets
```

## Dummy Data

The app includes:
- **5 P2P Human Listeners**: Priya, Sam, Anjali, Rahul, Maya
- **3 Licensed Therapists**: Dr. Singh, Dr. Nair, Dr. Reddy

## API Integration Placeholders

The following API routes are set up with placeholders:
- `/api/payment` - Payment processing (Razorpay/Stripe)
- `/api/call` - Voice call initiation (Twilio/Agora)
- `/api/auth/otp` - OTP verification (Firebase)

## Emergency Features

The app automatically detects crisis keywords in user input:
- "hurt myself", "kill myself", "end it", "suicide", "self harm", etc.
- Shows emergency modal with hotline numbers
- India: 9152987821
- Global hotlines included

## Payment Flow

1. User selects support option
2. Chooses duration (15/30/60 min)
3. Enters name, phone, email (optional)
4. Selects payment method (UPI, Apple Pay, Google Pay, Card)
5. Payment processed (placeholder)
6. Call initiated (placeholder)

## Future Integrations

To make this production-ready:

1. **Twilio/Agora Integration**:
   - Set up Twilio account
   - Configure voice call routing
   - Implement call recording (opt-in)

2. **Payment Integration**:
   - Set up Razorpay/Stripe account
   - Configure webhooks for payment confirmation
   - Implement refund logic for dropped calls

3. **Firebase Integration**:
   - Set up Firebase project
   - Configure phone authentication
   - Set up Firestore for user data and call history

4. **Analytics**:
   - Track triage answers
   - Monitor drop-offs
   - Analyze popular listeners

## Design

- **Theme**: Calming minimalism with soft blues (#4A90E2) and greens (#50C878)
- **Layout**: Mobile-first, responsive design
- **UI Elements**: Rounded cards, large voice buttons, gradient backgrounds

## License

This project is for demonstration purposes. Ensure proper licensing for production use.








