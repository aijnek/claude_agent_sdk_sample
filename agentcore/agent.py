import json
from collections.abc import AsyncGenerator

from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock


def _build_prompt(prompt: str, history: list[dict] | None) -> str:
    if not history or len(history) <= 1:
        return prompt

    # Build context from previous messages (exclude the latest user message)
    previous = history[:-1]
    lines = ["<conversation_history>"]
    for msg in previous:
        role = msg["role"]
        content = msg["content"]
        lines.append(f"<{role}>{content}</{role}>")
    lines.append("</conversation_history>")
    lines.append("")
    lines.append(prompt)
    return "\n".join(lines)


async def run_agent(prompt: str, history: list[dict] | None = None) -> AsyncGenerator[str, None]:
    full_prompt = _build_prompt(prompt, history)
    options = ClaudeAgentOptions(max_turns=5)
    async for message in query(prompt=full_prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    yield json.dumps({"type": "text", "content": block.text})
    yield json.dumps({"type": "done"})
