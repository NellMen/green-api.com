import { useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { clearError, createChat } from '../store/chatsSlice'
import './NewChatModal.css'

type Props = {
  open: boolean
  onClose: () => void
}

export function NewChatModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch()
  const isCreatingChat = useAppSelector((state) => state.chats.isCreatingChat)
  const error = useAppSelector((state) => state.chats.error)
  const [phone, setPhone] = useState('')

  if (!open) {
    return null
  }

  const handleClose = () => {
    setPhone('')
    dispatch(clearError())
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const result = await dispatch(createChat(phone))
    if (createChat.fulfilled.match(result)) {
      setPhone('')
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleClose} role="presentation">
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
      >
        <h2 id="new-chat-title">Новый чат</h2>
        <p className="modal-hint">
          Введите номер получателя в международном формате (РФ или РБ)
        </p>

        <form onSubmit={handleSubmit}>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="79991234567"
            autoFocus
          />

          {error ? <p className="modal-error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Отмена
            </button>
            <button type="submit" disabled={isCreatingChat || !phone.trim()}>
              {isCreatingChat ? 'Проверка…' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
