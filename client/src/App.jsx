import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { calculateDuration } from './lib/courseSchedule'
import './App.css'
// Modern WebP keeps the home-page LCP image sharp while substantially reducing transfer size.
import heroImage from './assets/images/lifeready-cpr-training-hero.webp'

// Main frontend composition file: shared state, API helpers, pages, and protected React routes live here.
const AuthContext = createContext(null)
const CartContext = createContext(null)
const categories = ['Emergency First Aid', 'Standard First Aid', 'CPR/AED', 'BLS']

const getStoredSession = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('lifeready-session'))
    // Only non-sensitive display information is retained locally; the credential is HTTP-only.
    return stored?.user ? { user: stored.user } : null
  } catch {
    return null
  }
}

const getStoredCart = () => {
  try {
    return JSON.parse(localStorage.getItem('lifeready-cart')) || []
  } catch {
    return []
  }
}

const request = async (url, { method = 'GET', body } = {}) => {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
  return data
}

const api = {
  classes: (query = '') => request(`/api/training-classes${query}`),
  classById: (id) => request(`/api/training-classes/${id}`),
  createClass: (token, body) => request('/api/training-classes', { method: 'POST', token, body }),
  updateClass: (token, id, body) => request(`/api/training-classes/${id}`, { method: 'PUT', token, body }),
  deleteClass: (token, id) => request(`/api/training-classes/${id}`, { method: 'DELETE', token }),
  locations: (query = '') => request(`/api/locations${query}`),
  createLocation: (token, body) => request('/api/locations', { method: 'POST', token, body }),
  updateLocation: (token, id, body) => request(`/api/locations/${id}`, { method: 'PUT', token, body }),
  deleteLocation: (token, id) => request(`/api/locations/${id}`, { method: 'DELETE', token }),
  companyInfo: () => request('/api/company-info'),
  updateCompanyInfo: (token, body) => request('/api/company-info', { method: 'PUT', token, body }),
  contact: (body) => request('/api/contact-messages', { method: 'POST', body }),
  contactMessages: (token) => request('/api/contact-messages', { token }),
  signUp: (body) => request('/api/users', { method: 'POST', body }),
  signIn: (body) => request('/auth/signin', { method: 'POST', body }),
  signOut: () => request('/auth/signout', { method: 'POST' }),
  currentSession: () => request('/auth/session'),
  users: (token) => request('/api/users', { token }),
  user: (token, id) => request(`/api/users/${id}`, { token }),
  updateUser: (token, id, body) => request(`/api/users/${id}`, { method: 'PUT', token, body }),
  deleteUser: (token, id) => request(`/api/users/${id}`, { method: 'DELETE', token }),
}

