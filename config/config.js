// Render provides RENDER_EXTERNAL_URL automatically; local development uses Vite.
const deployedClientOrigin = process.env.CLIENT_ORIGIN || process.env.RENDER_EXTERNAL_URL

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
  clientOrigin: deployedClientOrigin || 'http://localhost:5173',
  trustProxy: process.env.TRUST_PROXY === 'true',
}

if (!config.jwtSecret || !config.mongoUri) {
  throw new Error('JWT_SECRET and MONGODB_URI must be set in the environment.')
}

if (config.env === 'production' && config.jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.')
}

if (config.env === 'production' && !deployedClientOrigin) {
  throw new Error('CLIENT_ORIGIN or RENDER_EXTERNAL_URL must be set in production.')
}

export default config
