import TrainingClass from '../models/trainingClass.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

// Training-class controller contains the project-specific CRUD rules for scheduled courses.
const courseDescriptions = {
  'Standard First Aid': 'Comprehensive in-class Standard First Aid training for workplace and community learners.',
  'Emergency First Aid': 'Focused in-class Emergency First Aid training for essential emergency response skills.',
  'CPR/AED': 'Practical CPR/AED training with instructor-led skills practice.',
  BLS: 'Instructor-led Basic Life Support training for healthcare professionals and learners.',
}

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
    // The selected category is the public course title, so listings stay consistent.
    const trainingClass = new TrainingClass({
      ...req.body,
      title: req.body.category,
      description: courseDescriptions[req.body.category],
      instructor: 'LifeReady Training Team',
      createdBy: req.auth._id,
    })
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
    if (req.query.location) filter.location = req.query.location
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
    const allowedFields = ['category', 'format', 'classDate', 'startTime', 'endTime', 'durationHours', 'location', 'capacity', 'price', 'status']
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) req.trainingClass[field] = req.body[field]
    })
    req.trainingClass.title = req.trainingClass.category
    // The category owns these details; the admin only schedules the class.
    req.trainingClass.description = courseDescriptions[req.trainingClass.category]
    req.trainingClass.instructor = 'LifeReady Training Team'
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
