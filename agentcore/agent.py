from claude_agent_sdk import query, ClaudeAgentOptions, AssistantMessage, TextBlock


async def run_agent(prompt: str) -> str:
    options = ClaudeAgentOptions(max_turns=5)
    result_parts = []
    async for message in query(prompt=prompt, options=options):
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    result_parts.append(block.text)
    return "\n".join(result_parts)
