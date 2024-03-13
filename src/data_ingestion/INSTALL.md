# Ingest github data for the chat bot

This script ingest data from a given github repo to the `context` collection used as a source of knowledge for the chat bot. 

Install a mongodb shell `mongosh`:
```
brew install mongosh
```

Install the dependencies
```
npm install langchain
npm install ignore
```

Use script `mongosh_ingest.js` and replace your OPENAI_KEY with the placeholder `<YOUR_OPENAI_API>`

Connect to your cluster:
```
mongosh $MONGODB_ATLAS_URI
```

Copy paste  script `mongosh_ingest.js` to load the data.

This will create collection `context` inside `netlify_chat_demo`

The script also create a vector index ontop of this collection:
```
{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embedding",
      "similarity": "dotProduct",
      "type": "vector"
    }
  ]
}
```
