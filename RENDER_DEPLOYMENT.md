# Deploying StressReliefChat to Render

This guide walks you through deploying your StressReliefChat application to Render, a cloud platform that supports both backend APIs and frontend applications.

## Prerequisites

- [x] GitHub account with your code pushed to a repository
- [ ] [Render account](https://render.com) (free tier available)
- [ ] [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas) (free tier available)

## Architecture Overview

Your deployment will consist of:
1. **Backend Web Service** - Express.js API with Socket.IO (WebSocket support)
2. **Frontend Web Service** - Next.js application
3. **MongoDB Atlas** - Managed MongoDB database

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up/log in
2. Create a new cluster (free M0 tier is sufficient for testing)
3. Click **"Connect"** → **"Connect your application"**
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
5. Replace `<password>` with your actual database password
6. Add `/stressreliefchat` at the end: `mongodb+srv://username:password@cluster.mongodb.net/stressreliefchat`
7. In **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (Render's IPs are dynamic)

## Step 2: Deploy Backend to Render

### 2.1 Create Backend Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `stressreliefchat-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for production)

### 2.2 Configure Backend Environment Variables

In the Render dashboard for your backend service, go to **Environment** and add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `PORT` | `5000` | Render will override this automatically |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `<generate-random-string>` | Use a strong random string (32+ chars) |
| `JWT_REFRESH_SECRET` | `<generate-random-string>` | Different from JWT_SECRET |
| `FRONTEND_URL` | `https://your-frontend.onrender.com` | Update after frontend deployment |
| `GOOGLE_CLIENT_ID` | `<your-google-client-id>` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `<your-google-client-secret>` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://your-backend.onrender.com/api/auth/google/callback` | Update with your backend URL |
| `EMAIL_USER` | `<your-email>` | For nodemailer (optional) |
| `EMAIL_PASS` | `<your-email-password>` | For nodemailer (optional) |
| `ADMIN_EMAIL` | `<admin-email>` | Admin account email |
| `ADMIN_PASSWORD` | `<secure-password>` | Admin account password |

> **Tip**: To generate secure random strings for JWT secrets, use:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2.3 Deploy Backend

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your backend
3. Once deployed, copy your backend URL (e.g., `https://stressreliefchat-backend.onrender.com`)

## Step 3: Deploy Frontend to Render

### 3.1 Create Frontend Web Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Select the same GitHub repository
3. Configure the service:
   - **Name**: `stressreliefchat-frontend` (or your preferred name)
   - **Region**: Same as backend for lower latency
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free` (or paid for production)

### 3.2 Configure Frontend Environment Variables

In the Render dashboard for your frontend service, add these variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NODE_ENV` | `production` | Required |
| `NEXT_PUBLIC_API_URL` | `https://your-backend.onrender.com` | Your backend URL from Step 2.3 |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-backend.onrender.com` | Same as API URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `<your-google-client-id>` | Same as backend |

> **Important**: All variables starting with `NEXT_PUBLIC_` are exposed to the browser.

### 3.3 Deploy Frontend

1. Click **"Create Web Service"**
2. Render will build and deploy your Next.js application
3. Once deployed, copy your frontend URL (e.g., `https://stressreliefchat-frontend.onrender.com`)

## Step 4: Update Backend Environment

1. Go back to your **backend service** in Render
2. Update the `FRONTEND_URL` environment variable with your actual frontend URL
3. Click **"Save Changes"** - this will trigger a redeployment

## Step 5: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://your-frontend.onrender.com`
5. Add to **Authorized redirect URIs**:
   - `https://your-backend.onrender.com/api/auth/google/callback`
6. Save changes

## Step 6: Verify Deployment

### Backend Health Check
Visit: `https://your-backend.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-12T...",
  "uptime": 123.45,
  "database": "connected"
}
```

### Frontend Check
Visit: `https://your-frontend.onrender.com`

Your application should load correctly.

### Test Core Features
1. **User Registration/Login** - Create a test account
2. **WebRTC Connection** - Test peer-to-peer voice chat
3. **Admin Dashboard** - Log in with admin credentials
4. **Socket.IO** - Check real-time features work

## Important Notes

### Free Tier Limitations
- **Cold Starts**: Services sleep after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.
- **Build Minutes**: Limited monthly build minutes on free tier.
- **Bandwidth**: 100GB/month on free tier.

### WebSocket Support
Render supports WebSockets on all tiers, including free. Your Socket.IO connections will work correctly.

### HTTPS
All Render services automatically get HTTPS with free SSL certificates.

## Troubleshooting

### Backend Won't Start
- Check logs in Render dashboard
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas allows connections from `0.0.0.0/0`

### Frontend Can't Connect to Backend
- Verify `NEXT_PUBLIC_API_URL` matches your backend URL exactly
- Check CORS settings in backend allow your frontend URL
- Look for errors in browser console

### WebSocket Connection Fails
- Ensure backend is using `https://` (not `http://`)
- Check Socket.IO CORS configuration in `backend/server.js`
- Verify `FRONTEND_URL` environment variable is set correctly

### Database Connection Errors
- Verify MongoDB Atlas connection string is correct
- Check that IP whitelist includes `0.0.0.0/0`
- Ensure database user has read/write permissions

### Cold Start Issues
- Consider upgrading to a paid plan for always-on services
- Implement a health check ping service to keep services warm
- Add loading states in frontend for initial connection delays

## Alternative: One-Click Deploy with render.yaml

You can also use the `render.yaml` file in the repository root for one-click deployment:

1. Push `render.yaml` to your repository
2. In Render Dashboard, click **"New +"** → **"Blueprint"**
3. Connect your repository
4. Render will automatically create both services
5. You'll still need to configure environment variables manually

## Next Steps

After successful deployment:
1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up automated backups for MongoDB
4. Implement CI/CD for automatic deployments
5. Consider upgrading to paid tier for production use

## Support

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
