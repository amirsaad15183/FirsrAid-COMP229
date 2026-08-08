import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CourseCard } from './App'
import { calculateDuration } from './lib/courseSchedule'

describe('CourseCard', () => {
  const trainingClass = {
    _id: 'standard-first-aid-1',
    title: 'Standard First Aid',
    category: 'Standard First Aid',
    format: 'full',
    classDate: '2026-09-15T12:00:00.000Z',
    startTime: '09:00',
    endTime: '17:00',
    location: 'Toronto',
    durationHours: 8,
    price: 150,
  }

  it('shows the course information and links to its booking details', () => {
    render(<MemoryRouter><CourseCard course={trainingClass} /></MemoryRouter>)

    expect(screen.getByRole('heading', { name: 'Standard First Aid' })).toBeInTheDocument()
    expect(screen.getByText('Toronto')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view course/i })).toHaveAttribute('href', '/courses/standard-first-aid-1')
  })
})

describe('calculateDuration', () => {
  it('calculates the number of scheduled training hours', () => {
    expect(calculateDuration('09:00', '17:00')).toBe(8)
    expect(calculateDuration('09:00', '15:00')).toBe(6)
  })

  it('rejects an end time that is not later than the start time', () => {
    expect(calculateDuration('13:00', '13:00')).toBeNull()
    expect(calculateDuration('15:00', '09:00')).toBeNull()
  })
})