const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession)

  const signIn = (newSession) => {
    const safeSession = { user: newSession.user }
    localStorage.setItem('lifeready-session', JSON.stringify(safeSession))
    setSession(safeSession)
  }

  useEffect(() => {
    let active = true
    api.currentSession()
      .then((currentSession) => {
        if (active) signIn(currentSession)
      })
      .catch(() => {
        localStorage.removeItem('lifeready-session')
        if (active) setSession(null)
      })
    return () => { active = false }
  }, [])

  const signOut = async () => {
    try { await api.signOut() } catch { /* Clearing local credentials still protects the UI. */ }
    localStorage.removeItem('lifeready-session')
    setSession(null)
  }

  const value = useMemo(() => ({ session, signIn, signOut }), [session])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function CartProvider({ children }) {
  const [items, setItems] = useState(getStoredCart)

  const updateItems = (nextItems) => {
    localStorage.setItem('lifeready-cart', JSON.stringify(nextItems))
    setItems(nextItems)
  }

  const addItem = (course) => {
    if (items.some((item) => item._id === course._id)) return false
    updateItems([...items, course])
    return true
  }

  const removeItem = (courseId) => updateItems(items.filter((item) => item._id !== courseId))
  const clearCart = () => updateItems([])
  const value = { items, addItem, removeItem, clearCart }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

const useCart = () => useContext(CartContext)

function PageTitle({ title }) {
  useEffect(() => { document.title = `${title} | LifeReady Training` }, [title])
  return null
}

function Layout({ children }) {
  const { session, signOut } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const firstName = session?.user.name?.trim().split(/\s+/)[0] || 'there'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const closeMenu = () => setOpen(false)
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand" onClick={closeMenu} aria-label="LifeReady Training home">
            <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M9 6V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V6" /><rect x="3.5" y="6" width="17" height="13.5" rx="2.2" /><path d="M12 16.2s-3-1.8-3-3.7a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 1.9-3 3.7-3 3.7Z" /></svg></span>
            <span><strong>LifeReady</strong><small>Training</small></span>
          </Link>
          <button className="menu-toggle" type="button" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>Menu</button>
          <nav className={`main-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
            <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
            <NavLink to="/courses" onClick={closeMenu}>Courses</NavLink>
            <NavLink to="/course-information" onClick={closeMenu}>Course Information</NavLink>
            <NavLink to="/first-aid-guide" onClick={closeMenu}>First Aid Guide</NavLink>
            <NavLink to="/about" onClick={closeMenu}>About</NavLink>
            <NavLink to="/contact" onClick={closeMenu}>Contact</NavLink>
            {session ? (
              <>
                {session.user.role === 'admin' && <NavLink to="/admin/classes" onClick={closeMenu}>Manage Classes</NavLink>}
                {session.user.role === 'admin' && <NavLink to="/admin/locations" onClick={closeMenu}>Locations</NavLink>}
                {session.user.role === 'admin' && <NavLink to="/users" onClick={closeMenu}>Users</NavLink>}
                {session.user.role === 'admin' && <NavLink to="/admin/messages" onClick={closeMenu}>Messages</NavLink>}
                <NavLink to="/cart" onClick={closeMenu}>Cart{items.length ? ` (${items.length})` : ''}</NavLink>
                <NavLink to={`/profile/${session.user._id}`} onClick={closeMenu}>My Profile</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/signin" onClick={closeMenu}>Sign in</NavLink>
                <Link className="button button-small" to="/signup" onClick={closeMenu}>Create account</Link>
              </>
            )}
          </nav>
          {session && <div className="account-area"><Link className="welcome-card" to={`/profile/${session.user._id}`} onClick={closeMenu}><span>Welcome</span><strong>{firstName}</strong>{session.user.role === 'admin' && <em>Admin</em>}</Link><button type="button" className="signout-control" onClick={handleSignOut}>Sign out</button></div>}
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div><div className="brand footer-brand"><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M9 6V4.8c0-.7.6-1.3 1.3-1.3h3.4c.7 0 1.3.6 1.3 1.3V6" /><rect x="3.5" y="6" width="17" height="13.5" rx="2.2" /><path d="M12 16.2s-3-1.8-3-3.7a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 1.9-3 3.7-3 3.7Z" /></svg></span><span><strong>LifeReady</strong><small>Training</small></span></div><p>Practical first-aid learning for prepared, confident communities.</p></div>
          <div><h2>Explore</h2><Link to="/courses">Upcoming courses</Link><Link to="/course-information">Course information</Link><Link to="/first-aid-guide">First-aid guide</Link><Link to="/about">About LifeReady</Link><Link to="/contact">Contact us</Link></div>
          <div><h2>Important</h2><p>For a life-threatening emergency, call 911 immediately. This website provides general education only.</p></div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} LifeReady Training. Logo and hero image are AI-generated for this student project.</div>
      </footer>
    </div>
  )
}

function Loading({ label = 'Loading...' }) { return <div className="loading" role="status">{label}</div> }
function ErrorMessage({ error }) { return error ? <p className="form-error" role="alert">{error}</p> : null }

function EmptyState({ title, text, action }) {
  return <section className="empty-state"><h2>{title}</h2><p>{text}</p>{action}</section>
}

function formatDate(value) {
  if (!value) return 'Date to be confirmed'
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function formatCourseDate(value) {
  if (!value) return 'Date to be confirmed'
  return new Intl.DateTimeFormat('en-CA', { dateStyle: 'full' }).format(new Date(value))
}

function formatTime(value) {
  if (!value) return ''
  const [hours, minutes] = value.split(':').map(Number)
  return new Intl.DateTimeFormat('en-CA', { hour: 'numeric', minute: '2-digit' }).format(new Date(2020, 0, 1, hours, minutes))
}

function formatClassSchedule(course) {
  const times = course.startTime && course.endTime ? ` · ${formatTime(course.startTime)}–${formatTime(course.endTime)}` : ''
  return `${formatCourseDate(course.classDate)}${times}`
}

function courseDateValue(value) {
  const date = new Date(value)
  const timezoneOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

function courseDayValue(value) {
  return new Date(value).toISOString().slice(0, 10)
}

export function CourseCard({ course, compact = false }) {
  return (
    <article className={`course-card ${compact ? 'compact' : ''}`} data-cy="course-card">
      <div className="course-card-top"><span className="course-category">{course.category}</span><span className="course-format">{course.format === 'blended' ? 'Blended' : 'Full'}</span></div>
      <h3>{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <dl className="course-meta"><div><dt>Schedule</dt><dd>{formatClassSchedule(course)}</dd></div><div><dt>Location</dt><dd>{course.location}</dd></div><div><dt>Duration</dt><dd>{course.durationHours} hours</dd></div></dl>
      <div className="course-card-footer"><strong>${Number(course.price).toFixed(2)}</strong><Link className="text-link" to={`/courses/${course._id}`}>View course <span aria-hidden="true">→</span></Link></div>
    </article>
  )
}

function HomePage() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    api.classes('?status=scheduled').then(setClasses).catch((e) => setError(e.message)).finally(() => setLoading(false))
  }, [])
  return <>
    <PageTitle title="First Aid & CPR Training" />
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(10, 33, 48, .96) 0%, rgba(10, 33, 48, .84) 37%, rgba(10, 33, 48, .14) 67%), url(${heroImage})` }}>
      <div className="container hero-content"><p className="eyebrow light">First aid, CPR/AED & BLS education</p><h1>Be ready when it matters most.</h1><p className="hero-copy">Build calm, practical confidence through instructor-led training designed for everyday people and healthcare learners.</p><div className="hero-actions"><Link className="button" to="/courses">Explore classes</Link><Link className="button button-ghost" to="/first-aid-guide">Read the guide</Link></div><p className="hero-note">For an emergency, call 911. Training supports preparedness; it does not replace emergency services.</p></div>
    </section>
    <section className="container trust-strip" aria-label="Training highlights"><div><strong>Hands-on</strong><span>Practical skills practice</span></div><div><strong>Clear guidance</strong><span>Learn the why and how</span></div><div><strong>Flexible formats</strong><span>In-person and blended options</span></div></section>
    <section className="section container"><div className="section-heading"><div><p className="eyebrow">Upcoming training</p><h2>Find a course that fits your role.</h2></div><Link className="text-link" to="/courses">See all courses <span aria-hidden="true">→</span></Link></div>{loading ? <Loading label="Loading upcoming classes..." /> : error ? <ErrorMessage error={error} /> : classes.length ? <div className="course-grid">{classes.slice(0, 3).map((course) => <CourseCard key={course._id} course={course} compact />)}</div> : <EmptyState title="Courses are being scheduled" text="Please check back soon for upcoming first-aid and BLS classes." action={<Link className="button button-outline" to="/signup">Create an account</Link>} />}</section>
    <section className="education-section"><div className="container education-grid"><div><p className="eyebrow light">Preparedness starts before an emergency</p><h2>Learn the first steps—then train with an instructor.</h2><p>Our guide explains how to recognize an emergency, contact help, and protect yourself while you wait for trained responders.</p><Link className="button button-light" to="/first-aid-guide">Visit the first-aid guide</Link></div><ol><li><span>01</span> Check the scene for danger.</li><li><span>02</span> Call 911 or ask someone to call.</li><li><span>03</span> Follow dispatcher instructions.</li></ol></div></section>
    <section className="section container split-section"><div><p className="eyebrow">Why LifeReady</p><h2>Professional learning, without the pressure.</h2><p>LifeReady is a course-management experience created for a COMP229 MERN application project. It demonstrates real authentication, authorization, and CRUD workflows while presenting a polished training-provider website.</p></div><div className="principles"><div><strong>Accessible</strong><span>Clear language, responsive pages, and readable contrast.</span></div><div><strong>Practical</strong><span>Course information is always visible before a learner signs in.</span></div><div><strong>Secure</strong><span>Accounts and class management use JWT-protected API routes.</span></div></div></section>
  </>
}

