import CompanyInfo from '../models/companyInfo.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const defaults = {
  organizationName: 'LifeReady Training',
  mission: 'Help people build calm, practical first-aid confidence before an emergency happens.',
  description: 'LifeReady Training is a student project website for first-aid, CPR/AED, and Basic Life Support course management. Replace this placeholder information before any public business launch.',
  email: 'info@lifeready.example',
  phone: '(000) 000-0000',
  serviceArea: 'Toronto and Markham, Ontario',
}

const read = async (req, res) => {
  try {
    const companyInfo = await CompanyInfo.findOne().sort({ updatedAt: -1 })
    return res.json(companyInfo || defaults)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const update = async (req, res) => {
  try {
    const allowed = ['organizationName', 'mission', 'description', 'email', 'phone', 'serviceArea']
    const values = allowed.reduce((result, field) => {
      if (req.body[field] !== undefined) result[field] = req.body[field]
      return result
    }, {})
    const companyInfo = await CompanyInfo.findOneAndUpdate(
      {},
      { $set: { ...values, updatedBy: req.auth._id } },
      { new: true, upsert: true, runValidators: true },
    )
    return res.json(companyInfo)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

export default { read, update }
