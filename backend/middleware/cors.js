const cors = require('cors');

const isProd = process.env.NODE_ENV === 'production';

// Allow localhost + LAN IP origins in development so you can test from another device
// (e.g. phone -> http://192.168.x.x:3000).
const devOriginAllowlist = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

const corsOptions = {
  origin: (origin, callback) => {
    // No Origin header (curl, health checks, same-origin server calls)
    if (!origin) return callback(null, true);

    // Production: strict single origin (or comma-separated list) via env
    if (isProd) {
      const allowed = (process.env.FRONTEND_URL || '').split(',').map((s) => s.trim()).filter(Boolean);
      return callback(null, allowed.length === 0 ? origin : allowed.includes(origin));
    }

    // Development: allow localhost + any http://<lan-ip>:3000 + HTTPS tunnels
    if (devOriginAllowlist.includes(origin)) return callback(null, true);
    if (/^http:\/\/\d{1,3}(\.\d{1,3}){3}:3000$/.test(origin)) return callback(null, true);

    // Allow HTTPS tunnel services (ngrok, cloudflare, VS Code tunnels, localtunnel, etc.)
    if (/^https:\/\/.*\.(ngrok-free\.app|ngrok\.io|trycloudflare\.com|loca\.lt|devtunnels\.ms)$/i.test(origin)) {
      return callback(null, true);
    }

    // Otherwise block
    return callback(new Error(`CORS blocked origin: ${origin}`), false);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);