function CoursesPageV3() {
  const [searchParams] = useSearchParams()
  const [classes, setClasses] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState(() => categories.includes(searchParams.get('category')) ? searchParams.get('category') : 'All')
  const [location, setLocation] = useState('All')
  const [date, setDate] = useState('')
  useEffect(() => {
    Promise.all([api.classes('?status=scheduled'), api.locations('?active=true')])
      .then(([courseResults, locationResults]) => { setClasses(courseResults); setLocations(locationResults) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])
  const locationNames = locations.length ? locations.map((item) => item.name) : ['Toronto', 'Markham']
  const visibleClasses = classes.filter((course) => (
    (category === 'All' || course.category === category)
    && (location === 'All' || course.location === location)
    && (!date || courseDayValue(course.classDate) === date)
  ))
  return <div className="page container"><PageTitle title="Courses" /><div className="page-intro"><p className="eyebrow">Training calendar</p><h1>Choose your class, date, and location.</h1><p>Start by selecting the Toronto or Markham training location that works for you. Available dates update below without requiring an account.</p></div>{locations.length > 0 && <section className="location-showcase" aria-label="Training locations"><div className="location-showcase-heading"><div><p className="eyebrow">Training locations</p><h2>Where would you like to train?</h2></div><button type="button" className="text-button reset-location" onClick={() => setLocation('All')}>View all locations</button></div><div className="location-cards">{locations.map((item) => { const count = classes.filter((course) => course.location === item.name).length; const selected = location === item.name; return <button type="button" key={item._id} className={`location-card ${selected ? 'is-selected' : ''}`} aria-pressed={selected} onClick={() => setLocation(selected ? 'All' : item.name)}><span className="location-card-kicker">Training location</span><strong>{item.name}</strong><span>{item.address}</span><small>{count} {count === 1 ? 'available class' : 'available classes'} · View dates</small></button> })}</div></section>}<div className="filters filters-three"><label>Course category<select data-cy="course-category-filter" value={category} onChange={(e) => setCategory(e.target.value)}><option>All</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label><label>Location<select data-cy="course-location-filter" value={location} onChange={(e) => setLocation(e.target.value)}><option>All</option>{locationNames.map((item) => <option key={item}>{item}</option>)}</select></label><label>Class date<input data-cy="course-date-filter" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>{loading ? <Loading label="Loading courses..." /> : error ? <ErrorMessage error={error} /> : visibleClasses.length ? <div className="course-grid">{visibleClasses.map((course) => <CourseCard key={course._id} course={course} />)}</div> : <EmptyState title="No classes match those filters" text="Try another location, date, or course category." />}</div>
}

function FirstAidGuidePage() {
  return <div className="page container">
    <PageTitle title="First Aid Guide" />
    <div className="page-intro narrow">
      <p className="eyebrow">Education centre</p>
      <h1>Know your first steps.</h1>
      <p>This general information is not a substitute for certified training, medical advice, or emergency services. Call 911 for serious or life-threatening emergencies.</p>
    </div>
    <section className="emergency-callout">
      <strong>In an emergency</strong>
      <span>Check for danger, call 911, and follow the dispatcher’s instructions.</span>
    </section>
    <section className="guide-cta preparedness-update">
      <div>
        <p className="eyebrow">Preparedness reminder</p>
        <h2>Keep your first-aid kit ready.</h2>
        <p>Store a stocked kit in an accessible place, review its contents regularly, and replace used or expired supplies. For a life-threatening emergency, call 911 immediately.</p>
      </div>
    </section>
    <div className="guide-grid">
      <article><span className="guide-number">01</span><h2>Check the scene</h2><p>Before helping, look for hazards such as traffic, fire, electricity, or unsafe surroundings. Do not put yourself in danger.</p></article>
      <article><span className="guide-number">02</span><h2>Get emergency help</h2><p>Call 911 or direct a specific person to call. State the location, what happened, and any immediate risks.</p></article>
      <article><span className="guide-number">03</span><h2>Follow trained guidance</h2><p>Follow the emergency dispatcher’s instructions while you wait for responders. Certified training builds the skill needed to respond appropriately.</p></article>
      <article><span className="guide-number">04</span><h2>Keep learning</h2><p>Skills such as CPR/AED use and first aid are best learned in hands-on, instructor-led courses and refreshed regularly.</p></article>
    </div>
    <section className="guide-cta">
      <div><p className="eyebrow">Build confidence</p><h2>Ready to learn hands-on?</h2><p>Explore LifeReady’s planned First Aid, CPR/AED, and BLS class catalogue.</p></div>
      <Link className="button" to="/courses">View courses</Link>
    </section>
  </div>
}

function CourseDetailsScheduleWithCart() {
  const { classId } = useParams()
  const { session } = useAuth()
  const { addItem, items } = useCart()
  const [course, setCourse] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => { api.classById(classId).then(setCourse).catch((e) => setError(e.message)) }, [classId])
  if (error) return <div className="page container"><PageTitle title="Course not found" /><ErrorMessage error={error} /><Link className="button button-outline" to="/courses">Back to courses</Link></div>
  if (!course) return <div className="page container"><Loading label="Loading course details..." /></div>
  const inCart = items.some((item) => item._id === course._id)
  const addToCart = () => setNotice(addItem(course) ? 'Class added to your registration cart.' : 'This class is already in your registration cart.')
  return <div className="page container"><PageTitle title={course.title} /><Link className="back-link" to="/courses">← Back to courses</Link><article className="course-detail"><div className="course-detail-main"><span className="course-category">{course.category}</span><h1>{course.title}</h1><p className="lead">{course.description}</p><div className="detail-grid"><div><strong>Class date</strong><span>{formatCourseDate(course.classDate)}</span></div><div><strong>Schedule</strong><span>{course.startTime && course.endTime ? `${formatTime(course.startTime)}–${formatTime(course.endTime)}` : `${course.durationHours} hours`}</span></div><div><strong>Location</strong><span>{course.location}</span></div><div><strong>Format</strong><span>{course.format === 'blended' ? 'Blended learning' : 'Full class'}</span></div><div><strong>Instructor</strong><span>{course.instructor}</span></div></div></div><aside className="course-summary"><p>Course fee</p><strong>${Number(course.price).toFixed(2)}</strong><span>{course.durationHours} hours · up to {course.capacity} learners</span>{session ? <><button data-cy="add-to-cart" className="button" type="button" onClick={addToCart} disabled={inCart}>{inCart ? 'Already in cart' : 'Add to cart'}</button>{notice && <p className="cart-notice" role="status">{notice}</p>}<Link className="text-link cart-link" to="/cart">View registration cart →</Link></> : <Link className="button" to="/signin">Sign in to add to cart</Link>}<small>Registration requests are confirmed by LifeReady; online payment is not collected in this academic release.</small></aside></article></div>
}

function CartPageSchedule() {
  const { items, removeItem, clearCart } = useCart()
  const [submitted, setSubmitted] = useState(false)
  const total = items.reduce((sum, item) => sum + Number(item.price), 0)
  if (submitted) return <div className="page container"><PageTitle title="Registration request received" /><EmptyState title="Registration request received" text="Your course selections have been saved for this browser. In a production launch, this step would send a confirmation email and securely collect payment." action={<Link className="button" to="/courses">Browse more classes</Link>} /></div>
  return <div className="page container"><PageTitle title="Registration cart" /><div className="page-intro"><p className="eyebrow">Your selections</p><h1>Registration cart</h1><p>Review the date, start time, end time, and location of each class before submitting your registration request.</p></div>{!items.length ? <EmptyState title="Your cart is empty" text="Choose a first-aid or BLS class and add it to your cart." action={<Link className="button" to="/courses">Browse classes</Link>} /> : <div className="cart-layout"><section className="cart-list">{items.map((course) => <article className="cart-item" key={course._id}><div><span className="course-category">{course.category}</span><h2>{course.title}</h2><p>{formatClassSchedule(course)} · {course.location} · {course.durationHours} hours</p></div><div className="cart-item-actions"><strong>${Number(course.price).toFixed(2)}</strong><button className="text-button" type="button" onClick={() => removeItem(course._id)}>Remove</button></div></article>)}</section><aside className="cart-summary"><p>Registration total</p><strong>${total.toFixed(2)} CAD</strong><span>{items.length} {items.length === 1 ? 'class' : 'classes'} selected</span><button data-cy="submit-registration" className="button" type="button" onClick={() => { clearCart(); setSubmitted(true) }}>Submit registration request</button><small>No payment is taken on this project website.</small></aside></div>}</div>
}

function CompanyAboutPage() {
  const { session } = useAuth()
  const [info, setInfo] = useState(null)
  const [form, setForm] = useState(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const isAdmin = session?.user.role === 'admin'

  useEffect(() => { api.companyInfo().then((result) => { setInfo(result); setForm(result) }).catch((e) => setError(e.message)) }, [])

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updated = await api.updateCompanyInfo(session.token, form)
      setInfo(updated)
      setForm(updated)
      setEditing(false)
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }

  if (!info || !form) return <div className="page container"><PageTitle title="About" /><Loading label="Loading company information..." /></div>
  return <div className="page container"><PageTitle title="About" /><div className="page-intro narrow"><p className="eyebrow">About {info.organizationName}</p><h1>{info.mission}</h1><p>{info.description}</p></div><section className="about-grid"><div><h2>Company information</h2><dl className="company-details"><div><dt>Serving</dt><dd>{info.serviceArea}</dd></div><div><dt>Email</dt><dd><a href={`mailto:${info.email}`}>{info.email}</a></dd></div><div><dt>Phone</dt><dd><a href={`tel:${info.phone.replace(/[^0-9+]/g, '')}`}>{info.phone}</a></dd></div></dl><h2>What this application demonstrates</h2><ul className="check-list"><li>A responsive React frontend connected to an Express and MongoDB API.</li><li>Course dates and locations that learners can filter before adding a class to their cart.</li><li>Secure sign-up, sign-in, sign-out, and protected user profile CRUD.</li><li>Administrator-only course, location, user, and company-information management.</li></ul></div><div className="about-note"><p className="eyebrow">Project note</p><p>Branding, the hero image, and the logo are original AI-generated assets created for this student project. The working name may change before a future production launch.</p>{isAdmin && <button className="button button-light" type="button" onClick={() => setEditing(!editing)}>{editing ? 'Close editor' : 'Edit company information'}</button>}</div></section>{isAdmin && editing && <section className="form-panel company-editor"><h2>Edit company information</h2><p>These fields are visible on the public About page.</p><form onSubmit={save}><label>Organization name<input required maxLength="100" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} /></label><label>Mission statement<textarea required maxLength="800" rows="3" value={form.mission} onChange={(e) => setForm({ ...form, mission: e.target.value })} /></label><label>About description<textarea required maxLength="2000" rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="form-grid"><label>Contact email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Contact phone<input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label></div><label>Service area<input required value={form.serviceArea} onChange={(e) => setForm({ ...form, serviceArea: e.target.value })} /></label><ErrorMessage error={error} /><div className="form-actions"><button className="button" disabled={saving}>{saving ? 'Saving...' : 'Save company information'}</button><button className="button button-outline" type="button" onClick={() => { setForm(info); setEditing(false) }}>Cancel</button></div></form></section>}<ErrorMessage error={error} /></div>
}

