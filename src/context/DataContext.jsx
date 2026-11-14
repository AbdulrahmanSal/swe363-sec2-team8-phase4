/**
 * App data (T06): every collection from mockData.js, saved in the browser so changes survive a refresh.
 *
 *   const { data, add, update, remove, setCollection, logActivity, resetDemo,
 *           placeOrder, bookAppointment, rescheduleAppointment, requestLaundry, changeRequestStatus,
 *           submitClubEvent } = useData()
 *
 * Generic actions (use these for your own screens instead of editing this file):
 *   add('offers', { id: uid('f'), ... })            adds a record to the start of a collection
 *   update('vendors', 'v1', { isOpen: false })        merges changes into the record with that id
 *   remove('offerings', 'o3')                         deletes the record (prefer a `removed` flag where history matters)
 *   setCollection('users', (list) => ...)             replace a whole collection in one step
 *   logActivity('Vendor New Snack Corner approved', user.name)  shows on the admin dashboard
 *
 * Request actions take the signed-in user and return { ok: true, request } or { ok: false, errors }.
 * submitClubEvent({ user, title, description, location, startAt, endAt }) works the same way (request = the event).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { createSeedData } from '../data/mockData.js'
import * as requestService from '../data/requestService.js'
import { submitClubEvent } from '../data/clubService.js'
import { stamp, uid } from '../utils/format.js'

const STORAGE_KEY = 'mallhub-demo'

const DataContext = createContext(null)

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    // Saved data from an older version of the data shapes is discarded.
    if (saved && saved.version === createSeedData().version) return saved
  } catch {
    // Storage blocked or corrupted: fall back to fresh demo data.
  }
  return createSeedData()
}

export function DataProvider({ children }) {
  const [data, setData] = useState(loadData)

  // Always-current copy, so actions called right after one another see each other's changes.
  const dataRef = useRef(data)
  const commit = useCallback((next) => {
    dataRef.current = next
    setData(next)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Private mode or full storage: the demo still works, changes just reset on refresh.
    }
  }, [data])

  const setCollection = useCallback(
    (name, updater) => {
      const current = dataRef.current
      commit({ ...current, [name]: typeof updater === 'function' ? updater(current[name]) : updater })
    },
    [commit],
  )

  const add = useCallback((name, record) => setCollection(name, (list) => [record, ...list]), [setCollection])

  const update = useCallback(
    (name, id, changes) => setCollection(name, (list) => list.map((r) => (r.id === id ? { ...r, ...changes } : r))),
    [setCollection],
  )

  const remove = useCallback((name, id) => setCollection(name, (list) => list.filter((r) => r.id !== id)), [setCollection])

  const logActivity = useCallback(
    (text, actor = 'System') =>
      setCollection('activity', (list) => [{ id: uid('act'), at: stamp(), actor, text }, ...list].slice(0, 100)),
    [setCollection],
  )

  const resetDemo = useCallback(() => commit(createSeedData()), [commit])

  /** Wrap a requestService function: run it on the latest data and save the result when it succeeds. */
  const run = useCallback(
    (fn) => (input) => {
      const result = fn(dataRef.current, input)
      if (result.ok) commit(result.data)
      return result.ok ? { ok: true, request: result.request } : result
    },
    [commit],
  )

  const value = useMemo(
    () => ({
      data,
      add,
      update,
      remove,
      setCollection,
      logActivity,
      resetDemo,
      placeOrder: run(requestService.placeOrder),
      bookAppointment: run(requestService.bookAppointment),
      rescheduleAppointment: run(requestService.rescheduleAppointment),
      requestLaundry: run(requestService.requestLaundry),
      changeRequestStatus: run(requestService.changeRequestStatus),
      submitClubEvent: run(submitClubEvent),
    }),
    [data, add, update, remove, setCollection, logActivity, resetDemo, run],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData() must be used inside <DataProvider>')
  return ctx
}
