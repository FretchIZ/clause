"""Chat workflow — takes a user message + history, calls Mistral, returns a reply."""

import mistralai.workflows as workflows
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str = "user"
    content: str


class ChatInput(BaseModel):
    messages: list[ChatMessage]
    model: str = "mistral-large-latest"


class ChatOutput(BaseModel):
    reply: str


@workflows.activity()
async def call_mistral(messages: list[dict], model: str) -> str:
    from mistralai import Mistral
    import os

    client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])
    res = await client.chat.complete_async(
        model=model,
        messages=messages,
    )
    return res.choices[0].message.content


@workflows.workflow.define(
    name="chat",
    workflow_display_name="Chat",
    workflow_description="Handles a chat conversation with Mistral.",
)
class ChatWorkflow:
    @workflows.workflow.entrypoint
    async def run(self, input: ChatInput) -> ChatOutput:
        messages = [m.model_dump() for m in input.messages]
        reply = await call_mistral(messages, input.model)
        return ChatOutput(reply=reply)
