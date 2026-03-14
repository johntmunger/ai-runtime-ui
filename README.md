# runtime-ui

A lightweight **chat interface** for interacting with the AI runtime system.

This application allows users to ask developer questions and receive answers grounded in documentation retrieved through a Retrieval-Augmented Generation (RAG) pipeline.

The interface connects to the `ai-runtime-server` API and renders responses with source citations.

---

# What This Repository Does

`runtime-ui` provides the **user-facing chat interface** for the system.

Responsibilities include:

- sending user questions to the runtime API
- rendering model responses
- displaying source citations
- formatting markdown and code blocks

The UI is intentionally minimal and exists primarily as a **demo interface for the runtime system**.

---

# System Architecture

This repository represents the **user interface layer** of the system.

```
                 USER
                  │
                  ▼
            ┌─────────────┐
            │  runtime-ui │
            │ React Chat  │
            └─────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │   ai-runtime-server   │
       │   RAG Runtime API     │
       └──────────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  control-plane  │
         │ Agent Runtime   │
         └─────────────────┘
                  │
                  ▼
           ┌──────────────┐
           │   rag-mdn     │
           │ Knowledge     │
           │ Ingestion     │
           └──────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Postgres +      │
         │ pgvector        │
         │ Vector Database │
         └─────────────────┘
```

---

# Example Query

Users can ask questions such as:

> What is a JavaScript closure?

The system will:

1. send the query to the runtime server  
2. retrieve relevant documentation  
3. generate an answer using the retrieved context  
4. display the response with citations

---

# Running Locally

Start the development server:

```bash
npm run dev
```

The UI will be available at:

**http://localhost:5173**

The interface expects the runtime API to be available at:

**http://localhost:3000**

---

# Related Repositories

This project is part of a modular system.

| Repository | Purpose |
|------------|---------|
| control-plane | agent runtime architecture |
| ai-runtime-server | RAG runtime and chat API |
| rag-mdn | documentation ingestion and embeddings |
| runtime-ui | chat interface demo |

---

# Future Improvements

Planned improvements include:

- hosted demo environment
- streaming responses
- improved citation rendering
- additional example prompts
- expanded developer UX

---

# Summary

`runtime-ui` provides a minimal **chat interface for interacting with the AI runtime system**.

It allows users to explore how retrieval-grounded responses are generated using the runtime and documentation knowledge base.
