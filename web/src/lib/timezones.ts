export function formatTimezone(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'short' })
    const parts = formatter.formatToParts(now)
    const tz = parts.find(p => p.type === 'timeZoneName')
    if (tz && !tz.value.includes('GMT') && !tz.value.includes('UTC')) return tz.value
  } catch { /* fallback */ }
  const parts = timezone.split('/')
  return parts[parts.length - 1].replace(/_/g, ' ')
}

export function convertTimeToDisplayTimezone(
  pollHour: number, pollMinute: number,
  _pollTimezone: string, displayTimezone: string,
): { hour: number; minute: number } {
  try {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pollHour, pollMinute, 0)
    const display = new Date(d.toLocaleString('en-US', { timeZone: displayTimezone }))
    return { hour: display.getHours(), minute: display.getMinutes() }
  } catch {
    return { hour: pollHour, minute: pollMinute }
  }
}

export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Anchorage', 'America/Honolulu', 'America/Toronto', 'America/Vancouver',
  'America/Mexico_City', 'America/Sao_Paulo', 'America/Buenos_Aires',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
  'Europe/Moscow', 'Europe/Amsterdam', 'Europe/Stockholm', 'Europe/Helsinki',
  'Europe/Athens', 'Europe/Madrid', 'Europe/Lisbon',
  'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai',
  'Asia/Kolkata', 'Asia/Seoul', 'Asia/Bangkok', 'Asia/Ho_Chi_Minh',
  'Asia/Manila', 'Asia/Jakarta', 'Asia/Hong_Kong', 'Asia/Taipei',
  'Asia/Tehran', 'Asia/Jerusalem',
  'Australia/Sydney', 'Australia/Perth', 'Australia/Melbourne',
  'Pacific/Auckland', 'Pacific/Fiji',
  'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
]

export function getTimezoneLabel(tz: string): string {
  try {
    const now = new Date()
    const f = new Intl.DateTimeFormat('en', { timeZone: tz, timeZoneName: 'short' })
    const parts = f.formatToParts(now)
    const abbr = parts.find(p => p.type === 'timeZoneName')?.value ?? ''
    return `${tz.replace(/_/g, ' ')} (${abbr})`
  } catch {
    return tz
  }
}
