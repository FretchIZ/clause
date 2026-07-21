"""API server that the Clause chat app calls to get AI responses."""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv(override=True)

app = FastAPI(title="Clause API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message]
    model: str = "mistral-large-latest"


class ChatResponse(BaseModel):
    reply: str
    model: str


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    from mistralai import Mistral

    client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
    res = await client.chat.complete_async(
        model=req.model,
        messages=[m.model_dump() for m in req.messages],
    )
    reply = res.choices[0].message.content
    return ChatResponse(reply=reply, model=req.model)
