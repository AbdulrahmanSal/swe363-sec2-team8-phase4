import { ms } from './format.js'
export const isActiveOffer = (offer, now = Date.now()) => !offer.removed && ms(offer.startAt) <= now && ms(offer.endAt) > now
/**
 * VIS01: only visible content. Each item gets the same display fields
 * (kind, title, text, date, plus publication/start/end for the detail dialog) whatever its type.
 */
export function getFeedItems(data, now = Date.now()) {
  const activeBusiness = id => data.vendors.some(vendor => vendor.id === id && vendor.accountStatus === 'active')
  return [
    ...data.announcements.filter(item => !item.removed && ms(item.publishAt) <= now).map(item => ({ ...item, kind: 'Announcements', text: item.message, date: item.publishAt, publication: item.publishAt })),
    ...data.matches.filter(item => !item.removed && ms(item.publishAt) <= now && ms(item.matchAt) > now).map(item => ({ ...item, kind: 'Matches', title: `${item.teamA} vs ${item.teamB}`, text: `Showing at ${item.location}`, date: item.matchAt, start: item.matchAt })),
    ...data.events.filter(item => !item.removed && item.status === 'approved' && ms(item.endAt) > now).map(item => ({ ...item, kind: 'Club events', text: item.description, date: item.startAt, start: item.startAt, end: item.endAt })),
    ...data.offers.filter(item => isActiveOffer(item, now) && activeBusiness(item.vendorId)).map(item => ({ ...item, kind: 'Offers', text: item.description, date: item.startAt, start: item.startAt, end: item.endAt })),
  ].sort((left, right) => ms(right.date) - ms(left.date))
}
