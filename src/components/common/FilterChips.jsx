export default function FilterChips({ options = [], value, onChange, label = 'Filter content' }) {
  return <div className="chips" role="group" aria-label={label}>{options.map(option => {
    const item = typeof option === 'string' ? { value: option, label: option } : option
    return <button key={item.value} type="button" className={`chip ${value === item.value ? 'selected' : ''}`} aria-pressed={value === item.value} onClick={() => onChange(item.value)}>{item.label}</button>
  })}</div>
}
