import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const adminEmail = process.env.TEST_ADMIN_EMAIL
const adminPassword = process.env.TEST_ADMIN_PASSWORD

if (!adminEmail || !adminPassword) {
  throw new Error('Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD before running the API test.')
}

const { default: config } = await import('../config/config.js')
const { default: app } = await import('../server/express.js')

const testPort = 3100
const timestamp = Date.now()
const studentEmail = `student-${timestamp}@example.com`
const studentPassword = 'StudentPass2026!'

const server = await new Promise((resolve) => {
  const instance = app.listen(testPort, '127.0.0.1', () => resolve(instance))
})

const callApi = async (path, options = {}) => {
  const response = await fetch(`http://127.0.0.1:${testPort}${path}`, options)
  return { status: response.status, body: await response.json() }
}

const expectStatus = (label, actual, expected) => {
  if (actual !== expected) throw new Error(`${label}: expected ${expected}, received ${actual}`)
  console.log(`PASS: ${label}`)
}

try {
  await mongoose.connect(config.mongoUri)

  expectStatus('health check', (await callApi('/api/health')).status, 200)

  const signup = await callApi('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'API Test Student', email: studentEmail, password: studentPassword }),
  })
  expectStatus('user create', signup.status, 201)
  const userId = signup.body.user._id

  const studentSignin = await callApi('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: studentEmail, password: studentPassword }),
  })
  expectStatus('student authentication', studentSignin.status, 200)
  const studentToken = studentSignin.body.token

  const forbiddenClass = await callApi('/api/training-classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({}),
  })
  expectStatus('student is blocked from admin-only class creation', forbiddenClass.status, 403)

  expectStatus('user read', (await callApi(`/api/users/${userId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  })).status, 200)

  expectStatus('user update', (await callApi(`/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${studentToken}` },
    body: JSON.stringify({ name: 'Updated API Test Student' }),
  })).status, 200)

  const adminSignin = await callApi('/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  })
  expectStatus('admin authentication', adminSignin.status, 200)
  const adminToken = adminSignin.body.token

  const classCreate = await callApi('/api/training-classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'API Test BLS Class',
      category: 'BLS',
      format: 'in-person',
      description: 'Temporary record used to verify Part 1 CRUD.',
      classDate: '2027-02-15T14:00:00.000Z',
      durationHours: 4,
      location: 'Toronto Training Centre',
      capacity: 12,
      price: 89.99,
      instructor: 'API Test Instructor',
    }),
  })
  expectStatus('training class create', classCreate.status, 201)
  const classId = classCreate.body._id

  expectStatus('training class list', (await callApi('/api/training-classes')).status, 200)

  expectStatus('training class update', (await callApi(`/api/training-classes/${classId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ capacity: 16 }),
  })).status, 200)

  expectStatus('training class delete', (await callApi(`/api/training-classes/${classId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  })).status, 200)

  expectStatus('user delete', (await callApi(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${studentToken}` },
  })).status, 200)

  console.log('All Part 1 CRUD, authentication, and authorization API checks passed.')
} finally {
  await new Promise((resolve) => server.close(resolve))
  await mongoose.disconnect()
}
