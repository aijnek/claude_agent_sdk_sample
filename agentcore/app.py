from dotenv import load_dotenv

load_dotenv()

from bedrock_agentcore import BedrockAgentCoreApp

from agentcore.agent import run_agent

app = BedrockAgentCoreApp()


@app.entrypoint
async def handle_request(request):
    prompt = request.get("prompt", "")
    return await run_agent(prompt)


app.run()
