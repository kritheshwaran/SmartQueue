import { Link } from 'react-router-dom'
import { Star, BriefcaseMedical, ArrowRight } from 'lucide-react'

export default function DoctorCard({ doctor }) {
  return (
    <div className="card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow animate-slide-up">
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-soft"
          style={{ backgroundColor: doctor.avatar_color }}
        >
          {doctor.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-bold text-slate-900">{doctor.name}</h3>
          <p className="text-sm font-medium text-brand-600">{doctor.specialty}</p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {doctor.rating}
            </span>
            <span className="flex items-center gap-1">
              <BriefcaseMedical className="h-3.5 w-3.5" />
              {doctor.experience} yrs exp.
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate-500">{doctor.bio}</p>

      <Link
        to={`/book/${doctor.id}`}
        className="btn-primary mt-5 w-full !py-2.5 text-sm group-hover:gap-3"
      >
        Book Appointment
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
