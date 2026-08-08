import ContactMessage from '../models/contactMessage.model.js'
import CompanyInfo from '../models/companyInfo.model.js'
import User from '../models/user.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const sendWithResend = async ({ to, replyTo, subject, text }) => {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from || !to) return { delivered: false, note: 'Saved in the administrator inbox; email delivery is not configured yet.' }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
  })
  if (!response.ok) return { delivered: false, note: 'Saved in the administrator inbox; email delivery needs attention.' }
  return { delivered: true, note: 'Delivered to the administrator email.' }
}

const create = async (req, res) => {
  try {
    const contactMessage = new ContactMessage(req.body)
    await contactMessage.save()

    const [companyInfo, admin] = await Promise.all([
      CompanyInfo.findOne().sort({ updatedAt: -1 }),
      User.findOne({ role: 'admin' }).sort({ createdAt: 1 }),
    ])
    const adminEmail = process.env.CONTACT_ADMIN_EMAIL || admin?.email || companyInfo?.email
    const delivery = await sendWithResend({
      to: adminEmail,
      replyTo: contactMessage.email,
      subject: `LifeReady contact: ${contactMessage.subject}`,
      text: `Name: ${contactMessage.name}\nEmail: ${contactMessage.email}\nPhone: ${contactMessage.phone || 'Not provided'}\n\n${contactMessage.message}`,
    })
    contactMessage.emailDelivered = delivery.delivered
    contactMessage.emailDeliveryNote = delivery.note
    await contactMessage.save()
    return res.status(201).json({ message: 'Thank you. Your message has been received.', delivery: delivery.delivered ? 'sent' : 'saved' })
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const list = async (req, res) => {
  try {
    return res.json(await ContactMessage.find().sort({ createdAt: -1 }))
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

export default { create, list }
