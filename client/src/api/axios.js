import axios from 'axios'
import { reportApiError } from '../hooks/useErrorReporter'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
    baseURL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
})

function getCsrfToken() {
    return document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]
}

// Attach CSRF token to mutating requests
api.interceptors.request.use(config => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
        config.headers['X-CSRFToken'] = getCsrfToken()
    }
    return config
})

let isRefreshing = false

api.interceptors.response.use(
    response => response,
    async error => {
        const original = error.config

        const isAuthEndpoint = (
            original.url.includes('/auth/refresh/') ||
            original.url.includes('/auth/login/') ||
            original.url.includes('/auth/me/')
        )

        // ── Service portal error reporting ───────────────────────────────────
        // Report API errors silently. Skip:
        //   - Auth endpoints (these are normal login/session flows)
        //   - The error-reporting endpoint itself (avoid infinite loop)
        //   - 401/403 (handled by auth flow below)
        const isReportEndpoint = original.url.includes('/service/report-error/')
        const skipStatus = [401, 403]
        if (
            !isAuthEndpoint &&
            !isReportEndpoint &&
            error.response &&
            !skipStatus.includes(error.response.status)
        ) {
            reportApiError(error)
        }
        // ─────────────────────────────────────────────────────────────────────

        if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
            original._retry = true

            if (isRefreshing) {
                window.location.href = '/login'
                return Promise.reject(error)
            }

            isRefreshing = true
            try {
                await axios.post(`${baseURL}/auth/refresh/`, {}, { withCredentials: true })
                isRefreshing = false
                return api(original)
            } catch {
                isRefreshing = false
                window.location.href = '/login'
                return Promise.reject(error)
            }
        }

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