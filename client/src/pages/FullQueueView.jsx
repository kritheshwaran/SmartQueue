import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import {
  Loader2,
  Users,
  Clock,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Hourglass,
  Radio
} from 'lucide-react'
import api from '../api'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_META = {
  waiting: { label: 'Waiting', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
  'in-progress': { label: 'In Progress', className: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' }
}

export default function FullQueueView() {
  const { doctorId } = useParams()
  const [searchParams] = useSearchParams()
  const date = searchParams.get('date') || todayISO()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true)
      try {
        const res = await api.get(`/queue/${doctorId}`, { params: { date } })
        setData(res.data)
        setError('')
      } catch (err) {
        setError('Unable to load queue.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [doctorId, date]
  )

  useEffect(() => {
    fetchData()
    const interval = setInterval(() => fetchData(true), 8000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-900">{error || 'Something went wrong'}</h2>
        <Link to="/doctors" className="btn-primary mt-6 inline-flex">
          Back to Doctors
        </Link>
      </div>
    )
  }

  const { doctor, appointments, currentToken, totalWaiting, totalCompleted } = data

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      <Link
        to="/doctors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to doctors
      </Link>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-base font-bold text-white shadow-soft"
            style={{ backgroundColor: doctor.avatar_color }}
          >
            {doctor.initials}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{doctor.name}</h1>
            <p className="text-sm text-brand-600">{doctor.specialty} · {date}</p>
          </div>
        </div>
        <button
          onClick={() => fetchData(true)}
          className="btn-secondary !px-4 !py-2.5 text-sm"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="card p-5 text-center">
          <Radio className="mx-auto h-5 w-5 text-brand-600" />
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {currentToken ? `#${String(currentToken).padStart(2, '0')}` : '—'}
          </p>
          <p className="text-xs text-slate-500">Now Serving</p>
        </div>
        <div className="card p-5 text-center">
          <Hourglass className="mx-auto h-5 w-5 text-amber-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalWaiting}</p>
          <p className="text-xs text-slate-500">Waiting</p>
        </div>
        <div className="card p-5 text-center">
          <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalCompleted}</p>
          <p className="text-xs text-slate-500">Completed</p>
        </div>
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-bold text-slate-900">Today's Queue</h3>
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <Users className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">No appointments booked for this date yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((a) => {
              const meta = STATUS_META[a.status]
              return (
                <div key={a.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                      {String(a.token_number).padStart(2, '0')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{a.patient_name}</p>
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {a.time}
                      </p>
                    </div>
                  </div>
                  <span className={`badge ${meta.className}`}>{meta.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
