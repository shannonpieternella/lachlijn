import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/database.js'
import { generalLimiter } from './middleware/rateLimiter.js'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import callRoutes from './routes/calls.js'
import scenarioRoutes from './routes/scenarios.js'
import adminRoutes from './routes/admin.js'
import billingRoutes, { billingWebhookHandler } from './routes/billing.js'

// Load environment variables
dotenv.config()
// Also try to load top-level .env (vapi-dashboard/.env) so both server and root env work
try {
  const topLevelEnv = path.join(process.cwd(), '..', '.env')
  dotenv.config({ path: topLevelEnv })
} catch (_) {}

const app = express()
const PORT = process.env.PORT || 3001
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Connect to MongoDB
connectDB()

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Voor VAPI integratie
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Laat media vanaf andere origins (5173) laden
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://api.vapi.ai"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.vapi.ai", "https://api.stripe.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https:", "http://localhost:3001"],
      frameSrc: ["'self'", "https://js.stripe.com"]
    }
  }
}))

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://lachlijn.nl', 'https://www.lachlijn.nl']
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Password', 'x-admin-password']
}))

// Stripe webhook must be mounted BEFORE body parsers to access raw body
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingWebhookHandler)

// Body parsing middleware (applies to all other routes)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// General rate limiting
app.use(generalLimiter)

// Static files (for simple history page)
app.use(express.static(path.join(__dirname, 'public')))

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
    next()
  })
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Lachlijn.nl API is running! 🎭',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/calls', callRoutes)
app.use('/api/scenarios', scenarioRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/billing', billingRoutes)

// Simple HTML history page
app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'history.html'))
})

// Public share redirect - redirect to frontend
app.get('/r/:shareId', (req, res) => {
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://lachlijn.nl' 
    : 'http://localhost:5173'
  res.redirect(`${frontendUrl}/share/${req.params.shareId}`)
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  })
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Global error handler:', error)

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message)
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    })
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    })
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    })
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    })
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PrankCall.nl API running on port ${PORT}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎭 Frontend should connect to: http://localhost:${PORT}`)
  }
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})

export default app
