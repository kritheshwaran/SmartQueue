import { Activity, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold text-slate-900">
              Smart<span className="text-brand-600">Queue</span>
            </span>
          </div>

          <p className="flex items-center gap-1.5 text-sm text-slate-500">
            Built with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> for smarter hospital queues
          </p>

          <p className="text-sm text-slate-400">© {new Date().getFullYear()} SmartQueue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
