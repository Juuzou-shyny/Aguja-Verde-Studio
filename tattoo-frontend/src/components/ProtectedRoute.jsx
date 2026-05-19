import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children }) {
  const { user, setLoginOpen } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      setLoginOpen(true)
      navigate('/')
    }
  }, [user])

  if (!user) return null
  return children
}
