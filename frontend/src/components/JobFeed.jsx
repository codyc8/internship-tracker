import { useState, useEffect } from 'react'

export default function JobFeed({ onApplicationAdded }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      setJobs(data)
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsSeen = async (jobId) => {
    try {
      await fetch(`/api/jobs/${jobId}/seen`, { method: 'POST' })
      setJobs(jobs.filter(j => j.id !== jobId))
    } catch (err) {
      console.error('Failed to mark as seen:', err)
    }
  }

  const quickApply = async (job) => {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: job.company,
          role: job.title,
          status: 'applied',
          notes: `Source: ${job.source}, URL: ${job.url}`
        })
      })

      if (!res.ok) throw new Error('Failed to save application')

      markAsSeen(job.id)
      onApplicationAdded()
    } catch (err) {
      console.error('Failed to apply:', err)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading jobs...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Job Listings</h2>

      {jobs.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">No new jobs yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600">{job.company}</p>
                  {job.location && <p className="text-sm text-gray-500">{job.location}</p>}
                </div>
                {job.salary && <span className="text-green-600 font-medium">{job.salary}</span>}
              </div>

              {job.description && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{job.description}</p>
              )}

              <div className="flex gap-3">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center text-sm"
                >
                  View Job
                </a>
                <button
                  onClick={() => quickApply(job)}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Quick Apply
                </button>
                <button
                  onClick={() => markAsSeen(job.id)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
