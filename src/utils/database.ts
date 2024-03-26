import { Double, MongoClient, ObjectId } from "mongodb";

// MongoDB Client
let db: MongoClient;

const uri = process.env.MONGODB_ATLAS_URI || 'your_mongodb_uri_here'; // Replace with your MongoDB URI
const dbName = process.env.MONGODB_DATABASE; // Replace with your database name
const collectionName = 'messageHistory';

const sourceCollection = process.env.MONGODB_SOURCE_COLLECTION || 'github_repo'
const sourceDatabase = process.env.MONGODB_DATABASE

// Initialize MongoDB Client
export async function initDB() {
  try {
  
    if (!db) {
      if (!process.env.MONGODB_ATLAS_URI) {
        throw new Error('MONGODB_ATLAS_URI is not defined');
      }
      db = await MongoClient.connect(uri);
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

// Define message structure
export interface Message {
  userId: string;
  chat: any[]; // Replace 'any' with a more specific type if possible
  total: number;
}

// Save messages to the database
export async function saveToDatabase(conversationId: ObjectId, messages: Message[]) {
  try {
    if (!messages) {
      return;
    }

    await initDB();

    // Creates or updates a document in the collection with the specified conversationId
    const result = await db.db(dbName).collection(collectionName).updateOne(
      { conversationId : conversationId},
      { $set: { chat: messages, total: messages.length  }},

      { upsert: true }
    );

    console.log(`Chat conversation documents saved into the collection`);
    return result;
  } catch (err) {
    console.error(err);
    throw err; // Propagate the error so it can be handled in the calling code
  }
}



// getVectorQuery
//
// This function retrieves the top 5 documents from the vector index that are closest to the provided embedding.
export async function getVectorQuery(embedding: Double[]) {
  try {
    await initDB();
    const pipeline = [
        { 
            "$vectorSearch": {
                "index" : "vector_index",
                "queryVector": embedding,
                "path": "embedding",
                "numCandidates": 5,
                "limit": 2

            }
        },
    {
        "$project": {
           "embedding": 0
        }
    }]
    const documents = await db.db(sourceDatabase).collection(sourceCollection).aggregate(pipeline).toArray()

    return documents;
} catch (err) {
    console.error(err);
    throw err;
  }
}

// getConversationHistory
//
// This function retrieves the last 10 conversations from the database.
export async function getConversationHistory()
{
  try {
    await initDB();
    if (!process.env.MONGODB_DATABASE) {
      throw new Error('MONGODB_DATABASE is not defined');
    }
    if (!process.env.MONGODB_SOURCE_COLLECTION) {
      throw new Error('MONGODB_SOURCE_COLLECTION is not defined');
    }
    const conversations = await db.db(dbName).collection(collectionName).find({}).sort({"_id" : -1}).limit(10).toArray();
    return conversations;
  } catch (err) {
    console.error(err);
    throw err;
  }
}