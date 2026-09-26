import { Provider } from 'react-redux'
import { store } from './store'
import { useAppSelector } from './store/hooks'
import { LoginPage } from './components/LoginPage'
import { ChatApp } from './components/ChatApp'

function AppContent() {
  const credentials = useAppSelector((state) => state.auth.credentials)
  return credentials ? <ChatApp /> : <LoginPage />
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}