function CourseInformationPage() { return <div className="page container"><PageTitle title="Course Information" /><div className="page-intro"><p className="eyebrow">Choose your training path</p><h1>Course information</h1><p>Learn what each program covers before choosing a date and location from the booking calendar.</p></div><div className="information-path-grid"><article><span className="course-category">First aid</span><h2>Standard & Emergency First Aid</h2><p>For workplace learners, families, and community members who want practical emergency skills.</p><Link className="button" to="/course-information/first-aid">Explore first-aid courses</Link></article><article><span className="course-category">BLS</span><h2>Basic Life Support pathway</h2><p>Start with one question so the information matches your professional role and intended use.</p><Link className="button" to="/course-information/bls">Explore BLS options</Link></article></div></div> }

function FirstAidInformationPage() { return <div className="page container"><PageTitle title="First Aid Course Information" /><Link className="back-link" to="/course-information">← Course information</Link><div className="page-intro course-info-heading"><p className="eyebrow">First-aid training</p><h1>Standard and Emergency First Aid</h1><p>Both programs focus on recognizing emergencies, getting help, and practicing a safe, calm response. The correct course depends on the depth of training you need.</p></div><div className="information-detail-grid"><article><h2>Emergency First Aid</h2><p className="information-time">4 hours · $100 CAD · In class</p><p>A focused introduction for people who need essential first-aid skills for home, community, or selected workplace roles.</p><ul><li>Recognize an emergency and activate help.</li><li>Check the scene and protect yourself.</li><li>Practice core first-aid response steps with an instructor.</li><li>Build confidence to respond until trained help arrives.</li></ul><Link className="button" to="/courses?category=Emergency%20First%20Aid">Book Emergency First Aid</Link></article><article><h2>Standard First Aid</h2><p className="information-time">8 hours · $150 CAD · In class</p><p>A more comprehensive program for learners who need broader first-aid knowledge and extended hands-on practice.</p><ul><li>Includes essential emergency response principles.</li><li>More time for instructor feedback and skills practice.</li><li>Designed for workplace and community preparedness needs.</li><li>Review the scheduled location and date before booking.</li></ul><Link className="button" to="/courses?category=Standard%20First%20Aid">Book Standard First Aid</Link></article></div><section className="course-info-callout"><h2>Not sure which course is appropriate?</h2><p>Ask your employer, school, or licensing body about their accepted certification requirements, or contact LifeReady before booking.</p><Link className="text-link" to="/contact">Contact us for guidance →</Link></section></div> }

