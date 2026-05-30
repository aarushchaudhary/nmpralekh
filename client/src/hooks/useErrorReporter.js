/**
 * useErrorReporter
 *
 * Sends error reports to the backend service endpoint silently.
 * Never throws — the reporter must never cause a secondary crash.
 *
 * Usage:
 *   const { reportError, reportApiError } = useErrorReporter()
 *
 *   // In a catch block:
 *   reportError(error, { componentStack: '...' })
 *
 *   // For API errors (called automatically by axios interceptor):
 *   reportApiError(axiosError)
 */

import api from '../api/axios'

// Module-level dedup cache so the same error isn't reported twice
// within a single browser session (avoids hammering the endpoint on
// infinite render loops, etc.).
const _reported = new Set()

function _makeKey(errorType, message, urlPath) {
    return `${errorType}|${message?.slice(0, 100)}|${urlPath}`
}

function _safeSend(payload) {
    // Fire-and-forget — never await, never throw
    try {
        api.post('/service/report-error/', payload).catch(() => {
            // swallow — we don't want to surface network errors here
        })
    } catch {
        // swallow synchronous errors (e.g. during SSR, before Axios is ready)
    }
}

/**
 * reportError — for React ErrorBoundary and window.onerror
 *
 * @param {Error|string} error
 * @param {{ componentStack?: string, extra?: object }} options
 */
export function reportError(error, options = {}) {
    const urlPath    = window.location.pathname
    const errorType  = error?.name || 'Error'
    const message    = error?.message || String(error) || 'Unknown error'
    const stackTrace = error?.stack || ''
    const key        = _makeKey(errorType, message, urlPath)

    if (_reported.has(key)) return
    _reported.add(key)

    _safeSend({
        source:          'frontend_js',
        error_type:      errorType,
        error_message:   message,
        stack_trace:     stackTrace,
        component_stack: options.componentStack || '',
        url_path:        urlPath,
        user_agent:      navigator.userAgent,
        extra:           options.extra || null,
    })
}

/**
 * reportApiError — for Axios response interceptor
 *
 * @param {import('axios').AxiosError} axiosError
 */
export function reportApiError(axiosError) {
    const urlPath    = window.location.pathname
    const httpStatus = axiosError.response?.status
    const endpoint   = axiosError.config?.url || ''

    // Don't report 401/403 — those are auth redirects, not bugs
    if (httpStatus === 401 || httpStatus === 403) return

    const detail  = axiosError.response?.data?.detail || axiosError.message || 'Network Error'
    const key     = _makeKey('APIError', `${httpStatus}|${endpoint}`, urlPath)

    if (_reported.has(key)) return
    _reported.add(key)

    _safeSend({
        source:        'api_error',
        error_type:    'APIError',
        error_message: detail,
        stack_trace:   axiosError.stack || '',
        url_path:      urlPath,
        http_status:   httpStatus || null,
        api_endpoint:  endpoint,
        user_agent:    navigator.userAgent,
        extra: {
            method:        axiosError.config?.method?.toUpperCase(),
            response_data: JSON.stringify(axiosError.response?.data)?.slice(0, 500),
        },
    })
}

/**
 * Hook version (for use inside React components/hooks).
 * Returns the same two functions bound to the current component context.
 */
export default function useErrorReporter() {
    return { reportError, reportApiError }
}
