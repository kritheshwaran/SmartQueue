import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  CalendarCheck,
  Clock,
  ShieldCheck,
  Users,
  ArrowRight,
  Search,
  BellRing,
  TrendingUp,
  Sparkles,
  Star
} from 'lucide-react'
import api from '../api'
import DoctorCard from '../components/DoctorCard'

const steps = [
  {
    icon: Search,
    title: 'Find your doctor',
    description: 'Search and browse specialists by name or specialty in seconds.'
  },
  {
    icon: CalendarCheck,
    title: 'Book instantly',
    description: 'Pick a convenient date and time — no phone calls, no waiting rooms.'
  },
  {
    icon: BellRing,
    title: 'Get your token',
    description: 'Receive an automatic queue token the moment you book.'
  },
  {
    icon: TrendingUp,
    title: 'Track live queue',
    description: 'See exactly how many patients are ahead and your estimated wait.'
  }
]

const stats = [
  { label: 'Doctors Onboard', value: '50+' },
  { label: 'Appointments Booked', value: '12K+' },
  { label: 'Avg. Wait Reduced', value: '38%' },
  { label: 'Patient Rating', value: '4.9/5' }
]

export default function Home() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    api
      .get('/doctors')
      .then((res) => {
        if (mounted) setDoctors(res.data.slice(0, 3))
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 left-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <span className="badge mx-auto bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              <Sparkles className="h-3.5 w-3.5" />
              Smarter hospital queues, zero waiting-room stress
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Skip the line. <br />
              <span className="bg-gradient-to-r from-brand-600 to-sky-500 bg-clip-text text-transparent">
                Book, track & get seen faster.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-600">
              SmartQueue lets patients book appointments online and track their live queue
              position — while doctors manage their day from one clean dashboard.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/doctors" className="btn-primary w-full sm:w-auto">
                <CalendarCheck className="h-5 w-5" />
                Book an Appointment
              </Link>
              <Link to="/doctor/login" className="btn-secondary w-full sm:w-auto">
                <Activity className="h-5 w-5" />
                Doctor Dashboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="card px-4 py-6 text-center">
                <p className="text-2xl font-extrabold text-brand-600 sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="section-heading">How SmartQueue works</h2>
          <p className="mt-4 text-slate-600">
            Four simple steps between you and a faster, stress-free hospital visit.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="card relative p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <span className="absolute right-5 top-5 text-4xl font-black text-slate-100">
                0{idx + 1}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
                <step.icon className="h-6 w-6 text-brand-600" />
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED DOCTORS */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="section-heading">Meet our specialists</h2>
              <p className="mt-3 max-w-lg text-slate-600">
                Highly rated doctors across every specialty, ready to see you today.
              </p>
            </div>
            <Link to="/doctors" className="btn-secondary shrink-0">
              View all doctors
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loading &&
              [1, 2, 3].map((i) => (
                <div key={i} className="card h-56 animate-pulse bg-slate-100" />
              ))}
            {!loading && doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
          </div>
        </div>
      </section>

      {/* WHY SMARTQUEUE */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="section-heading">Why hospitals choose SmartQueue</h2>
            <p className="mt-4 text-slate-600">
              A lightweight, modern queue-management layer that fits into any clinic's workflow
              without expensive infrastructure.
            </p>

            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <Clock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Real-time wait estimates</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Patients always know exactly how long until they're seen.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                  <Users className="h-5 w-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Effortless queue control</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Doctors call and complete patients with a single click.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <ShieldCheck className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Simple &amp; reliable</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    No complex setup — runs entirely on a lightweight local database.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card relative overflow-hidden p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand-100 blur-2xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Live Queue Preview</p>
                <p className="text-2xl font-extrabold text-slate-900">Dr. Ananya Sharma</p>
              </div>
              <span className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>

            <div className="mt-8 flex items-center justify-center rounded-2xl bg-brand-600 py-10 shadow-glow">
              <div className="text-center text-white">
                <p className="text-xs font-medium uppercase tracking-wider text-brand-100">
                  Now Serving
                </p>
                <p className="mt-1 text-5xl font-black">#04</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">6</p>
                <p className="text-xs text-slate-500">Patients Ahead</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-2xl font-bold text-slate-900">~60m</p>
                <p className="text-xs text-slate-500">Est. Wait Time</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400" />
              ))}
              <span className="ml-2 text-xs font-medium text-slate-500">
                Rated 4.9 by 1,200+ patients
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-sky-500 px-6 py-16 text-center shadow-glow sm:px-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold text-white sm:text-4xl">
            Ready to skip the waiting room?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-50">
            Book your appointment in under a minute and track your queue live from your phone.
          </p>
          <Link
            to="/doctors"
            className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-brand-700 shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
          >
            Get Started Now
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
