# StressRelief Backend API

Separate Express.js backend server for the StressReliefChat application.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update with your MongoDB connection string:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stressrelief?retryWrites=true&w=majority
   FRONTEND_URL=http://localhost:3000
   ```

3. **Start the server:**
   ```bash
   # Development (with auto-reload)
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### User Management
- `GET /api/users/:email` - Get user data
- `POST /api/users/:email` - Create or update user

### Wallet
- `GET /api/users/:email/wallet` - Get wallet balance
- `PUT /api/users/:email/wallet` - Update wallet balance

### Transactions
- `GET /api/users/:email/transactions` - Get transaction history
- `POST /api/users/:email/transactions` - Add new transaction

### Favorites
- `GET /api/users/:email/favorites` - Get user favorites
- `PUT /api/users/:email/favorites` - Update favorites

### Previous Calls
- `GET /api/users/:email/previous-calls` - Get previous calls
- `PUT /api/users/:email/previous-calls` - Update previous calls

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── controllers/
│   ├── userController.js
│   ├── walletController.js
│   ├── transactionController.js
│   ├── favoriteController.js
│   └── previousCallsController.js
├── middleware/
│   ├── cors.js           # CORS configuration
│   └── errorHandler.js   # Error handling
├── routes/
│   └── userRoutes.js     # API routes
├── server.js             # Main server file
├── package.json
└── .env                  # Environment variables
```

## Development

The server runs on `http://localhost:5000` by default.

Make sure your frontend is configured to call this backend URL by setting:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Production

For production deployment:
1. Set `NODE_ENV=production`
2. Use a process manager like PM2
3. Configure proper CORS origins
4. Use environment variables for all sensitive data





