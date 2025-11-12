import PropTypes from 'prop-types'

export default function Shell({ header, secondary, children }) {
  return (
    <div className="min-h-dvh bg-gray-50">
      <header className="border-b bg-white sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {header}
          <div className="sm:hidden">
            <a href="/student" className="text-sm text-gray-600 mr-3">Student</a>
            <a href="/rector" className="text-sm text-gray-600">Rector</a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid gap-6 xl:grid-cols-[61.8%_38.2%]">
          <section aria-label="Primary content" className="space-y-6">
            {children}
          </section>
          <aside aria-label="Secondary panel" className="space-y-6">
            {secondary}
          </aside>
        </div>
      </main>
    </div>
  )
}

Shell.propTypes = {
  header: PropTypes.node,
  secondary: PropTypes.node,
  children: PropTypes.node,
}
