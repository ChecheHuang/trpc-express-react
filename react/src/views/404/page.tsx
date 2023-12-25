import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-r from-indigo-300 to-purple-500">
      <div className="rounded-lg bg-white bg-opacity-20 p-12 text-center shadow-lg backdrop-blur-md backdrop-filter">
        <h1 className="mb-8 text-6xl font-bold text-white">404</h1>
        <p className="mb-8 text-2xl font-medium text-white">
          Oops! Page not found.
        </p>
        <Link
          to="/"
          className="rounded bg-purple-900 px-6 py-3 font-semibold text-white transition duration-300 ease-in-out hover:bg-opacity-80"
        >
          Go Back
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
