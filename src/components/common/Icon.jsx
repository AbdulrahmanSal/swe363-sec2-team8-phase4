/**
 * Line icons used across the app (from Ibrahim's admin module, extended for the other workspaces).
 * <Icon name="store" size={18} />  — decorative: always next to a text label, so hidden from screen readers.
 */
const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  store: 'M3 10l2-6h14l2 6 M4 10v10h16V10 M9 20v-7h6v7 M2 10c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0',
  news: 'M4 3h13v18H4z M17 8h4v11c0 3-4 3-4 0 M7 7h7 M7 11h7 M7 15h7',
  users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 3a4 4 0 110 8 4 4 0 010-8 M17 3a4 4 0 010 8 M22 21v-2a4 4 0 00-3-3.9',
  user: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 110 8 4 4 0 010-8',
  calendar: 'M4 5h16v16H4z M8 2v6 M16 2v6 M4 11h16 M8 15l3 3 5-5',
  tag: 'M3 3h8l10 10-8 8L3 11z M7 7h.01',
  box: 'M21 8l-9-5-9 5v8l9 5 9-5z M3 8l9 5 9-5 M12 13v8',
  list: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01',
  folder: 'M3 6h6l2 2h10v12H3z',
  search: 'M21 21l-5-5 M10 3a7 7 0 110 14 7 7 0 010-14',
  plus: 'M12 5v14 M5 12h14',
  chevron: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  close: 'M6 6l12 12 M6 18L18 6',
  check: 'M5 12l4 4L19 6',
  arrow: 'M7 17L17 7 M7 7h10v10',
  clock: 'M12 3a9 9 0 110 18 9 9 0 010-18 M12 7v5l3 2',
  login: 'M15 5h5v14h-5 M11 8l4 4-4 4 M3 12h12',
  logout: 'M9 5H4v14h5 M13 8l4 4-4 4 M8 12h13',
  screens: 'M3 4h18v12H3z M8 20h8 M12 16v4',
}

export default function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  )
}
