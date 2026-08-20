import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Stethoscope, Lock, Loader2, ArrowLeft, ChevronDown } from 'lucide-react'
import api from '../api'

export default function DoctorLogin() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get('/doctors').then((res) => {
      setDoctors(res.data)
      if (res.data.length > 0) setDoctorId(String(res.data[0].id))
    })

    const existing = localStorage.getItem('smartqueue_doctor')
    if (existing) {
      navigate('/doctor/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!doctorId || !password) {
      setError('Please select a doctor and enter the password.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/doctor/login', { doctorId, password })
      localStorage.setItem('smartqueue_doctor', JSON.stringify(res.data.doctor))
      navigate('/doctor/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-14 sm:px-6">
      <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <div className="card p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-glow">
          <Stethoscope className="h-6 w-6 text-white" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Doctor Login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage today's queue.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="label-text">Select Doctor</label>
            <div className="relative">
              <select
                className="input-field appearance-none pr-10"
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} — {doc.specialty}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                className="input-field !pl-11"
                placeholder="Demo password: 1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">Demo credential — password is 1234 for every doctor.</p>
          </div>

          {error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
