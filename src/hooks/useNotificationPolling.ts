import { useEffect, useRef } from 'react'
import {
  deleteNotification,
  receiveNotification,
} from '../api/greenApi'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { addIncomingMessage } from '../store/chatsSlice'
import type { ChatMessage, NotificationBody } from '../types'

function extractText(body: NotificationBody): string | null {
  const data = body.messageData
  if (!data) return null

  if (data.typeMessage === 'textMessage') {
    return data.textMessageData?.textMessage?.trim() || null
  }

  if (data.typeMessage === 'extendedTextMessage') {
    return data.extendedTextMessageData?.text?.trim() || null
  }

  return null
}

function toIncomingMessage(body: NotificationBody): ChatMessage | null {
  if (body.typeWebhook !== 'incomingMessageReceived') {
    return null
  }

  const text = extractText(body)
  const chatId = body.senderData?.chatId
  const idMessage = body.idMessage

  if (!text || !chatId || !idMessage) {
    return null
  }

  return {
    id: idMessage,
    chatId,
    text,
    timestamp: body.timestamp ?? Math.floor(Date.now() / 1000),
    direction: 'incoming',
    senderName:
      body.senderData?.senderName ||
      body.senderData?.chatName ||
      body.senderData?.senderContactName,
  }
}

export function useNotificationPolling(enabled: boolean) {
  const dispatch = useAppDispatch()
  const credentials = useAppSelector((state) => state.auth.credentials)
  const cancelledRef = useRef(false)

  useEffect(() => {
    if (!enabled || !credentials) {
      return
    }

    cancelledRef.current = false

    const poll = async () => {
      while (!cancelledRef.current) {
        try {
          const notification = await receiveNotification(credentials, 20)

          if (cancelledRef.current) {
            break
          }

          if (!notification) {
            continue
          }

          const message = toIncomingMessage(notification.body)
          if (message) {
            dispatch(addIncomingMessage(message))
          }

          await deleteNotification(credentials, notification.receiptId)
        } catch {
          if (cancelledRef.current) {
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
    }

    void poll()

    return () => {
      cancelledRef.current = true
    }
  }, [credentials, dispatch, enabled])
}
