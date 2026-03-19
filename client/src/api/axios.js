import axios from 'axios'

const api = axios.create({
  baseURL:         '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false  // prevents multiple simultaneous refresh calls

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config

    // do not retry refresh or login endpoints — prevents infinite loop
    const isAuthEndpoint = (
      original.url.includes('/auth/refresh/') ||
      original.url.includes('/auth/login/') ||
      original.url.includes('/auth/me/')
    )

    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true

      if (isRefreshing) {
        // already refreshing — just redirect
        window.location.href = '/login'
        return Promise.reject(error)
      }

      isRefreshing = true

      try {
        await axios.post(
          '/api/auth/refresh/',
          {},
          { withCredentials: true }
        )
        isRefreshing = false
        return api(original)
      } catch {
        isRefreshing = false
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // for auth endpoints that fail — just redirect to login
    if (error.response?.status === 401 && isAuthEndpoint) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default api