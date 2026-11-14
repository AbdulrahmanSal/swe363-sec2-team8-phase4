import { ms } from './format.js'
export const isActiveOffer = (offer, now = Date.now()) => !offer.removed && ms(offer.start) <= now && ms(offer.end) > now
/** VIS01: only visible content; dates are parsed as Riyadh time by ms(). */
export function getFeedItems(data, now = Date.now()) {
  const activeBusiness = id => data.vendors.some(vendor => vendor.id === id && vendor.status === 'Active')
  return [
    ...data.announcements.filter(item => !item.removed && ms(item.publication) <= now).map(item => ({ ...item, kind: 'Announcements', text: item.message, date: item.publication })),
    ...data.matches.filter(item => !item.removed && ms(item.publication) <= now && ms(item.start) > now).map(item => ({ ...item, kind: 'Matches', title: `${item.team1} vs ${item.team2}`, text: `Showing at ${item.location}`, date: item.start })),
    ...data.events.filter(item => !item.removed && item.status === 'Approved' && ms(item.end) > now).map(item => ({ ...item, kind: 'Club events', text: item.description, date: item.start })),
    ...data.offers.filter(item => isActiveOffer(item, now) && activeBusiness(item.vendorId)).map(item => ({ ...item, kind: 'Offers', text: item.description, date: item.start })),
  ].sort((left, right) => ms(right.date) - ms(left.date))
}
