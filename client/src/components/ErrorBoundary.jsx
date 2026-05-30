import React from 'react'
import { reportError } from '../hooks/useErrorReporter'

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        // Report to service portal — fire and forget
        reportError(error, {
            componentStack: info?.componentStack || '',
            extra: { react_error_boundary: true },
        })
        console.error('ErrorBoundary caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', height: '100vh',
                    fontFamily: 'sans-serif', background: '#f9fafb'
                }}>
                    <div style={{ textAlign: 'center', maxWidth: 400 }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: '#fee2e2', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <svg width="28" height="28" fill="none" stroke="#ef4444"
                                viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#111827', margin: '0 0 8px' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
                            This error has been automatically reported.
                            You can also describe what happened using the button below.
                        </p>
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '8px 20px', background: '#2563eb',
                                    color: '#fff', border: 'none', borderRadius: 8,
                                    cursor: 'pointer', fontSize: 14, fontWeight: 500,
                                }}
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    // Reset boundary so the bug report modal can render
                                    this.setState({ hasError: false })
                                    window._openBugReport?.()
                                }}
                                style={{
                                    padding: '8px 20px', background: '#fff',
                                    color: '#374151', border: '1px solid #d1d5db',
                                    borderRadius: 8, cursor: 'pointer',
                                    fontSize: 14, fontWeight: 500,
                                }}
                            >
                                Report Issue
                            </button>
                        </div>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

