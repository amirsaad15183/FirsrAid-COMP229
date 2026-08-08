import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import trainingClassRoutes from './routes/trainingClass.routes.js'

const app = express()
const currentWorkingDir = process.cwd()

app.use(express.static(path.join(currentWorkingDir, 'dist/app')))
app.use(helmet())
app.use(cors())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// A quick endpoint for checking that the deployed/local API is available.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LifeReady Training API' })
})

app.use('/', authRoutes)
app.use('/', userRoutes)
// Training-class routes are the main project-specific CRUD API for Part 1.
app.use('/', trainingClassRoutes)

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: `${err.name}: ${err.message}` })
  }
  if (err) {
    console.error(err)
    return res.status(400).json({ error: err.message || 'Request could not be processed.' })
  }
  return next()
})

export default app
