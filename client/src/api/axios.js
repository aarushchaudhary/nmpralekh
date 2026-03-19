import axios from 'axios'

const api = axios.create({
  baseURL:         '/api',
  withCredentials: true,    // sends cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await axios.post(
          '/api/auth/refresh/',
          {},
          { withCredentials: true }
        )
        return api(original)
      } catch {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api