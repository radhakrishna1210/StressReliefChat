# Production Environment Variables Guide

This guide explains what environment variables you need to set for production deployment.

## Frontend `.env.production` File

**Location:** `frontend/.env.production`

### Required Variables

#### 1. `NEXT_PUBLIC_API_URL` ⚠️ **REQUIRED**
- **Description:** The URL of your backend API server
- **Example for Render:** `https://stress-relief-backend.onrender.com`
- **Example for custom domain:** `https://api.yourdomain.com`
- **Important:** 
  - Must include `https://` protocol
  - No trailing slash
  - Must be accessible from the internet
- **Used in:** All API calls, authentication, data fetching

#### 2. `NEXT_PUBLIC_GOOGLE_CLIENT_ID` ⚠️ **REQUIRED**
- **Description:** Google OAuth 2.0 Client ID (public)
- **Where to get it:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create a new project or select existing
  3. Enable Google+ API
  4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
  5. Application type: "Web application"
  6. Authorized redirect URIs: `https://your-frontend-domain.com/api/auth/google/callback`
- **Format:** `xxxxx.apps.googleusercontent.com`
- **Note:** This is safe to expose in the browser (it's public)

#### 3. `GOOGLE_CLIENT_SECRET` ⚠️ **REQUIRED**
- **Description:** Google OAuth 2.0 Client Secret (private)
- **Where to get it:** Same place as Client ID (Google Cloud Console)
- **Important:** 
  - Keep this secret! Never expose it to the browser
  - Used only in server-side API routes
  - If compromised, regenerate it immediately

#### 4. `MONGODB_URI` ⚠️ **REQUIRED** (if using MongoDB in API routes)
- **Description:** MongoDB connection string
- **Format:** `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- **Where to get it:**
  1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
  2. Create a cluster (free tier available)
  3. Go to "Database Access" → Create database user
  4. Go to "Network Access" → Add IP address (0.0.0.0/0 for Render)
  5. Go to "Database" → "Connect" → "Connect your application"
  6. Copy the connection string
- **Note:** Replace `<password>` with your actual password

### Optional Variables

#### `NODE_ENV`
- **Default:** Automatically set to `production` during build
- **Description:** Node.js environment
- **Value:** `production`

#### `BUILD_ID`
- **Default:** `development`
- **Description:** Build identifier for cache busting
- **Value:** Any string (e.g., `production`, `v1.0.0`, timestamp)

## Example `.env.production` File

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://stress-relief-backend.onrender.com

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# MongoDB (if needed)
MONGODB_URI=mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/stressrelief?retryWrites=true&w=majority

# Optional
NODE_ENV=production
BUILD_ID=production
```

## For Render Deployment

When deploying to Render, you don't need a `.env.production` file. Instead, set these variables in the Render dashboard:

1. Go to your **stress-relief-frontend** service
2. Click on **Environment** tab
3. Add the following variables:

| Key | Value | Notes |
|-----|-------|-------|
| `NEXT_PUBLIC_API_URL` | `https://stress-relief-backend.onrender.com` | Your backend URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Your Google Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | From Google Cloud Console |
| `MONGODB_URI` | Your MongoDB URI | From MongoDB Atlas |
| `NODE_ENV` | `production` | Usually set automatically |

**Note:** Render automatically sets `NODE_ENV=production` and `NEXT_PUBLIC_API_URL` from the `render.yaml` configuration.

## For Other Platforms (Vercel, Netlify, etc.)

### Vercel
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for "Production" environment
4. Variables prefixed with `NEXT_PUBLIC_` are automatically exposed

### Netlify
1. Go to Site settings → Environment variables
2. Add each variable
3. Variables prefixed with `NEXT_PUBLIC_` are automatically exposed

## Security Best Practices

1. ✅ **Never commit** `.env.production` to version control
2. ✅ **Use strong secrets** - Generate random strings for JWT_SECRET
3. ✅ **Rotate secrets regularly** - Especially if exposed
4. ✅ **Use environment-specific values** - Different values for dev/staging/prod
5. ✅ **Restrict MongoDB access** - Only allow your server IPs
6. ✅ **Use HTTPS** - Always use `https://` in production URLs
7. ✅ **Validate environment variables** - Check they're set before deployment

## Troubleshooting

### Variable Not Loading?
- ✅ Make sure variable name is correct (case-sensitive)
- ✅ Restart your development server after changes
- ✅ For `NEXT_PUBLIC_*` variables, rebuild the app (`npm run build`)
- ✅ Check that `.env.production` is in the `frontend/` directory

### Google OAuth Not Working?
- ✅ Check redirect URI matches exactly in Google Console
- ✅ Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set correctly
- ✅ Verify `GOOGLE_CLIENT_SECRET` is set (server-side only)
- ✅ Make sure Google+ API is enabled in Google Cloud Console

### API Calls Failing?
- ✅ Verify `NEXT_PUBLIC_API_URL` is correct and accessible
- ✅ Check CORS settings on backend
- ✅ Ensure backend is running and accessible
- ✅ Check browser console for errors

## Quick Setup Checklist

- [ ] Create `.env.production` file in `frontend/` directory
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend URL
- [ ] Get Google OAuth credentials from Google Cloud Console
- [ ] Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] Set `GOOGLE_CLIENT_SECRET`
- [ ] Get MongoDB connection string from MongoDB Atlas
- [ ] Set `MONGODB_URI` (if needed)
- [ ] Verify all URLs use `https://` in production
- [ ] Test the application locally with production variables
- [ ] Deploy and verify environment variables are set correctly



