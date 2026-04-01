const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const fieldsRoutes = require('./modules/fields/fields.routes');
const bookingsRoutes = require('./modules/bookings/bookings.routes');
const matchesRoutes = require('./modules/matches/matches.routes');
const walletRoutes = require('./modules/wallet/wallet.routes');
const ratingsRoutes = require('./modules/ratings/ratings.routes');
const ownerRoutes = require('./modules/owner/owner.routes');

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Health check ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Yalla Kora API ⚽', timestamp: new Date() });
});

// ── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/fields', fieldsRoutes);
app.use('/api/fields/:field_id/rate', ratingsRoutes); // nested: POST /fields/:id/rate
app.use('/api/bookings', bookingsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/owner', ownerRoutes);

// ── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'المسار غير موجود' });
});

// ── Global Error Handler ────────────────────────────────
app.use(errorHandler);

module.exports = app;
