import { useToast } from '@apideck/components'
import { ChatCompletionRequestMessage } from 'openai'
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import { sendMessage } from './sendMessage'
import { newConversation } from './useConversations'

interface ContextProps {
  messages: ChatCompletionRequestMessage[]
  setMessages: (messages: ChatCompletionRequestMessage[]) => void
  addMessage: (content: string) => Promise<void>
  isLoadingAnswer: boolean
  clearMessages: () => void
}

const ChatsContext = createContext<Partial<ContextProps>>({})

export function MessagesProvider({ children }: { children: ReactNode }) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [isLoadingAnswer, setIsLoadingAnswer] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  useEffect(() => {
    const initializeChat = async () => {

      const systemMessage: ChatCompletionRequestMessage = {
        role: 'system',
        content: 'You are code repo expert assistat, trained by Open AI and MongoDB Atlas vector search. Please answer only in a given context. Otherwise note that you dont have enough infomation'
      }
      const welcomeMessage: ChatCompletionRequestMessage = {
        role: 'assistant',
        content: 'Hi, I want to help learn how to code with MongoDB and the NodeJS driver, what question do you have?'
      }
      setMessages([systemMessage, welcomeMessage])
      const conversationId = await newConversation()
      setConversationId(conversationId)

    }

    // When no messages are present, we initialize the chat the system message and the welcome message
    // We hide the system message from the user in the UI
    if (!messages?.length) {
      initializeChat()
      
    }
  }, [messages?.length, setMessages])

  const clearMessages = () => {
    setMessages([])
  }


  const addMessage = async (content: string) => {
    setIsLoadingAnswer(true)
    try {
      const newMessage: ChatCompletionRequestMessage = {
        role: 'user',
        content
      }
      const newMessages = [...messages, newMessage]

      // Add the user message to the state so we can see it immediately
      setMessages(newMessages)

      const { data } = await sendMessage(conversationId,newMessages)
      const reply = data.choices[0].message

      // Add the assistant message to the state
      setMessages([...newMessages, reply])
    } catch (error: any) {
      // Show error when something goes wrong
      addToast({ title: 'An error occurred' , description: error.message , type: 'error' })
    } finally {
      setIsLoadingAnswer(false)
    }
  }

  return (
    <ChatsContext.Provider value={{ messages,setMessages, addMessage, isLoadingAnswer, clearMessages }}>
      {children}
    </ChatsContext.Provider>
  )
}

export const useMessages = () => {
  return useContext(ChatsContext) as ContextProps
}
