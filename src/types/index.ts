export type Credentials = {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type ChatMessage = {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: 'incoming' | 'outgoing'
  senderName?: string
}

export type Chat = {
  chatId: string
  phone: string
  name: string
  lastMessage?: string
  lastTimestamp?: number
}

export type TextMessageData = {
  typeMessage?: string
  textMessageData?: {
    textMessage?: string
  }
  extendedTextMessageData?: {
    text?: string
  }
}

export type NotificationBody = {
  typeWebhook?: string
  timestamp?: number
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    sender?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData?: TextMessageData
}

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
} | null

export type CheckAccountResponse = {
  exist?: boolean
  chatId?: string
  fromCache?: boolean
  status?: boolean
  reason?: string
}

export type SendMessageResponse = {
  idMessage: string
}
