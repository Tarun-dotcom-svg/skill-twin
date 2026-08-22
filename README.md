# Skill Twin - TypeScript + MongoDB

An AI assistant that learns from previous interactions.

## Architecture

Request -> Classifier -> LangGraph workflow -> MongoDB memory retrieval -> Gemini -> MongoDB storage -> Response

## Stack

- TypeScript / Node.js
- Express
- LangGraph
- LangChain
- Google Gemini
- MongoDB with Mongoose

## Setup

```bash
npm install
```

Create `.env` from `.env.example` and add your Gemini API key and MongoDB URI.

Run development server:

```bash
npm run dev
```

Build:

```bash
npm run build
npm start
```

## API

POST `/chat`

```json
{
  "userId": "user-1",
  "message": "Explain LangGraph state"
}
```

Response:

```json
{
  "category": "learning",
  "response": "..."
}
```
