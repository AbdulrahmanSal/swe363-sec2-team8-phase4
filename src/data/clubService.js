/**
 * Club event submissions (VIS08). Plain function like requestService.js; DataContext wraps it.
 * Returns { ok: true, data, request: event } or { ok: false, errors: { field: message } }.
 */
import { stamp, ms, uid } from '../utils/format.js'
import { isBlank } from '../utils/validation.js'

/** VIS08 — a club representative submits an event for their assigned club; it waits for admin review. */
export function submitClubEvent(data, { user, title, description, location, startAt, endAt }, now = Date.now()) {
  if (!user || user.role !== 'visitor') return { ok: false, errors: { form: 'Only visitor accounts can submit club events.' } }
  // The club comes from the account, never from the form: a representative cannot pick another club.
  if (!user.club) {
    return { ok: false, errors: { form: 'You do not have club representative permission. An administrator must assign it first.' } }
  }

  const errors = {}
  if (isBlank(title)) errors.title = 'Enter the event title.'
  else if (title.trim().length > 100) errors.title = 'Keep the title under 100 characters.'
  if (isBlank(description)) errors.description = 'Describe the event.'
  else if (description.trim().length > 1000) errors.description = 'Keep the description under 1000 characters.'
  if (isBlank(location)) errors.location = 'Enter where in the mall the event takes place.'
  if (!startAt) errors.startAt = 'Choose the start date and time.'
  else if (!(ms(startAt) > now)) errors.startAt = 'The event must start in the future.'
  if (!endAt) errors.endAt = 'Choose the end date and time.'
  else if (startAt && !(ms(endAt) > ms(startAt))) errors.endAt = 'The end time must be after the start time.'
  if (Object.keys(errors).length) return { ok: false, errors }

  const event = {
    id: uid('e'),
    club: user.club,
    submittedBy: user.id,
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
    startAt,
    endAt,
    status: 'pending',
    rejectReason: '',
    createdAt: stamp(now),
  }
  const entry = { id: uid('act'), at: stamp(now), actor: user.name, text: `${user.club} submitted "${event.title}" for review` }
  return {
    ok: true,
    data: { ...data, events: [event, ...data.events], activity: [entry, ...data.activity].slice(0, 100) },
    request: event,
  }
}
