import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
const ToastContext = createContext(null)
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)
  const toast = useCallback((text) => { clearTimeout(timer.current); setMessage(text); timer.current = setTimeout(() => setMessage(''), 4500) }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  return <ToastContext.Provider value={toast}>{children}<Toast message={message} /></ToastContext.Provider>
}
export default function Toast({ message }) { return <div role="status" aria-live="polite" aria-atomic="true">{message && <div className="toast">{message}</div>}</div> }
// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const toast = useContext(ToastContext)
  if (!toast) throw new Error('useToast() must be used inside ToastProvider')
  return toast
}
