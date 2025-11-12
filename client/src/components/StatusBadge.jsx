import PropTypes from 'prop-types'
import { statusClass } from '../lib/status'

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(status)}`}>
      {status}
    </span>
  )
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
}
