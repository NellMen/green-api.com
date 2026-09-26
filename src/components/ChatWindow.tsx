import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { sendChatMessage } from '../store/chatsSlice'
import './ChatWindow.css'

type Props = {
  onBack?: () => void
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChatWindow({ onBack }: Props) {
  const dispatch = useAppDispatch()
  const activeChatId = useAppSelector((state) => state.chats.activeChatId)
  const chat = useAppSelector((state) =>
    state.chats.chats.find((item) => item.chatId === state.chats.activeChatId),
  )
  const messages = useAppSelector((state) =>
    activeChatId ? state.chats.messagesByChatId[activeChatId] ?? [] : [],
  )
  const isSending = useAppSelector((state) => state.chats.isSending)
  const error = useAppSelector((state) => state.chats.error)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, activeChatId])

  if (!activeChatId || !chat) {
    return (
      <section className="chat-window chat-window-empty">
        <div className="empty-state">
          <div className="empty-logo">M</div>
          <h2>MAX Chat</h2>
          <p>Выберите чат или создайте новый по номеру телефона</p>
        </div>
      </section>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim() || isSending) return

    const result = await dispatch(
      sendChatMessage({ chatId: activeChatId, text }),
    )

    if (sendChatMessage.fulfilled.match(result)) {
      setText('')
    }
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        {onBack ? (
          <button type="button" className="back-btn" onClick={onBack}>
            ←
          </button>
        ) : null}
        <div className="chat-header-avatar">{chat.name.slice(0, 1).toUpperCase()}</div>
        <div>
          <div className="chat-header-name">{chat.name}</div>
          <div className="chat-header-phone">{chat.phone}</div>
        </div>
      </header>

      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`bubble-row ${message.direction === 'outgoing' ? 'out' : 'in'}`}
          >
            <div className={`bubble ${message.direction}`}>
              <div className="bubble-text">{message.text}</div>
              <div className="bubble-time">{formatTime(message.timestamp)}</div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error ? <div className="chat-error">{error}</div> : null}

      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение"
          maxLength={4000}
        />
        <button type="submit" disabled={isSending || !text.trim()} aria-label="Отправить">
          ➤
        </button>
      </form>
    </section>
  )
}