function BlsDecisionPage() { return <div className="page container"><PageTitle title="BLS Course Information" /><Link className="back-link" to="/course-information">← Course information</Link><section className="decision-panel"><p className="eyebrow">Basic Life Support</p><h1>Are you a healthcare professional?</h1><p>Choose the option that best describes the setting where you will use your BLS training. This helps us show you the most relevant course information.</p><div className="decision-actions"><Link className="button" to="/course-information/bls-hcp">Yes, show BLS for HCP</Link><div><h2>No or not sure?</h2><p>Our public First Aid courses may be a better starting point for general workplace or community preparedness.</p><Link className="button button-outline" to="/course-information/first-aid">View First Aid options</Link></div></div></section></div> }

function BlsHcpInformationPage() { return <div className="page container"><PageTitle title="Basic Life Support for HCP" /><Link className="back-link" to="/course-information/bls">← BLS eligibility question</Link><section className="bls-info"><p className="eyebrow">Healthcare pathway</p><h1>Basic Life Support for Healthcare Providers</h1><p className="lead">BLS for HCP is designed for healthcare professionals and learners whose workplace, program, or placement requires Basic Life Support training.</p><div className="detail-grid"><div><strong>Duration</strong><span>4 hours in class</span></div><div><strong>Course fee</strong><span>$80 CAD</span></div><div><strong>Format</strong><span>Instructor-led, hands-on skills practice</span></div><div><strong>Before booking</strong><span>Confirm the required credential with your employer or program.</span></div></div><h2>What you will focus on</h2><ul className="check-list"><li>High-quality CPR principles in a healthcare context.</li><li>Team communication and coordinated response.</li><li>Safe use of course equipment under instructor guidance.</li><li>Skills practice and feedback for confident performance.</li></ul><Link className="button" to="/courses?category=BLS">View BLS dates and book</Link></section></div> }

