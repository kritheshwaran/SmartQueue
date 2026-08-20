import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Loader2,
  LogOut,
  Users,
  CheckCircle2,
  Hourglass,
  PhoneCall,
  Check,
  Clock,
  Star,
  BriefcaseMedical,
  RefreshCw,
  Inbox
} from 'lucide-react'
import api from '../api'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function DoctorDashboard() {
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [queue, setQueue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const date = todayISO()

  useEffect(() => {
    const stored = localStorage.getItem('smartqueue_doctor')
    if (!stored) {
      navigate('/doctor/login')
      return
    }
    setDoctor(JSON.parse(stored))
  }, [navigate])

  const fetchQueue = useCallback(
    async (doctorId, silent = false) => {
      if (!silent) setLoading(true)
      try {
        const res = await api.get(`/doctor/${doctorId}/queue`, { params: { date } })
        setQueue(res.data)
        setError('')
      } catch (err) {
        setError('Unable to load queue.')
      } finally {
        setLoading(false)
      }
    },
    [date]
  )

  useEffect(() => {
    if (!doctor) return
    fetchQueue(doctor.id)
    const interval = setInterval(() => fetchQueue(doctor.id, true), 8000)
    return () => clearInterval(interval)
  }, [doctor, fetchQueue])

  const handleLogout = () => {
    localStorage.removeItem('smartqueue_doctor')
    navigate('/')
  }

  const handleCallNext = async () => {
    setActionLoading(true)
    setError('')
    try {
      await api.post('/doctor/call-next', { doctorId: doctor.id, date })
      await fetchQueue(doctor.id, true)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to call next patient.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!queue?.current) return
    setActionLoading(true)
    setError('')
    try {
      await api.post('/doctor/complete', { doctorId: doctor.id, appointmentId: queue.current.id })
      await fetchQueue(doctor.id, true)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to complete patient.')
    } finally {
      setActionLoading(false)
    }
  }

  if (!doctor || loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold text-white shadow-soft"
            style={{ backgroundColor: doctor.avatar_color }}
          >
            {doctor.initials}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Welcome, {doctor.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {doctor.rating}
              </span>
              <span className="flex items-center gap-1">
                <BriefcaseMedical className="h-3.5 w-3.5" />
                {doctor.experience} yrs
              </span>
              <span className="text-slate-400">{date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchQueue(doctor.id, true)}
            className="btn-secondary !px-4 !py-2.5 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={handleLogout} className="btn-secondary !px-4 !py-2.5 text-sm">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <Users className="mx-auto h-5 w-5 text-brand-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{queue?.stats.total ?? 0}</p>
          <p className="text-xs text-slate-500">Total Today</p>
        </div>
        <div className="card p-5 text-center">
          <Hourglass className="mx-auto h-5 w-5 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{queue?.stats.waiting ?? 0}</p>
          <p className="text-xs text-slate-500">Waiting</p>
        </div>
        <div className="card p-5 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{queue?.stats.completed ?? 0}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Current patient */}
        <div className="lg:col-span-2">
          <div className="card relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100 blur-3xl" />
            <p className="relative text-sm font-semibold uppercase tracking-wide text-slate-400">
              Current Patient
            </p>

            {queue?.current ? (
              <div className="relative mt-4">
                <div className="flex items-center justify-center rounded-2xl bg-brand-600 py-8 shadow-glow">
                  <div className="text-center text-white">
                    <p className="text-xs font-medium uppercase tracking-wider text-brand-100">Token</p>
                    <p className="mt-1 text-5xl font-black">
                      #{String(queue.current.token_number).padStart(2, '0')}
                    </p>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient</span>
                    <span className="font-semibold text-slate-800">{queue.current.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone</span>
                    <span className="font-semibold text-slate-800">{queue.current.patient_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Slot</span>
                    <span className="flex items-center gap-1 font-semibold text-slate-800">
                      <Clock className="h-3.5 w-3.5" />
                      {queue.current.time}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="btn-primary mt-6 w-full"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Complete Patient
                </button>
              </div>
            ) : (
              <div className="relative mt-6 flex flex-col items-center rounded-2xl bg-slate-50 py-10 text-center">
                <Inbox className="h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">No patient currently in progress.</p>
              </div>
            )}

            <button
              onClick={handleCallNext}
              disabled={actionLoading || !!queue?.current || (queue?.waiting.length ?? 0) === 0}
              className="btn-secondary relative mt-4 w-full"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PhoneCall className="h-4 w-4" />
              )}
              Call Next Patient
            </button>
            {!queue?.current && (queue?.waiting.length ?? 0) === 0 && (
              <p className="relative mt-2 text-center text-xs text-slate-400">No patients waiting in queue.</p>
            )}
          </div>
        </div>

        {/* Waiting list */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-slate-900">Waiting Queue ({queue?.waiting.length ?? 0})</h3>
            </div>

            {(queue?.waiting.length ?? 0) === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <Users className="h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">No patients waiting right now.</p>
              </div>
            ) : (
              <div className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
                {queue.waiting.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                        {String(a.token_number).padStart(2, '0')}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{a.patient_name}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {a.time} · {a.patient_phone}
                        </p>
                      </div>
                    </div>
                    <span className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-100">Waiting</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
