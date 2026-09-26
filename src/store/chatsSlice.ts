import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import { checkAccount, sendMessage as apiSendMessage } from '../api/greenApi'
import type { Chat, ChatMessage, Credentials } from '../types'
import { formatPhoneDisplay, isValidPhone, normalizePhone } from '../utils/phone'
import type { RootState } from './index'

type ChatsState = {
  chats: Chat[]
  messagesByChatId: Record<string, ChatMessage[]>
  activeChatId: string | null
  isSending: boolean
  isCreatingChat: boolean
  error: string | null
}

const initialState: ChatsState = {
  chats: [],
  messagesByChatId: {},
  activeChatId: null,
  isSending: false,
  isCreatingChat: false,
  error: null,
}

function requireCredentials(state: RootState): Credentials {
  const credentials = state.auth.credentials
  if (!credentials) {
    throw new Error('Сначала войдите с учетными данными GREEN-API')
  }
  return credentials
}

export const createChat = createAsyncThunk(
  'chats/createChat',
  async (phoneInput: string, { getState, rejectWithValue }) => {
    const digits = normalizePhone(phoneInput)

    if (!isValidPhone(digits)) {
      return rejectWithValue(
        'Введите номер в международном формате: 79XXXXXXXXX или 375XXXXXXXXX',
      )
    }

    try {
      const credentials = requireCredentials(getState() as RootState)
      const result = await checkAccount(credentials, Number(digits))

      if (result.status === false) {
        return rejectWithValue(result.reason || 'Инстанс не готов к работе')
      }

      if (!result.exist || !result.chatId) {
        return rejectWithValue('Аккаунт MAX на этом номере не найден')
      }

      const chat: Chat = {
        chatId: result.chatId,
        phone: digits,
        name: formatPhoneDisplay(digits),
      }

      return chat
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Не удалось создать чат',
      )
    }
  },
)

export const sendChatMessage = createAsyncThunk(
  'chats/sendMessage',
  async (
    { chatId, text }: { chatId: string; text: string },
    { getState, rejectWithValue },
  ) => {
    const trimmed = text.trim()
    if (!trimmed) {
      return rejectWithValue('Сообщение не может быть пустым')
    }

    try {
      const credentials = requireCredentials(getState() as RootState)
      const result = await apiSendMessage(credentials, chatId, trimmed)

      const message: ChatMessage = {
        id: result.idMessage,
        chatId,
        text: trimmed,
        timestamp: Math.floor(Date.now() / 1000),
        direction: 'outgoing',
      }

      return message
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Не удалось отправить сообщение',
      )
    }
  },
)

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setActiveChat(state, action: PayloadAction<string>) {
      state.activeChatId = action.payload
      state.error = null
    },
    clearError(state) {
      state.error = null
    },
    resetChats() {
      return initialState
    },
    addIncomingMessage(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload
      const list = state.messagesByChatId[message.chatId] ?? []

      if (list.some((item) => item.id === message.id)) {
        return
      }

      state.messagesByChatId[message.chatId] = [...list, message]

      const existing = state.chats.find((chat) => chat.chatId === message.chatId)
      if (existing) {
        existing.lastMessage = message.text
        existing.lastTimestamp = message.timestamp
        if (message.senderName) {
          existing.name = message.senderName
        }
      } else {
        state.chats.unshift({
          chatId: message.chatId,
          phone: message.chatId,
          name: message.senderName || message.chatId,
          lastMessage: message.text,
          lastTimestamp: message.timestamp,
        })
      }

      state.chats.sort(
        (a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0),
      )
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createChat.pending, (state) => {
        state.isCreatingChat = true
        state.error = null
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.isCreatingChat = false
        const chat = action.payload
        const existing = state.chats.find((item) => item.chatId === chat.chatId)

        if (!existing) {
          state.chats.unshift(chat)
          state.messagesByChatId[chat.chatId] = []
        }

        state.activeChatId = chat.chatId
      })
      .addCase(createChat.rejected, (state, action) => {
        state.isCreatingChat = false
        state.error = (action.payload as string) || 'Ошибка создания чата'
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.isSending = true
        state.error = null
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.isSending = false
        const message = action.payload
        const list = state.messagesByChatId[message.chatId] ?? []
        state.messagesByChatId[message.chatId] = [...list, message]

        const chat = state.chats.find((item) => item.chatId === message.chatId)
        if (chat) {
          chat.lastMessage = message.text
          chat.lastTimestamp = message.timestamp
        }

        state.chats.sort(
          (a, b) => (b.lastTimestamp ?? 0) - (a.lastTimestamp ?? 0),
        )
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.isSending = false
        state.error = (action.payload as string) || 'Ошибка отправки'
      })
  },
})

export const { setActiveChat, clearError, resetChats, addIncomingMessage } =
  chatsSlice.actions
export default chatsSlice.reducer
