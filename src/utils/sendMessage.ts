import { ChatCompletionRequestMessage } from 'openai'



// Run the user message through a RAG model to get the top 2 documents using OpenAI's API and the vector index

export const sendMessage = async (conversationId : any,messages: ChatCompletionRequestMessage[]) => {
  try {
    // Send the user's message to OpenAI's API
    const response = await fetch('/api/createMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conversationId, messages })
    })

    return await response.json()
  } catch (error) {
    console.log(error)
    throw error;
  }
}
