import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Booking from './pages/Booking'
import QueueStatus from './pages/QueueStatus'
import FullQueueView from './pages/FullQueueView'
import DoctorLogin from './pages/DoctorLogin'
import DoctorDashboard from './pages/DoctorDashboard'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/book/:doctorId" element={<Booking />} />
          <Route path="/queue/:appointmentId" element={<QueueStatus />} />
          <Route path="/queue-view/:doctorId" element={<FullQueueView />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route
            path="*"
            element={
              <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
                <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
                <p className="mt-2 text-slate-500">Page not found.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
