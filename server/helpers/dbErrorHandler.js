const getUniqueErrorMessage = (error) => {
  try {
    const fieldName = error.message
      .substring(error.message.lastIndexOf('.$') + 2, error.message.lastIndexOf('_1'))
    return `${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)} already exists`
  } catch {
    return 'A record with this value already exists.'
  }
}

const getErrorMessage = (error) => {
  if (error?.code === 11000 || error?.code === 11001) {
    return getUniqueErrorMessage(error)
  }

  if (error?.errors) {
    const firstError = Object.values(error.errors).find((item) => item.message)
    if (firstError) return firstError.message
  }

  return error?.message || 'Something went wrong.'
}

export default { getErrorMessage }
