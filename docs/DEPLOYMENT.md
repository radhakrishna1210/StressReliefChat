# Deployment Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Domain name (for production)
- SSL certificate (for production)

## Environment Setup

### Backend Environment Variables

Create `backend/.env` file:

```env
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://yourdomain.com

# Optional: Error Tracking
SENTRY_DSN=your_sentry_dsn
```

### Frontend Environment Variables

Create `frontend/.env.production` file:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Deployment Options

### Option 1: Docker Deployment

#### Step 1: Build Docker Images

```bash
# Build backend
cd backend
docker build -t stressrelief-backend:latest .

# Build frontend
cd ../frontend
docker build -t stressrelief-frontend:latest .
```

#### Step 2: Run with Docker Compose

```bash
# Create .env file with required variables
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Vercel (Frontend) + Render/Railway (Backend)

#### Frontend on Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Configure build settings:
   - **Framework**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add environment variables in Vercel dashboard
5. Deploy

#### Backend on Render

1. Create new Web Service on Render
2. Connect GitHub repo
3. Configure service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add environment variables
5. Deploy

### Option 3: Traditional VPS (Ubuntu)

#### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y
```

#### Step 2: Deploy Backend

```bash
# Clone repository
git clone <your-repo-url>
cd StressReliefChat/backend

# Install dependencies
npm ci --production

# Create logs directory
mkdir logs

# Start with PM2
pm2 start server.js --name stress-backend
pm2 save
pm2 startup
```

#### Step 3: Deploy Frontend

```bash
cd ../frontend

# Install dependencies
npm ci

# Build
npm run build

# Start with PM2
pm2 start npm --name stress-frontend -- start
pm2 save
```

#### Step 4: Configure Nginx

Create `/etc/nginx/sites-available/stressrelief`:

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/stressrelief /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal (already setup by certbot)
sudo systemctl status certbot.timer
```

## Database Setup

### MongoDB Atlas

1. Create cluster (see BACKEND_SETUP.md)
2. Whitelist server IPs
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in environment variables

### Local MongoDB (for staging)

```bash
# Install MongoDB
sudo apt install mongodb -y

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Use connection string
MONGODB_URI=mongodb://localhost:27017/stressrelief
```

## Post-Deployment Checklist

- [ ] Verify health check endpoints: `/health`, `/health/detailed`
- [ ] Test API endpoints with authentication
- [ ] Check database connections
- [ ] Verify CORS configuration
- [ ] Test payment flows (when integrated)
- [ ] Check error logging and monitoring
- [ ] Verify SSL certificates
- [ ] Test from different devices/browsers
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure backup strategy for database
- [ ] Set up error tracking (Sentry)
- [ ] Review security headers

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart services
pm2 restart all

# View status
pm2 status
```

### Database Monitoring

- Use MongoDB Atlas monitoring dashboard
- Set up alerts for high CPU/memory usage
- Monitor slow queries

## Rollback Procedure

```bash
# Stop services
pm2 stop all

# Checkout previous version
git checkout <previous-commit>

# Reinstall dependencies
cd backend && npm ci
cd ../frontend && npm ci && npm run build

# Restart services
pm2 restart all
```

## Troubleshooting

### Backend not starting
- Check logs: `pm2 logs stress-backend`
- Verify environment variables
- Check MongoDB connection
- Verify port 5000 is available

### Frontend not loading
- Check logs: `pm2 logs stress-frontend`
- Verify build completed successfully
- Check API URL in environment variables
- Verify Nginx configuration

### Database connection errors
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Verify IP whitelist includes server IP
- Check database credentials
