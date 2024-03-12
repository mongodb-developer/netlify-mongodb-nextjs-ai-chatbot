


export const newConversation = async () => {
    try {
        const response = await fetch('/api/createConversation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
        , body: JSON.stringify({ user: 'Test' })
        })
    
        return await response.json()
    } catch (error) {
        console.log(error)
        throw error;
    }
    }

export const getConversationHistory = async () => {
    try {
        const response = await fetch('/api/getConversations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
        })
    
        return await response.json()
    } catch (error) {
        console.log(error)
        throw error;
    }
    }
