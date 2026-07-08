import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import locationRouter from './modules/location/routes/location.routes.js';
import addressRouter from './modules/address/routes/address.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Parse application/json bodies
app.use(express.json());

// Mock authentication middleware using seeded customer user UUID
app.use((req, res, next) => {
  req.userId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12';
  next();
});

// Expose API routes
app.use('/location', locationRouter);
app.use('/address', addressRouter);

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the DevTech Fashion E-Commerce API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      location: '/location',
      address: '/address'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Express uncaught error:', err);
  res.status(500).json({ success: false, error: 'An unexpected server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`🚀 Address Picker API Server running on port ${PORT}`);
});