function ContactPage() {
  const [info, setInfo] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useEffect(() => { api.companyInfo().then(setInfo).catch(() => {}) }, [])
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setSubmitting(true)
    try { await api.contact(form); setSuccess('Thank you. Your message has been received and will be reviewed by our team.'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }
  return <div className="page container"><PageTitle title="Contact Us" /><div className="page-intro"><p className="eyebrow">Contact LifeReady</p><h1>Let’s talk about your training needs.</h1><p>Ask a question about a class, a Toronto or Markham date, or which program is best for you. We will respond using the email address you provide.</p></div><div className="contact-layout"><section className="contact-panel"><h2>Send us a message</h2><form onSubmit={submit} data-cy="contact-form"><div className="form-grid"><label>Full name<input required maxLength="100" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input required type="email" maxLength="120" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label></div><label>Phone number <span className="optional-label">(optional)</span><input maxLength="40" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label><label>How can we help?<select required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}><option value="">Choose a topic</option><option>Course selection</option><option>Toronto or Markham dates</option><option>Group or workplace training</option><option>Account support</option><option>Other question</option></select></label><label>Message<textarea required maxLength="4000" rows="6" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></label><ErrorMessage error={error} />{success && <p className="success-message" role="status">{success}</p>}<button data-cy="contact-submit" className="button" disabled={submitting}>{submitting ? 'Sending...' : 'Send message'}</button></form></section><aside className="contact-aside"><h2>Contact information</h2>{info ? <><p><strong>Serving</strong><span>{info.serviceArea}</span></p><p><strong>Email</strong><a href={`mailto:${info.email}`}>{info.email}</a></p><p><strong>Phone</strong><a href={`tel:${info.phone.replace(/[^0-9+]/g, '')}`}>{info.phone}</a></p></> : <Loading label="Loading contact information..." />}<div className="contact-note"><strong>Emergency notice</strong><span>Do not use this form for an emergency. Call 911 immediately for urgent, life-threatening situations.</span></div></aside></div></div>
}

function AdminMessagesPage() {
  const { session } = useAuth()
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { api.contactMessages(session.token).then(setMessages).catch((e) => setError(e.message)) }, [session.token])
  return <div className="page container"><PageTitle title="Contact Messages" /><div className="page-intro"><p className="eyebrow">Administrator workspace</p><h1>Contact messages</h1><p>Messages from the public contact form are retained here even when email delivery is not configured.</p></div><ErrorMessage error={error} />{!error && !messages.length ? <EmptyState title="No contact messages yet" text="New inquiries will appear here." /> : <div className="message-list">{messages.map((message) => <article className="message-card" key={message._id}><div className="message-card-heading"><div><h2>{message.subject}</h2><p>{message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>{message.phone ? ` · ${message.phone}` : ''}</p></div><span>{formatDate(message.createdAt)}</span></div><p>{message.message}</p><small>{message.emailDelivered ? 'Email delivered to the administrator.' : message.emailDeliveryNote}</small></article>)}</div>}</div>
}

function AuthPage({ mode }) {
  const signUpMode = mode === 'signup'
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSuccess(''); setSubmitting(true)
    try {
      if (signUpMode) {
        await api.signUp(form)
        setSuccess('Your account was created. Please sign in to continue.')
        setTimeout(() => navigate('/signin'), 800)
      } else {
        const result = await api.signIn({ email: form.email, password: form.password })
        signIn(result); navigate(result.user.role === 'admin' ? '/admin/classes' : '/')
      }
    } catch (e) { setError(e.message) } finally { setSubmitting(false) }
  }
  return <div className="auth-page"><PageTitle title={signUpMode ? 'Create account' : 'Sign in'} /><section className="auth-card"><p className="eyebrow">{signUpMode ? 'Learner account' : 'Welcome back'}</p><h1>{signUpMode ? 'Create your account' : 'Sign in to LifeReady'}</h1><p>{signUpMode ? 'Create a learner account to manage your profile.' : 'Use the account you created to access your profile.'}</p><form onSubmit={submit} data-cy={signUpMode ? 'signup-form' : 'signin-form'}>{signUpMode && <label>Full name<input data-cy="signup-name" required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>}<label>Email address<input data-cy={signUpMode ? 'signup-email' : 'signin-email'} required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>Password<input data-cy={signUpMode ? 'signup-password' : 'signin-password'} required minLength="8" type="password" autoComplete={signUpMode ? 'new-password' : 'current-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>{signUpMode && <small>Use at least 8 characters.</small>}<ErrorMessage error={error} />{success && <p className="success-message">{success}</p>}<button data-cy={signUpMode ? 'signup-submit' : 'signin-submit'} className="button full-width" disabled={submitting}>{submitting ? 'Please wait...' : signUpMode ? 'Create account' : 'Sign in'}</button></form><p className="auth-switch">{signUpMode ? 'Already have an account?' : 'New to LifeReady?'} <Link to={signUpMode ? '/signin' : '/signup'}>{signUpMode ? 'Sign in' : 'Create an account'}</Link></p></section></div>
}

function RequireAuth({ children, admin = false }) { const { session } = useAuth(); if (!session) return <Navigate to="/signin" replace />; if (admin && session.user.role !== 'admin') return <Navigate to="/" replace />; return children }

