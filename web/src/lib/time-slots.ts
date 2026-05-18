export const DAYS: Record<number, string> = {
  0: 'Su', 1: 'Mo', 2: 'Tu', 3: 'We', 4: 'Th', 5: 'Fr', 6: 'Sa',
}

export const DAYS_FULL: Record<number, string> = {
  0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday',
  4: 'Thursday', 5: 'Friday', 6: 'Saturday',
}

export function formatTime(hour: number, minute: number): string {
  return `${hour}:${minute === 0 ? '00' : '30'}`
}

export function getTimeKey(day: number, hour: number, minute: number): string {
  return `${DAYS[day]}-${hour}-${minute}`
}

export function getHours(startTime: number, endTime: number): number[] {
  if (endTime > startTime) {
    return Array.from({ length: endTime - startTime + 1 }, (_, i) => startTime + i)
  }
  // Overnight
  const first = Array.from({ length: 24 - startTime }, (_, i) => startTime + i)
  const second = Array.from({ length: endTime + 1 }, (_, i) => i)
  return [...first, ...second]
}

export function getRatingColor(rating: number): string {
  if (rating === 1) return 'bg-green-500'
  if (rating === 0.5) return 'bg-amber-500'
  return ''
}

export function getRatingColorHex(rating: number): string {
  if (rating === 1) return '#22c55e'
  if (rating === 0.5) return '#f59e0b'
  return 'transparent'
}
