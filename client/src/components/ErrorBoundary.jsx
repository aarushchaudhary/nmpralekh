import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { reportError } from '../hooks/useErrorReporter'
import Button from './ui/Button'

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
                <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50 font-sans">
                    <div className="w-full max-w-md text-center bg-white border border-gray-200 rounded-md px-6 py-8">
                        <ExclamationTriangleIcon aria-hidden="true" className="mx-auto mb-3 w-6 h-6 text-primary-600" />
                        <h2 className="text-base font-semibold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed mb-6">
                            This error has been automatically reported.
                            You can also describe what happened using the button below.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => window.location.reload()}>
                                Reload Page
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    // Reset boundary so the bug report modal can render
                                    this.setState({ hasError: false })
                                    window._openBugReport?.()
                                }}
                            >
                                Report Issue
                            </Button>
                        </div>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

