import json
from typing import Optional

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

from backend.dbos_config import init_dbos
from backend.session import create_session, get_conversation_history, init_db, save_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_dbos(app)

AGENTCORE_URL = "http://localhost:8080/invocations"
DEFAULT_PORT = 8001


class ChatRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None


@app.on_event("startup")
async def startup():
    init_db()


@app.post("/chat")
async def chat(request: ChatRequest):
    session_id = request.session_id or create_session()

    save_message(session_id, "user", request.prompt)

    history = get_conversation_history(session_id)

    async def event_generator():
        assistant_content = ""
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                AGENTCORE_URL,
                json={"prompt": request.prompt, "history": history},
                timeout=300.0,
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data:"):
                        data = line[len("data:") :].strip()
                        if data:
                            event = json.loads(data)
                            if event.get("type") == "text":
                                assistant_content += event["content"]
                            elif event.get("type") == "done":
                                event["session_id"] = session_id
                            yield json.dumps(event)

        if assistant_content:
            save_message(session_id, "assistant", assistant_content)

    return EventSourceResponse(event_generator())
