# Claude Agent SDK Sample App

Claude Agent SDK と AWS Bedrock Agent Core を使ったサンプルアプリケーションです。プロンプトを受け取り、Claude Agent を実行してレスポンスを返します。

## 技術スタック

- Python >= 3.11
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) - Anthropic の Agent SDK
- [Bedrock Agent Core](https://github.com/aws/bedrock-agentcore) - AWS Bedrock ランタイム
- Starlette / Uvicorn - ASGI Web フレームワーク

## プロジェクト構成

```
agentcore/
  agent.py   # Claude Agent の実行ロジック
  app.py     # BedrockAgentCoreApp のエントリーポイント
```

## セットアップ

```bash
# 依存ライブラリのインストール
uv sync

# 環境変数の設定
cp .env.example .env
# .env に ANTHROPIC_API_KEY を設定
```

## 実行

```bash
uv run agentcore/app.py
```
