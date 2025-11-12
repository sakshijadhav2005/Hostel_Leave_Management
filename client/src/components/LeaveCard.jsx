import PropTypes from 'prop-types'
import StatusBadge from './StatusBadge'

export default function LeaveCard({ title, fields, status, actions }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl border border-amber-200 rounded-2xl shadow-2xl shadow-amber-500/10 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-amber-950">{title}</h3>
          <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {fields.map(([label, value]) => (
              <div key={label} className="col-span-1">
                <dt className="text-amber-900/80">{label}</dt>
                <dd className="font-medium text-amber-950 break-words">{value ?? '-'}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
        </div>
      </div>
      {actions?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

LeaveCard.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(PropTypes.array).isRequired,
  status: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(PropTypes.node),
}