function ProfilePage() {
  const { userId } = useParams(); const { session, signIn, signOut } = useAuth(); const navigate = useNavigate()
  const [profile, setProfile] = useState(null); const [form, setForm] = useState({ name: '', email: '', password: '' }); const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => { api.user(session.token, userId).then((data) => { setProfile(data); setForm({ name: data.name, email: data.email, password: '' }) }).catch((e) => setError(e.message)) }, [session.token, userId])
  const save = async (event) => { event.preventDefault(); setError(''); setMessage(''); setSaving(true); try { const payload = { name: form.name, email: form.email }; if (form.password) payload.password = form.password; const updated = await api.updateUser(session.token, userId, payload); setProfile(updated); setForm({ name: updated.name, email: updated.email, password: '' }); if (session.user._id === userId) signIn({ ...session, user: { ...session.user, name: updated.name, email: updated.email } }); setMessage('Profile updated successfully.') } catch (e) { setError(e.message) } finally { setSaving(false) } }
  const remove = async () => { if (!window.confirm('Delete this account? This cannot be undone.')) return; try { await api.deleteUser(session.token, userId); if (session.user._id === userId) { await signOut(); navigate('/') } else navigate('/users') } catch (e) { setError(e.message) } }
  if (error && !profile) return <div className="page container"><ErrorMessage error={error} /></div>; if (!profile) return <div className="page container"><Loading label="Loading profile..." /></div>
  const isOwnProfile = session.user._id === userId
  return <div className="page container"><PageTitle title="My Profile" /><div className="profile-layout"><aside className="profile-summary"><span className="avatar" aria-hidden="true">{profile.name.charAt(0).toUpperCase()}</span><h1>{profile.name}</h1><p>{profile.email}</p><span className="role-badge">{profile.role}</span></aside><section className="form-panel"><p className="eyebrow">{isOwnProfile ? 'My profile' : 'User profile'}</p><h2>Keep your account current</h2><form onSubmit={save}><label>Full name<input required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label><label>New password <small>(leave blank to keep current password)</small><input minLength="8" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label><ErrorMessage error={error} />{message && <p className="success-message">{message}</p>}<div className="form-actions"><button className="button" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button><button type="button" className="button button-danger" onClick={remove}>Delete account</button></div></form></section></div></div>
}

const courseDefaults = {
  'Standard First Aid': { price: '150', startTime: '09:00', endTime: '17:00' },
  'Emergency First Aid': { price: '100', startTime: '09:00', endTime: '15:00' },
  'CPR/AED': { price: '80', startTime: '09:00', endTime: '13:00' },
  BLS: { price: '80', startTime: '09:00', endTime: '13:00' },
}

function ScheduleClassFormV2({ initial, locations, onSave, onCancel, saving }) {
  const defaultCategory = categories[0]
  const [form, setForm] = useState(initial || { category: defaultCategory, format: 'full', classDate: '', startTime: courseDefaults[defaultCategory].startTime, endTime: courseDefaults[defaultCategory].endTime, location: '', capacity: '16', price: courseDefaults[defaultCategory].price, status: 'scheduled' })
  const [error, setError] = useState('')
  const duration = calculateDuration(form.startTime, form.endTime)
  const changeCategory = (category) => { const defaults = courseDefaults[category]; setForm({ ...form, category, price: defaults.price, startTime: defaults.startTime, endTime: defaults.endTime }) }
  const submit = async (event) => {
    event.preventDefault(); setError('')
    if (!duration) { setError('End time must be later than start time.'); return }
    try { await onSave({ ...form, title: form.category, classDate: new Date(`${form.classDate}T12:00:00`).toISOString(), durationHours: duration, capacity: Number(form.capacity), price: Number(form.price) }) } catch (e) { setError(e.message) }
  }
  return <form className="class-form" onSubmit={submit}><div className="form-grid"><label>Course category<select value={form.category} onChange={(e) => changeCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select><small>The selected category is used automatically as the public course title and course summary.</small></label><label>Format<select value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}><option value="full">Full</option><option value="blended">Blended</option></select></label><label>Class date<input required type="date" value={form.classDate} onChange={(e) => setForm({ ...form, classDate: e.target.value })} /></label><label>Start time<input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></label><label>End time<input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></label><div className="calculated-duration"><strong>Calculated duration</strong><span>{duration ? `${duration} hours` : 'Enter a valid time range'}</span></div><label>Location<select required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} disabled={!locations.length}><option value="">{locations.length ? 'Choose a location' : 'Add a location first'}</option>{locations.map((location) => <option key={location._id} value={location.name}>{location.name}</option>)}</select><small>Manage locations from the Locations page.</small></label><label>Capacity<input required type="number" min="1" max="100" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label><label>Price (CAD)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label></div><ErrorMessage error={error} /><div className="form-actions"><button data-cy="class-save" className="button" disabled={saving || !locations.length}>{saving ? 'Saving...' : initial ? 'Update class' : 'Create class'}</button>{onCancel && <button className="button button-outline" type="button" onClick={onCancel}>Cancel</button>}</div></form>
}

function AdminClassesPageV3() {
  const { session } = useAuth()
  const [classes, setClasses] = useState([])
  const [locations, setLocations] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const load = useCallback(() => Promise.all([api.classes(), api.locations('?active=true')]).then(([classResults, locationResults]) => { setClasses(classResults); setLocations(locationResults) }).catch((e) => setError(e.message)).finally(() => setLoading(false)), [])
  useEffect(() => { load() }, [load])
  const save = async (payload) => { setSaving(true); setError(''); try { if (editing?._id) await api.updateClass(session.token, editing._id, payload); else await api.createClass(session.token, payload); setEditing(null); setLoading(true); load() } catch (e) { setError(e.message) } finally { setSaving(false) } }
  const remove = async (id) => { if (!window.confirm('Delete this class listing?')) return; try { await api.deleteClass(session.token, id); setLoading(true); load() } catch (e) { setError(e.message) } }
  const initial = editing?._id ? { ...editing, format: editing.format === 'blended' ? 'blended' : 'full', classDate: courseDateValue(editing.classDate).slice(0, 10), startTime: editing.startTime || '09:00', endTime: editing.endTime || '13:00', capacity: String(editing.capacity), price: String(editing.price) } : null
  return <div className="page container"><PageTitle title="Manage Classes" /><div className="admin-heading"><div><p className="eyebrow">Administrator workspace</p><h1>Manage training classes</h1><p>Create overlapping schedules when needed. Category automatically provides the course title and standard public summary.</p></div><button data-cy="new-class" className="button" onClick={() => setEditing({})}>Add class</button></div>{editing !== null && <section className="form-panel class-editor"><h2>{editing?._id ? 'Edit class' : 'Add a new class'}</h2><ScheduleClassFormV2 key={editing?._id || 'new'} initial={initial} locations={locations} onSave={save} onCancel={() => setEditing(null)} saving={saving} /></section>}<ErrorMessage error={error} />{loading ? <Loading label="Loading class management..." /> : classes.length ? <div className="admin-list">{classes.map((course) => <article key={course._id} className="admin-row"><div><span className="course-category">{course.category}</span><h2>{course.title}</h2><p>{formatClassSchedule(course)} · {course.location} · {course.status}</p></div><div className="row-actions"><button className="button button-outline" onClick={() => setEditing(course)}>Edit</button><button className="button button-danger" onClick={() => remove(course._id)}>Delete</button></div></article>)}</div> : <EmptyState title="No class listings yet" text="Add Toronto or Markham in Locations, then create the first course listing." action={<Link className="button button-outline" to="/admin/locations">Manage locations</Link>} />}</div>
}

