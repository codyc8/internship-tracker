import { useState } from 'react'

export default function ResumeUpload({ onResumeUploaded }) {
  const [resumeText, setResumeText] = useState('')
  const [resumeName, setResumeName] = useState('Master Resume')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resumeName,
          content: resumeText
        })
      })

      if (!res.ok) throw new Error('Failed to save resume')

      setSuccess('✅ Resume uploaded and analyzed! Jobs are being scored now.')
      setResumeText('')
      setResumeName('Master Resume')
      
      // Call parent callback
      if (onResumeUploaded) onResumeUploaded()
    } catch (err) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-2">📄 Upload Your Resume</h2>
        <p className="text-blue-800 mb-3">
          Upload your resume so we can:
        </p>
        <ul className="text-blue-800 space-y-1 list-disc list-inside">
          <li>Extract your skills and experience</li>
          <li>Score all job listings for skill match</li>
          <li>Recommend the best opportunities</li>
          <li>Tailor future resume versions for specific roles</li>
        </ul>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Resume Name (optional)
            </label>
            <input
              type="text"
              id="name"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g. Master Resume, AI-Focused Resume"
            />
          </div>

          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
              Resume Text
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Paste your resume as plain text (copy from PDF or LaTeX)
            </p>
            <textarea
              id="resume"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              required
              rows="15"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              placeholder="Paste your resume here..."
            />
          </div>

          <button
            type="submit"
            disabled={loading || !resumeText.trim()}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Processing...' : 'Upload Resume & Score Jobs'}
          </button>
        </form>
      </div>

      {/* How It Works */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
        <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
          <li>Paste your resume (plain text)</li>
          <li>We extract your skills: Python, React, machine learning, etc.</li>
          <li>Every job posting gets scored based on skill match</li>
          <li>See your top matches in "Top Job Matches"</li>
          <li>Upload a different version (e.g., backend-focused) for different scoring</li>
        </ol>
      </div>
    </div>
  )
}
