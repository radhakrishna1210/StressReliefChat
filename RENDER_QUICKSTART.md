# Quick Start: Deploy to Render

This is a condensed guide for deploying StressReliefChat to Render. For detailed instructions, see [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md).

## Prerequisites Checklist

- [ ] Code pushed to GitHub
- [ ] [Render account](https://render.com) created
- [ ] [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster created
- [ ] MongoDB connection string ready
- [ ] Google OAuth credentials ready (optional)

## Quick Deploy Steps

### 1. MongoDB Atlas (5 minutes)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/stressreliefchat`
3. Whitelist IP: `0.0.0.0/0` in Network Access

### 2. Deploy Backend (10 minutes)
1. Render Dashboard → **New +** → **Web Service**
2. Connect GitHub repo
3. Settings:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
4. Add environment variables (see table below)
5. Deploy

### 3. Deploy Frontend (10 minutes)
1. Render Dashboard → **New +** → **Web Service**
2. Same GitHub repo
3. Settings:
   - Root Directory: `frontend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. Add environment variables (see table below)
5. Deploy

### 4. Update Backend FRONTEND_URL
1. Go to backend service
2. Update `FRONTEND_URL` with your frontend URL
3. Save (triggers redeploy)

## Environment Variables

### Backend
```
NODE_ENV=production
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generate-random-32-char-string>
JWT_REFRESH_SECRET=<generate-different-random-string>
FRONTEND_URL=https://your-frontend.onrender.com
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
GOOGLE_CALLBACK_URL=https://your-backend.onrender.com/api/auth/google/callback
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<secure-password>
```

### Frontend
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<optional>
```

## Verify Deployment

- Backend health: `https://your-backend.onrender.com/health`
- Frontend: `https://your-frontend.onrender.com`

## Common Issues

**Backend won't start?**
- Check MongoDB connection string
- Verify all required env vars are set

**Frontend can't connect?**
- Verify `NEXT_PUBLIC_API_URL` matches backend URL
- Check browser console for errors

**WebSocket fails?**
- Ensure using `https://` (not `http://`)
- Check `FRONTEND_URL` is set correctly in backend

## Next Steps

1. Test user registration/login
2. Test WebRTC voice chat
3. Test admin dashboard
4. Set up custom domain (optional)
5. Upgrade to paid tier for production

---

**Need help?** See the full guide: [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
