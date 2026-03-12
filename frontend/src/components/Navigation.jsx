export default function Navigation({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'resume', label: '📄 Resume' },
    { id: 'recommendations', label: '🎯 Top Matches' },
    { id: 'jobs', label: '📋 All Jobs' },
    { id: 'apply', label: '✅ Add Application' },
  ]

  return (
    <nav className="bg-white shadow sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">🚀 Internship Tracker</h1>
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  currentTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
