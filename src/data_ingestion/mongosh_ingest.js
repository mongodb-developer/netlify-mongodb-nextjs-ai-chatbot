const { GithubRepoLoader } = require("langchain/document_loaders/web/github");
const { compile } = require("html-to-text");
//const { RecursiveUrlLoader} = require("langchain/document_loaders/web/recursive_url");

const { OpenAIEmbeddings } = require('@langchain/openai'); // Import OpenAI embeddings

 const run = async () => {
  // Set up GitHub Repo Loader
  const loader = new GithubRepoLoader(
    "https://github.com/mongodb-developer/nodejs-quickstart",

    {
      branch: "master",
      recursive: true,
      unknown: "warn",
      maxConcurrency: 5,
    }
  );

  // Load documents from GitHub
  const docs = await loader.load();

 // Build the vector index
 db.context.createSearchIndex(
    "vector_index",
    "vectorSearch", //index type
    {
      fields: [
        {
          type: "vector",
          numDimensions: 1536,
          path: "embedding",
          similarity: "dotProduct"
        }]
    }
  );

  // Set up OpenAI embeddings
  const embeddings = new OpenAIEmbeddings({

    openAIApiKey: "<YOUR_OPENAI_API>", // Your OpenAI API key
    modelName: "text-embedding-3-large",
    dimensions: 1536
  });

  // Compute embeddings for each document
  for (const doc of docs) {
    const text = doc.pageContent; // Assuming 'content' contains the text of the document
    const respEmbed = await embeddings.embedDocuments([text]);
 

    use('netlify_chat_demo');
    console.log(`processing file ${doc.metadata.source} with embedding of ${respEmbed[0].length}`)
    db.context.insertOne({
      metadata: doc.metadata,
      pageContent: doc.pageContent,
      embedding: respEmbed[0]
    });

  }

  // Additional processing or cleanup if necessary
};

run().then(() => {
  console.log('Completed processing');
}).catch((err) => {
  console.error(err);
});