function AdminLocationsPage() {
  const { session } = useAuth()
  const [locations, setLocations] = useState([])
  const [form, setForm] = useState({ name: '', address: '', isActive: true })
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const load = useCallback(() => api.locations().then(setLocations).catch((e) => setError(e.message)), [])
  useEffect(() => { load() }, [load])
  const reset = () => { setForm({ name: '', address: '', isActive: true }); setEditing(null) }
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      if (editing) await api.updateLocation(session.token, editing, form)
      else await api.createLocation(session.token, form)
      reset(); load()
    } catch (e) { setError(e.message) } finally { setSaving(false) }
  }
  const edit = (location) => { setEditing(location._id); setForm({ name: location.name, address: location.address, isActive: location.isActive }) }
  const remove = async (id) => { if (!window.confirm('Delete this location? Existing course records will not be changed.')) return; try { await api.deleteLocation(session.token, id); load() } catch (e) { setError(e.message) } }
  return <div className="page container"><PageTitle title="Locations" /><div className="admin-heading"><div><p className="eyebrow">Administrator workspace</p><h1>Manage training locations</h1><p>Learners can filter course dates by the active locations listed here.</p></div></div><section className="form-panel location-editor"><h2>{editing ? 'Edit location' : 'Add a location'}</h2><form onSubmit={save}><div className="form-grid"><label>Location name<input required maxLength="80" placeholder="Toronto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label><label>Address<input required maxLength="180" placeholder="123 Example Street, Toronto" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label></div><label className="checkbox-label"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Available for learners to filter</label><ErrorMessage error={error} /><div className="form-actions"><button data-cy="location-save" className="button" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update location' : 'Add location'}</button>{editing && <button className="button button-outline" type="button" onClick={reset}>Cancel</button>}</div></form></section><div className="admin-list">{locations.map((location) => <article className="admin-row" key={location._id}><div><span className="course-category">{location.isActive ? 'Active' : 'Inactive'}</span><h2>{location.name}</h2><p>{location.address}</p></div><div className="row-actions"><button className="button button-outline" type="button" onClick={() => edit(location)}>Edit</button><button className="button button-danger" type="button" onClick={() => remove(location._id)}>Delete</button></div></article>)}</div></div>
}

function UsersPage() { const { session } = useAuth(); const [users, setUsers] = useState([]); const [error, setError] = useState(''); useEffect(() => { api.users(session.token).then(setUsers).catch((e) => setError(e.message)) }, [session.token]); return <div className="page container"><PageTitle title="Users" /><div className="page-intro"><p className="eyebrow">Administrator workspace</p><h1>User directory</h1><p>View user accounts and open a profile to update or remove an account.</p></div><ErrorMessage error={error} />{!error && !users.length ? <Loading label="Loading users..." /> : <div className="user-table"><div className="user-row user-row-header"><span>Name</span><span>Email</span><span>Role</span><span>Action</span></div>{users.map((user) => <div className="user-row" key={user._id} data-cy="user-row"><span>{user.name}</span><span>{user.email}</span><span><span className="role-badge">{user.role}</span></span><Link className="text-link" to={`/profile/${user._id}`}>Open profile →</Link></div>)}</div>}</div> }

function NotFoundPage() { return <div className="page container"><PageTitle title="Page not found" /><EmptyState title="That page could not be found" text="Return to the home page to continue exploring LifeReady Training." action={<Link className="button" to="/">Go home</Link>} /></div> }

function AppRoutes() { return <Layout><Routes><Route path="/" element={<HomePage />} /><Route path="/courses" element={<CoursesPageV3 />} /><Route path="/courses/:classId" element={<CourseDetailsScheduleWithCart />} /><Route path="/course-information" element={<CourseInformationPage />} /><Route path="/course-information/first-aid" element={<FirstAidInformationPage />} /><Route path="/course-information/bls" element={<BlsDecisionPage />} /><Route path="/course-information/bls-hcp" element={<BlsHcpInformationPage />} /><Route path="/first-aid-guide" element={<FirstAidGuidePage />} /><Route path="/about" element={<CompanyAboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/signup" element={<AuthPage mode="signup" />} /><Route path="/signin" element={<AuthPage mode="signin" />} /><Route path="/profile/:userId" element={<RequireAuth><ProfilePage /></RequireAuth>} /><Route path="/users" element={<RequireAuth admin><UsersPage /></RequireAuth>} /><Route path="/admin/classes" element={<RequireAuth admin><AdminClassesPageV3 /></RequireAuth>} /><Route path="/admin/locations" element={<RequireAuth admin><AdminLocationsPage /></RequireAuth>} /><Route path="/admin/messages" element={<RequireAuth admin><AdminMessagesPage /></RequireAuth>} /><Route path="/cart" element={<RequireAuth><CartPageSchedule /></RequireAuth>} /><Route path="*" element={<NotFoundPage />} /></Routes></Layout> }

export default function App() { return <BrowserRouter><AuthProvider><CartProvider><AppRoutes /></CartProvider></AuthProvider></BrowserRouter> }
