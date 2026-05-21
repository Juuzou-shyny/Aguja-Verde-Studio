import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function AdminRoute({ children }) {
  const { user } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
    }
  }, [user])

  if (!user || user.role !== 'admin') return null
  return children
}
