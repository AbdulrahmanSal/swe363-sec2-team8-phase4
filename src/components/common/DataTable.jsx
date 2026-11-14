import EmptyState from './EmptyState.jsx'
/** columns: [{key, label, render?: (row) => ReactNode}], rows: records. */
export default function DataTable({ columns = [], rows, data, rowKey = 'id', caption, emptyTitle = 'No records found', emptyMessage = 'There are no records to display.' }) {
  const records = rows || data || []
  if (!records.length) return <EmptyState title={emptyTitle} message={emptyMessage} />
  return <div className="tablewrap responsive-table"><table>
    {caption && <caption className="visuallyhidden">{caption}</caption>}
    <thead><tr>{columns.map(column => <th key={column.key} scope="col">{column.label || column.header}</th>)}</tr></thead>
    <tbody>{records.map((row, index) => <tr key={typeof rowKey === 'function' ? rowKey(row) : row[rowKey] ?? index}>{columns.map(column => <td key={column.key} data-label={column.label || column.header}>{column.render ? column.render(row) : row[column.key]}</td>)}</tr>)}</tbody>
  </table></div>
}
