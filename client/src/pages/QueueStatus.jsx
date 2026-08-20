import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Loader2,
  Hash,
  Users,
  Clock,
  CalendarDays,
  CheckCircle2,
  Stethoscope,
  RefreshCw,
  PartyPopper
} from 'lucide-react'
import api from '../api'

const STATUS_META = {
  waiting: { label: 'Waiting', className: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100' },
  'in-progress': { label: 'In Progress', className: 'bg-brand-50 text-brand-700 ring-1 ring-brand-100' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' }
}

export default function QueueStatus() {
  const { appointmentId } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchData = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true)
      try {
        const res = await api.get(`/appointments/${appointmentId}`)
        setData(res.data)
        setError('')
      } catch (err) {
        setError('Appointment not found.')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [appointmentId]
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

  const { appointment, doctor } = data
  const meta = STATUS_META[appointment.status]
  const isDone = appointment.status === 'completed'
  const isCurrent = appointment.status === 'in-progress'

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="badge mx-auto bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Stethoscope className="h-3.5 w-3.5" />
          Appointment Confirmed
        </span>
        <h1 className="section-heading mt-4">Your live queue status</h1>
        <p className="mt-2 text-slate-600">
          Booked with <span className="font-semibold text-slate-800">{doctor.name}</span> ·{' '}
          {doctor.specialty}
        </p>
      </div>

      {/* Token Card */}
      <div className="card relative mt-10 overflow-hidden p-8 text-center">
        <div className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-brand-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-14 h-48 w-48 rounded-full bg-sky-100 blur-3xl" />

        <p className="relative text-sm font-medium uppercase tracking-wider text-slate-400">
          Your Token Number
        </p>
        <p className="relative mt-2 text-6xl font-black text-brand-600 sm:text-7xl">
          #{String(appointment.token_number).padStart(2, '0')}
        </p>

        <span className={`badge relative mt-4 ${meta.className}`}>
          {isCurrent && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-600" />}
          {meta.label}
        </span>

        {isDone ? (
          <div className="relative mt-8 flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 px-6 py-6">
            <PartyPopper className="h-8 w-8 text-emerald-600" />
            <p className="font-semibold text-emerald-700">Your consultation is complete!</p>
            <p className="text-sm text-emerald-600">Thank you for using SmartQueue.</p>
          </div>
        ) : (
          <div className="relative mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <Users className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-2 text-2xl font-bold text-slate-900">{appointment.patientsAhead}</p>
              <p className="text-xs text-slate-500">Patients Ahead</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Clock className="mx-auto h-5 w-5 text-slate-400" />
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {appointment.estimatedWaitMinutes === 0 ? "You're next!" : `~${appointment.estimatedWaitMinutes}m`}
              </p>
              <p className="text-xs text-slate-500">Estimated Wait</p>
            </div>
          </div>
        )}

        <button
          onClick={() => fetchData(true)}
          className="relative mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-600"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Auto-refreshing every 8s · Refresh now'}
        </button>
      </div>

      {/* Appointment details */}
      <div className="card mt-6 divide-y divide-slate-100 p-2">
        <DetailRow icon={Hash} label="Patient" value={appointment.patient_name} />
        <DetailRow icon={CalendarDays} label="Date" value={appointment.date} />
        <DetailRow icon={Clock} label="Time Slot" value={appointment.time} />
        <DetailRow icon={CheckCircle2} label="Status" value={meta.label} />
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/doctors" className="btn-secondary">
          Book Another Appointment
        </Link>
        <Link to={`/queue-view/${doctor.id}?date=${appointment.date}`} className="btn-primary">
          View Full Queue
        </Link>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}
