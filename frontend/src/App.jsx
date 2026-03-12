import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import JobFeed from './components/JobFeed'
import ApplicationForm from './components/ApplicationForm'
import ResumeUpload from './components/ResumeUpload'
import RecommendedJobs from './components/RecommendedJobs'
import Navigation from './components/Navigation'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchApplications()
    fetchStats()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications')
      const data = await res.json()
      setApplications(data)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleNewApplication = () => {
    fetchApplications()
    fetchStats()
    setCurrentTab('dashboard')
  }

  const handleResumeUploaded = () => {
    // Switch to recommendations after resume is uploaded
    setTimeout(() => setCurrentTab('recommendations'), 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentTab === 'dashboard' && (
          <Dashboard applications={applications} stats={stats} onRefresh={fetchApplications} />
        )}
        {currentTab === 'resume' && (
          <ResumeUpload onResumeUploaded={handleResumeUploaded} />
        )}
        {currentTab === 'recommendations' && (
          <RecommendedJobs />
        )}
        {currentTab === 'jobs' && (
          <JobFeed onApplicationAdded={handleNewApplication} />
        )}
        {currentTab === 'apply' && (
          <ApplicationForm onApplicationAdded={handleNewApplication} />
        )}
      </main>
    </div>
  )
}

export default App
