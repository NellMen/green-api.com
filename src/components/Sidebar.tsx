import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logout } from '../store/authSlice'
import { resetChats } from '../store/chatsSlice'
import './Sidebar.css'

type Props = {
  onNewChat: () => void
  onSelectChat: (chatId: string) => void
}

function formatTime(timestamp?: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function Sidebar({ onNewChat, onSelectChat }: Props) {
  const dispatch = useAppDispatch()
  const chats = useAppSelector((state) => state.chats.chats)
  const activeChatId = useAppSelector((state) => state.chats.activeChatId)
  const idInstance = useAppSelector((state) => state.auth.credentials?.idInstance)

  const handleLogout = () => {
    dispatch(resetChats())
    dispatch(logout())
  }

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div>
          <div className="sidebar-title">MAX</div>
          <div className="sidebar-sub">#{idInstance}</div>
        </div>
        <button type="button" className="icon-btn" onClick={handleLogout} title="Выйти">
          ⎋
        </button>
      </header>

      <button type="button" className="new-chat-btn" onClick={onNewChat}>
        + Новый чат
      </button>

      <div className="chat-list">
        {chats.length === 0 ? (
          <p className="chat-list-empty">Нет чатов. Создайте новый по номеру телефона.</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.chatId}
              type="button"
              className={`chat-item${activeChatId === chat.chatId ? ' is-active' : ''}`}
              onClick={() => onSelectChat(chat.chatId)}
            >
              <div className="chat-avatar">{chat.name.slice(0, 1).toUpperCase()}</div>
              <div className="chat-meta">
                <div className="chat-row">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-time">{formatTime(chat.lastTimestamp)}</span>
                </div>
                <div className="chat-preview">{chat.lastMessage || 'Нет сообщений'}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
