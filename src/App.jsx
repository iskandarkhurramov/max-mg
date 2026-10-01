import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ChatLayout from './pages/ChatLayout'
import EmptyChat from './components/EmptyChat'
import ChatWindow from './components/ChatWindow'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/chats"
        element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<EmptyChat />} />
        <Route path=":chatId" element={<ChatWindow />} />
      </Route>
      <Route path="*" element={<Navigate to="/chats" replace />} />
    </Routes>
  )
}
