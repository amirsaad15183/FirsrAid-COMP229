// Returns the duration in hours only when a class ends after it starts.
export function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return null
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute)
  return minutes > 0 ? minutes / 60 : null
}
