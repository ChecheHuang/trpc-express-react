import React, { Suspense } from 'react'
import clsx from 'clsx'
import styles from './loader.module.scss'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function LazyLoad(
  ComponentPromise: Promise<{ default: React.ComponentType<object> }>
) {
  const LazyComponent = React.lazy(() => ComponentPromise)

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  )
}

function Loader() {
  return (
    <div className="fixed left-0 top-0 z-10 h-1 w-full bg-gray-400">
      <div
        className={clsx(
          'h-full bg-gradient-to-r from-green-500 to-blue-500',
          styles.animateLoader
        )}
      ></div>
    </div>
  )
}
