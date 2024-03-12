import { NextApiRequest, NextApiResponse } from 'next'
import { getConversationHistory } from '../../utils/database'

export default async function getConversations(req : NextApiRequest, res: NextApiResponse) {

  try{
    const { query } = req;

    if (query){
      console.log(query)
    }

    const conversationHistory = await getConversationHistory();
    res.status(200).json({"history" :conversationHistory})
  }
  catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
