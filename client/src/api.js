import axios from 'axios'

// In dev, Vite proxies /api to the Express server (see vite.config.js).
const api = axios.create({
  baseURL: '/api'
})

export default api
