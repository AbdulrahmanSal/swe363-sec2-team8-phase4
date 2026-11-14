import { Link } from 'react-router-dom'
import Modal from './Modal.jsx'
export default function SuccessModal({ open = true, title = 'Request submitted', message, onClose, detailsTo, onViewDetails, children }) {
  return <Modal open={open} title={title} onClose={onClose} actions={<><button type="button" onClick={onClose}>Close</button>{detailsTo ? <Link className="button primary" to={detailsTo} onClick={onClose}>View details</Link> : onViewDetails && <button type="button" className="primary" onClick={onViewDetails}>View details</button>}</>}>
    <div className="confirmicon" aria-hidden="true">✓</div><p role="status">{message}</p>{children}
  </Modal>
}
