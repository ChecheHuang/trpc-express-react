import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Page = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/login')
  }, [])

  return <></>
}

export default Page
