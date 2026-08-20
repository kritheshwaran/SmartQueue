import { useEffect, useState } from 'react'
import { Search, Stethoscope, SearchX } from 'lucide-react'
import api from '../api'
import DoctorCard from '../components/DoctorCard'

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true)
      api
        .get('/doctors', { params: query ? { search: query } : {} })
        .then((res) => setDoctors(res.data))
        .catch(() => setDoctors([]))
        .finally(() => setLoading(false))
    }, 250)

    return () => clearTimeout(timeout)
  }, [query])

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="badge mx-auto bg-brand-50 text-brand-700 ring-1 ring-brand-100">
          <Stethoscope className="h-3.5 w-3.5" />
          {doctors.length} specialists available
        </span>
        <h1 className="section-heading mt-4">Find your doctor</h1>
        <p className="mt-3 text-slate-600">
          Search by doctor name or specialty and book your appointment instantly.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or specialty, e.g. Cardiologist"
            className="input-field !pl-12 !py-3.5 shadow-soft"
          />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="card h-56 animate-pulse bg-slate-100" />)}

        {!loading && doctors.map((doc) => <DoctorCard key={doc.id} doctor={doc} />)}
      </div>

      {!loading && doctors.length === 0 && (
        <div className="mx-auto mt-16 flex max-w-sm flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <SearchX className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No doctors found</h3>
          <p className="mt-2 text-sm text-slate-500">Try a different name or specialty.</p>
        </div>
      )}
    </div>
  )
}
