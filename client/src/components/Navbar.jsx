import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Activity, Menu, X, Stethoscope, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive ? 'text-brand-600' : 'text-slate-600 hover:text-brand-600'
    }`

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/doctors', label: 'Find Doctors' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-glow">
            <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Smart<span className="text-brand-600">Queue</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link to="/doctors" className="btn-secondary !px-4 !py-2.5 text-sm">
            <Stethoscope className="h-4 w-4" />
            Book Appointment
          </Link>
          <Link to="/doctor/login" className="btn-primary !px-4 !py-2.5 text-sm">
            <LayoutDashboard className="h-4 w-4" />
            Doctor Login
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <button
              className="btn-secondary w-full justify-center"
              onClick={() => {
                setOpen(false)
                navigate('/doctors')
              }}
            >
              <Stethoscope className="h-4 w-4" />
              Book Appointment
            </button>
            <button
              className="btn-primary w-full justify-center"
              onClick={() => {
                setOpen(false)
                navigate('/doctor/login')
              }}
            >
              <LayoutDashboard className="h-4 w-4" />
              Doctor Login
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
