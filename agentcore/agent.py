import json
from collections.abc import AsyncGenerator

from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock


async def run_agent(prompt: str) -> AsyncGenerator[str, None]:
    options = ClaudeAgentOptions(max_turns=5)
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    yield json.dumps({"type": "text", "content": block.text})
    yield json.dumps({"type": "done"})
