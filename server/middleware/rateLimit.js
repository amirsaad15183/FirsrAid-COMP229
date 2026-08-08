// Lightweight in-memory protection for public write endpoints.
// A production system with multiple server instances should use a shared store.
export const createRateLimit = ({ windowMs, max, message }) => {
  const attempts = new Map()

  return (req, res, next) => {
    const now = Date.now()
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const record = attempts.get(key)
    const recent = record && now - record.startedAt < windowMs
      ? record
      : { startedAt: now, count: 0 }

    recent.count += 1
    attempts.set(key, recent)
    res.set('X-RateLimit-Limit', String(max))
    res.set('X-RateLimit-Remaining', String(Math.max(0, max - recent.count)))

    if (recent.count > max) {
      const retryAfterSeconds = Math.ceil((windowMs - (now - recent.startedAt)) / 1000)
      res.set('Retry-After', String(retryAfterSeconds))
      return res.status(429).json({ error: message })
    }

    return next()
  }
}

export const signinLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many sign-in attempts. Please try again in a few minutes.',
})

export const signupLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: 'Too many account requests. Please try again later.',
})

export const contactLimiter = createRateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: 'Too many messages were sent from this connection. Please try again later.',
})
