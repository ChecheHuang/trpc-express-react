import { Button } from 'antd'
import React from 'react'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'

function MyErrorBoundary({ children }: { children: React.ReactNode }) {
  function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.

    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center bg-white"
        role="alert"
      >
        <p>Something went wrong:</p>
        <div className="w-full text-center" style={{ color: 'red' }}>
          {error.message}
        </div>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    )
  }
  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

export default MyErrorBoundary
