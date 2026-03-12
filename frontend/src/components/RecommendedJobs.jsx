import { useState, useEffect } from 'react'

export default function RecommendedJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      const res = await fetch('/api/jobs/recommended?limit=15')
      const data = await res.json()
      setJobs(data)
    } catch (err) {
      console.error('Failed to fetch recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-blue-100 text-blue-800'
    if (score >= 40) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return <div className="text-center py-8">Loading recommendations...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Top Job Matches</h2>

      {jobs.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg">
          <p className="text-gray-500">Upload your resume to get personalized job recommendations</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-gray-600 font-medium">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
                <div className="text-right">
                  {job.match_score && (
                    <div className={`px-3 py-1 rounded-full font-bold ${getMatchColor(job.match_score)}`}>
                      {job.match_score}% Match
                    </div>
                  )}
                  {job.salary && (
                    <p className="text-green-600 font-medium text-sm mt-2">{job.salary}</p>
                  )}
                </div>
              </div>

              {job.description && (
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">{job.description}</p>
              )}

              <div className="flex gap-2">
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center text-sm"
                >
                  View Job
                </a>
                <button
                  onClick={() => window.location.hash = 'apply'}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={fetchRecommendations}
        className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        Refresh Recommendations
      </button>
    </div>
  )
}
