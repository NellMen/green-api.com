import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { useNotificationPolling } from '../hooks/useNotificationPolling'
import { setActiveChat } from '../store/chatsSlice'
import { Sidebar } from './Sidebar'
import { ChatWindow } from './ChatWindow'
import { NewChatModal } from './NewChatModal'
import './ChatApp.css'

export function ChatApp() {
  const dispatch = useAppDispatch()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const activeChatId = useAppSelector((state) => state.chats.activeChatId)

  useNotificationPolling(true)

  const handleSelectChat = (chatId: string) => {
    dispatch(setActiveChat(chatId))
    setMobileShowChat(true)
  }

  return (
    <div className="chat-app">
      <div className="chat-shell">
        <div className={`pane-sidebar${mobileShowChat && activeChatId ? ' hide-on-mobile' : ''}`}>
          <Sidebar
            onNewChat={() => setIsModalOpen(true)}
            onSelectChat={handleSelectChat}
          />
        </div>

        <div className={`pane-chat${!mobileShowChat || !activeChatId ? ' hide-on-mobile' : ''}`}>
          <ChatWindow onBack={() => setMobileShowChat(false)} />
        </div>
      </div>

      <NewChatModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setMobileShowChat(true)
        }}
      />
    </div>
  )
}
