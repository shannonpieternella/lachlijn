import rateLimit from 'express-rate-limit'

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window per IP
  message: {
    success: false,
    message: 'Te veel requests. Probeer het later opnieuw.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Auth endpoints (login/register) - strengere limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 auth attempts per window per IP
  message: {
    success: false,
    message: 'Te veel inlog pogingen. Probeer het over 15 minuten opnieuw.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Call endpoints - voorkomen spam calls
export const callLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Max 3 calls per minute per IP
  message: {
    success: false,
    message: 'Je kunt maximaal 3 calls per minuut maken. Wacht even...'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Admin endpoints - zeer restrictief
export const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // Max 20 admin requests per minute per IP
  message: {
    success: false,
    message: 'Admin rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false,
})