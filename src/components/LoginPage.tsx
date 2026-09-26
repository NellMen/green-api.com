import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '../store/hooks'
import { login } from '../store/authSlice'
import './LoginPage.css'

const DEFAULT_API_URL = 'https://api.green-api.com'

export function LoginPage() {
  const dispatch = useAppDispatch()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Укажите idInstance и apiTokenInstance')
      return
    }

    dispatch(
      login({
        idInstance: idInstance.trim(),
        apiTokenInstance: apiTokenInstance.trim(),
        apiUrl: apiUrl.trim() || DEFAULT_API_URL,
      }),
    )
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-logo" aria-hidden>
            M
          </div>
          <h1>MAX Chat</h1>
          <p>Прототип чата на GREEN-API</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            idInstance
            <input
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Из личного кабинета GREEN-API"
              autoComplete="username"
            />
          </label>

          <label>
            apiTokenInstance
            <input
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Токен инстанса"
              autoComplete="current-password"
              type="password"
            />
          </label>

          <label>
            apiUrl
            <input
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.green-api.com"
            />
          </label>

          {error ? <p className="login-error">{error}</p> : null}

          <button type="submit">Войти</button>
        </form>
      </div>
    </div>
  )
}
