export const Status = {
  Pending: 'Pending',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Out: 'Out',
  Returned: 'Returned',
}

export function statusClass(s) {
  switch (s) {
    case Status.Pending:
      return 'bg-amber-100 text-amber-800 ring-amber-500'
    case Status.Approved:
      return 'bg-emerald-100 text-emerald-800 ring-emerald-500'
    case Status.Rejected:
      return 'bg-rose-100 text-rose-800 ring-rose-500'
    case Status.Out:
      return 'bg-rose-100 text-rose-800 ring-rose-500'
    case Status.Returned:
      return 'bg-emerald-100 text-emerald-800 ring-emerald-500'
    default:
      return 'bg-gray-100 text-gray-800 ring-gray-400'
  }
}
