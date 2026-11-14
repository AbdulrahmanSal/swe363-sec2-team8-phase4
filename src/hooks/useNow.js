import { useEffect, useState } from 'react'
/** Keep scheduled/expired content current while the screen stays open. */
export default function useNow() {
  const [now, setNow] = useState(Date.now)
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer) }, [])
  return now
}
