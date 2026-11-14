import { useId } from 'react'

/** Input/select/textarea with an associated label and accessible inline feedback. */
export default function FormField({ label, error, help, as, type = 'text', children, options, id: suppliedId, className = '', ...props }) {
  const generated = useId()
  const id = suppliedId || `field-${generated}`
  const Component = as || (type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : 'input')
  const describedBy = [help && `${id}-help`, error && `${id}-error`, props['aria-describedby']].filter(Boolean).join(' ') || undefined
  const inputProps = { ...props, id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy }
  if (Component === 'input') inputProps.type = type
  return <label htmlFor={id} className={className}>{label}
    <Component {...inputProps}>{Component !== 'input' ? (children || options?.map(option => {
      const value = typeof option === 'object' ? option.value : option
      return <option key={value} value={value}>{typeof option === 'object' ? option.label : option}</option>
    })) : undefined}</Component>
    {help && <small id={`${id}-help`}>{help}</small>}
    {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
  </label>
}
