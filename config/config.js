const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGODB_URI,
}

if (!config.jwtSecret || !config.mongoUri) {
  throw new Error('JWT_SECRET and MONGODB_URI must be set in the environment.')
}

export default config
