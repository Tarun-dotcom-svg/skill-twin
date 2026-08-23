# Skill Twin — TypeScript + LangGraph + Gemini + MongoDB Vector Search

Skill Twin is an AI assistant that learns from previous interactions. Each request is classified, routed through a LangGraph workflow, answered by Google Gemini, embedded with Gemini Embeddings, and stored in MongoDB for future semantic memory retrieval.

## Architecture

```text
User request
   ↓
LangGraph
   ↓
Classifier
   ↓
Gemini Embedding (query, 768 dimensions)
   ↓
MongoDB Atlas Vector Search
   ↓
Relevant memories
   ↓
Gemini response
   ↓
Gemini Embedding (document, 768 dimensions)
   ↓
MongoDB interactions collection
```

## Stack

- TypeScript / Node.js
- Express
- LangChain
- LangGraph
- Google Gemini (`gemini-2.5-flash` for chat)
- Google Gemini Embeddings (`gemini-embedding-001`)
- MongoDB Atlas Vector Search
- Mongoose

## Important vector configuration

This project intentionally uses **768-dimensional** Gemini embeddings. The MongoDB Vector Search index must also use:

```json
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 768,
      "similarity": "cosine"
    },
    {
      "type": "filter",
      "path": "userId"
    }
  ]
}
```

The application attempts to create `skill_twin_vector_index` automatically on startup if it does not exist.

## Setup

1. Copy `.env.example` to `.env`.
2. Add your Gemini API key and MongoDB connection string.
3. The default database is `skill_twin`. MongoDB creates the database when the first interaction is stored.
4. Install packages:

```bash
npm install
```

5. Start:

```bash
npm run dev
```

## API

### POST `/chat`

Request:

```json
{
  "userId": "user-4",
  "message": "Explain RAG"
}
```

Response:

```json
{
  "category": "learning",
  "response": "..."
}
```

### GET `/health`

```text
http://localhost:3000/health
```

## MongoDB data

Documents are stored in:

```text
skill_twin
└── interactions
    ├── userId
    ├── message
    ├── response
    ├── category
    ├── embedding   ← 768 numbers
    └── createdAt
```

## If you already created a 768-dimensional index

You can keep it only if it is on the same database/collection configured in `.env` and its vector path is `embedding` with `numDimensions: 768`.

If an existing index has 3072 dimensions or another dimension, recreate/update it so it matches 768. The query vector and stored vectors must have the same dimension.

## GitHub

Do not commit `.env` or `node_modules`. The included `.gitignore` already excludes them.
