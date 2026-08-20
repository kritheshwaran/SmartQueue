import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Calendar, Clock, User, Phone, ArrowLeft, Star, BriefcaseMedical, Loader2 } from 'lucide-react'
import api from '../api'

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM'
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function Booking() {
  const { doctorId } = useParams()
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [loadingDoctor, setLoadingDoctor] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    date: todayISO(),
    time: TIME_SLOTS[0]
  })

  useEffect(() => {
    api
      .get(`/doctors/${doctorId}`)
      .then((res) => setDoctor(res.data))
      .catch(() => setError('Doctor not found.'))
      .finally(() => setLoadingDoctor(false))
  }, [doctorId])

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.patientName.trim() || !form.patientPhone.trim() || !form.date || !form.time) {
      setError('Please fill in all fields.')
      return
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(form.patientPhone.trim())) {
      setError('Please enter a valid phone number.')
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post('/appointments', {
        doctorId,
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        date: form.date,
        time: form.time
      })
      navigate(`/queue/${res.data.appointment.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingDoctor) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h2 className="text-xl font-bold text-slate-900">Doctor not found</h2>
        <Link to="/doctors" className="btn-primary mt-6 inline-flex">
          Back to Doctors
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
      <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to doctors
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Doctor summary */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24 p-6">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-soft"
              style={{ backgroundColor: doctor.avatar_color }}
            >
              {doctor.initials}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{doctor.name}</h2>
            <p className="text-sm font-medium text-brand-600">{doctor.specialty}</p>

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {doctor.rating} rating
              </span>
              <span className="flex items-center gap-1">
                <BriefcaseMedical className="h-3.5 w-3.5" />
                {doctor.experience} yrs
              </span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-500">{doctor.bio}</p>

            <div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
              A queue token will be generated automatically once you confirm your booking.
            </div>
          </div>
        </div>

        {/* Booking form */}
        <div className="lg:col-span-3">
          <div className="card p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold text-slate-900">Book your appointment</h1>
            <p className="mt-1 text-sm text-slate-500">Fill in your details to reserve your slot.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="input-field !pl-11"
                    placeholder="e.g. Rahul Kumar"
                    value={form.patientName}
                    onChange={handleChange('patientName')}
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Phone Number</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    className="input-field !pl-11"
                    placeholder="e.g. 9876543210"
                    value={form.patientPhone}
                    onChange={handleChange('patientPhone')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="label-text">Date</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      min={todayISO()}
                      className="input-field !pl-11"
                      value={form.date}
                      onChange={handleChange('date')}
                    />
                  </div>
                </div>

                <div>
                  <label className="label-text">Time Slot</label>
                  <div className="relative">
                    <Clock className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <select
                      className="input-field !pl-11 appearance-none"
                      value={form.time}
                      onChange={handleChange('time')}
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full !py-3.5">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
