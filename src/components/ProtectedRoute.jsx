import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectAuth } from '../store/authSlice'

export default function ProtectedRoute({ children }) {
  const { isAuthorized } = useSelector(selectAuth)
  return isAuthorized ? children : <Navigate to="/login" replace />
}
