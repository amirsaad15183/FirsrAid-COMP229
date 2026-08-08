import Location from '../models/location.model.js'
import errorHandler from '../helpers/dbErrorHandler.js'

const locationByID = async (req, res, next, id) => {
  try {
    const location = await Location.findById(id)
    if (!location) return res.status(404).json({ error: 'Location not found.' })
    req.location = location
    return next()
  } catch {
    return res.status(400).json({ error: 'Could not retrieve the location.' })
  }
}

const list = async (req, res) => {
  try {
    const filter = req.query.active === 'true' ? { isActive: true } : {}
    const locations = await Location.find(filter).sort({ name: 1 })
    return res.json(locations)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const create = async (req, res) => {
  try {
    const location = new Location({ ...req.body, createdBy: req.auth._id })
    await location.save()
    return res.status(201).json(location)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const update = async (req, res) => {
  try {
    ;['name', 'address', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) req.location[field] = req.body[field]
    })
    await req.location.save()
    return res.json(req.location)
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

const remove = async (req, res) => {
  try {
    await req.location.deleteOne()
    return res.json({ message: 'Location deleted successfully.' })
  } catch (error) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(error) })
  }
}

export default { locationByID, list, create, update, remove }
