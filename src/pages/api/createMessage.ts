import { NextApiRequest, NextApiResponse } from 'next'
import { ChatCompletionRequestMessage } from 'openai'
import { getVectorQuery, saveToDatabase } from '../../utils/database'

// This function is called when the user sends a message
// It sends the message to OpenAI's API and returns the response
// It also saves the message to the database
export default async function createMessage(req: NextApiRequest, res: NextApiResponse) {
  const { messages, conversationId } = req.body
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined');
  }
  const apiKey = process.env.OPENAI_API_KEY
  const url = 'https://api.openai.com/v1/chat/completions'


  try {
    // Get the embeddings for the user's message
    const embedding = await getEmbeddings(messages.filter((m: ChatCompletionRequestMessage  ) => m.role === 'user').map((m : ChatCompletionRequestMessage) => m.content)[0]);

    // Get the top 5 movies that are closest to the user's message
    const documents = await getVectorQuery(embedding);
    let context: string = `Taking into account the last messages from the user ${JSON.stringify(messages)}, the following code is relevant:`
    if (documents.length > 0) {
      context = context + ' Code you must consider: ' + JSON.stringify(documents) + " Also prompt the source URL for the code including 'metadata.source' file. If the code is unrelated to the user message answer as you like."
    }
    else {
      context = context + ` Notify the user there is no context from the database, make sure they verify if the embeedings are set on collection ${process.env.MONGODB_SOURCE_COLLECTION}`
    }
    // Add a system message to the messages array
    messages.push({
      role: 'system',
      content: context
    })

    
    // Send the user's message to OpenAI's API
    const body = JSON.stringify({
      messages,
      model: 'gpt-3.5-turbo',
      stream: false
    })

    // Send the user's message to OpenAI's API
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body
    })
    const data = await response.json()

    
    res.status(200).json({ data })
    messages.push({
      role: 'assistant',
      content: data.choices[0].message.content
    })

    await saveToDatabase(conversationId,messages)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

async function getEmbeddings(message: string) {
  const apiKey = process.env.OPENAI_API_KEY
  const url = 'https://api.openai.com/v1/embeddings';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      // The field inside your document that contains the data to embed, here it is the “plot” field from the sample movie data.
      input: JSON.stringify(message),
      model: "text-embedding-3-large",
      dimensions: 1536
  })
  })
  const openaiResp = await response.json()

  return openaiResp.data[0].embedding
}