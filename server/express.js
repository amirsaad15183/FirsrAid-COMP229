import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import fs from 'fs'
import config from '../config/config.js'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import trainingClassRoutes from './routes/trainingClass.routes.js'
import locationRoutes from './routes/location.routes.js'
import companyInfoRoutes from './routes/companyInfo.routes.js'
import contactMessageRoutes from './routes/contactMessage.routes.js'

const app = express()
const currentWorkingDir = process.cwd()
const clientBuildPath = path.join(currentWorkingDir, 'dist', 'app')

app.disable('x-powered-by')
if (config.trustProxy) app.set('trust proxy', 1)
app.use(helmet())
const allowedOrigins = config.clientOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origin is not allowed by this API.'))
  },
}))
app.use(compress())
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))
app.use(cookieParser())

// Render serves the compiled Vite application from this folder in production.
app.use(express.static(clientBuildPath))

// A quick endpoint for checking that the deployed/local API is available.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LifeReady Training API' })
})

app.use('/', authRoutes)
app.use('/', userRoutes)
// Training-class routes are the main project-specific CRUD API for Part 1.
app.use('/', trainingClassRoutes)
app.use('/', locationRoutes)
app.use('/', companyInfoRoutes)
app.use('/', contactMessageRoutes)

// Keep missing API/auth routes machine-readable instead of returning the React page.
app.use(['/api', '/auth'], (req, res) => {
  res.status(404).json({ error: 'API route not found.' })
})

// Support direct links and browser refreshes on React Router pages after deployment.
app.use((req, res, next) => {
  if (req.method !== 'GET') return next()
  const clientIndex = path.join(clientBuildPath, 'index.html')
  if (!fs.existsSync(clientIndex)) {
    return res.status(503).json({ error: 'Client build is not available. Run npm run build first.' })
  }
  return res.sendFile(clientIndex, (error) => error && next(error))
})

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Authentication is required or the session has expired.' })
  }
  if (err) {
    console.error(err)
    return res.status(err.status || 500).json({ error: 'Request could not be processed.' })
  }
  return next()
})

export default app
