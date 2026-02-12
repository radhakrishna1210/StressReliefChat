# Backend Setup Guide

This project uses a **separate Express.js backend server** with MongoDB to store user data persistently.

## Backend Structure

The backend is located in the `backend/` directory and runs as a separate server on port 5000.

## Prerequisites

1. **MongoDB Atlas Account** (Free tier available)
   - Sign up at: https://www.mongodb.com/cloud/atlas
   - Create a free cluster

## Setup Steps

### 0. Delete Existing Free Cluster (If You Have One)

**⚠️ Important**: If you already have a free cluster (like "Cluster0"), you need to delete it first because free tier accounts are limited to **one M0 cluster** at a time.

**Note**: Deleting a cluster will **permanently delete all data** stored in it. Make sure you don't need any data from the existing cluster.

**Steps to Delete an Existing Cluster:**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in
2. In the left sidebar, click **"Database"** or go to the main dashboard
3. Find your existing cluster (usually named "Cluster0" or similar)
4. Click the **"..."** (three dots) button next to your cluster name
5. Select **"Terminate"** or **"Delete Cluster"** from the dropdown menu
6. Type the cluster name to confirm deletion (e.g., "Cluster0")
7. Click **"Terminate"** or **"Delete"** to confirm
8. Wait for the deletion to complete (usually takes 1-2 minutes)
9. Once deleted, you can now create a new free cluster

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Click **"Create"** or **"Build a Database"**
4. **Finding the Free Tier (M0):**
   - If you only see paid cluster options, look for a section labeled **"M0 FREE"** or **"Free Shared"**
   - Scroll down on the cluster selection page - the free tier is usually at the bottom
   - Look for a card/option that says **"M0 Sandbox"** or **"Free"** - it should show **$0.00/month**
   - The free tier is labeled as **"M0"** (not M2, M5, M10, etc.)
5. Select the **M0 FREE** tier
6. Select a cloud provider and region (closest to you)
   - **Note**: Some regions may not have free tier available. Try AWS, Google Cloud, or Azure in popular regions like US East (N. Virginia), Europe (Ireland), or Asia Pacific (Mumbai)
7. Click **"Create Cluster"**
   - The cluster creation may take 1-3 minutes

### 2. Configure Database Access

1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter a username and generate a secure password (save this!)
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### 3. Configure Network Access

1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - **Note**: For production, restrict to your server IPs
4. Click "Confirm"

### 4. Get Connection String

1. Go to "Database" in the left sidebar
2. Click **"Connect"** on your cluster
3. You'll see several connection options. **Choose "Connect your application"** (this is what you need for your Node.js backend)
   - **Note**: The other options are optional tools:
     - **Compass**: GUI tool for exploring data (optional, for manual database browsing)
     - **Shell**: Command-line interface (optional, for running MongoDB commands)
     - **MongoDB for VS Code**: VS Code extension (optional, for working in your editor)
     - **Atlas SQL**: SQL tools connection (optional, for SQL-based tools)
4. Select **"Node.js"** as the driver
5. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/`
6. Replace `<password>` with your actual password
7. Add database name: `stressrelief` at the end
   - Final connection string should look like: `mongodb+srv://username:yourpassword@cluster.mongodb.net/stressrelief?retryWrites=true&w=majority`

### 5. Configure Backend Environment Variables

1. Go to the `backend/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Edit `.env` and add your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stressrelief?retryWrites=true&w=majority
FRONTEND_URL=http://localhost:3000
```

### 6. Configure Frontend Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add the backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Important**: 
- Replace `username` with your MongoDB username
- Replace `password` with your MongoDB password
- Replace `cluster` with your actual cluster name
- The `.env.local` file is already in `.gitignore` (won't be committed)

### 7. Install Backend Dependencies

```bash
cd backend
npm install
```

### 8. Start the Backend Server

```bash
# From the backend directory
npm run dev
```

The backend will run on `http://localhost:5000`

### 9. Start the Frontend Server

In a new terminal, from the project root:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 10. Test the Connection

1. Make sure both servers are running
2. Try logging in with a user account
3. Check MongoDB Atlas dashboard → Collections to see if data is being stored
4. Check backend terminal for API request logs

## Database Collections

The backend automatically creates these collections:

- **users**: Stores user profiles and wallet balances
- **transactions**: Stores all wallet transactions (credits/debits)

## API Endpoints

The following API routes are available:

- `GET /api/users/[email]` - Get user data
- `POST /api/users/[email]` - Create/update user
- `GET /api/users/[email]/wallet` - Get wallet balance
- `PUT /api/users/[email]/wallet` - Update wallet balance
- `GET /api/users/[email]/transactions` - Get transactions
- `POST /api/users/[email]/transactions` - Add transaction
- `GET /api/users/[email]/favorites` - Get favorites
- `PUT /api/users/[email]/favorites` - Update favorites
- `GET /api/users/[email]/previous-calls` - Get previous calls
- `PUT /api/users/[email]/previous-calls` - Update previous calls

## Troubleshooting

### Free Tier (M0) Not Showing / Only Paid Clusters Visible

If you only see paid cluster options when creating a cluster:

1. **Scroll down** - The free tier is often at the bottom of the cluster selection page
2. **Look for "M0" or "Free" labels** - The free tier is specifically labeled as "M0 Sandbox" or "M0 FREE"
3. **Check your account type** - Make sure you're using a regular MongoDB Atlas account (not an enterprise account)
4. **Try a different region** - Some regions don't offer free tier. Try:
   - AWS: US East (N. Virginia) - us-east-1
   - Google Cloud: US East (South Carolina) - us-east1
   - Azure: East US - eastus
5. **Check if you already have a free cluster** - Free tier accounts are limited to **one M0 cluster**. If you already have one (like "Cluster0"), you **must delete it first** before creating a new one. See **Step 0** above for deletion instructions.
6. **Clear browser cache** - Sometimes the UI doesn't load properly
7. **Try incognito/private browsing mode** - This can help if there are caching issues
8. **Direct link** - Try going directly to: https://cloud.mongodb.com/ and clicking "Create" → "Build a Database"

**Alternative**: If you still can't find the free tier, you can use MongoDB locally:
- Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
- Use connection string: `mongodb://localhost:27017/stressrelief`

### Connection Error

If you see "MongoNetworkError" or connection issues:

1. Check your MongoDB URI in `.env.local`
2. Verify your IP is whitelisted in Network Access
3. Check your username/password are correct
4. Ensure your cluster is running (not paused)

### Data Not Saving

1. Check browser console for errors
2. Check server logs (terminal where `npm run dev` is running)
3. Verify MongoDB connection string is correct
4. Check MongoDB Atlas → Collections to see if data appears

### Environment Variables Not Loading

1. Make sure `.env.local` is in the project root (same level as `package.json`)
2. Restart your development server after changing `.env.local`
3. Variable names must start with `NEXT_PUBLIC_` for client-side access

## Production Deployment

For production:

1. Use environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Restrict MongoDB Network Access to your server IPs only
3. Use a stronger database user password
4. Consider using MongoDB connection pooling for better performance

## Next Steps

- Add authentication tokens (JWT) for secure API access
- Implement rate limiting
- Add data validation
- Set up database indexes for better performance
- Add error handling and logging

