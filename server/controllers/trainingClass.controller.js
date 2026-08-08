import TrainingClass from '../models/trainingClass.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const classByID = async (req, res, next, id) => {
  try {
    // Load the requested record once so later route handlers can reuse it.
    const trainingClass = await TrainingClass.findById(id).populate('createdBy', 'name email')
    if (!trainingClass) return res.status(404).json({ error: 'Training class not found.' })
    req.trainingClass = trainingClass
    return next()
  } catch (error) {
    return res.status(400).json({ error: 'Could not retrieve the training class.' })
  }
}

const create = async (req, res) => {
  try {
    const trainingClass = new TrainingClass({ ...req.body, createdBy: req.auth._id })
    await trainingClass.save()
    return res.status(201).json(trainingClass)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const list = async (req, res) => {
  try {
    const filter = {}
    if (req.query.category) filter.category = req.query.category
    if (req.query.status) filter.status = req.query.status
    const classes = await TrainingClass.find(filter).populate('createdBy', 'name').sort({ classDate: 1 })
    return res.json(classes)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const read = (req, res) => res.json(req.trainingClass)

const update = async (req, res) => {
  try {
    // Restrict updates to planned class fields and protect creator/audit data.
    const allowedFields = ['title', 'category', 'format', 'description', 'classDate', 'durationHours', 'location', 'capacity', 'price', 'instructor', 'status']
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.trainingClass[field] = req.body[field]
    })
    await req.trainingClass.save()
    return res.json(req.trainingClass)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const remove = async (req, res) => {
  try {
    await req.trainingClass.deleteOne()
    return res.json({ message: 'Training class deleted successfully.' })
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

export default { classByID, create, list, read, update, remove }
