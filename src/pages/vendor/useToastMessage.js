import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Short "saved" message for the bottom of the screen.
 *   const [toast, showToast] = useToastMessage()
 *   showToast('Business profile saved.')   then render <Toast message={toast} />
 */
export default function useToastMessage(duration = 4000) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const show = useCallback(
    (text) => {
      clearTimeout(timer.current)
      setMessage(text)
      timer.current = setTimeout(() => setMessage(''), duration)
    },
    [duration],
  )

  useEffect(() => () => clearTimeout(timer.current), [])

  return [message, show]
}
