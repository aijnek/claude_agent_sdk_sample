# Claude Agent SDK Sample App

Claude Agent SDK と AWS Bedrock Agent Core を使ったサンプルアプリケーションです。チャット UI からプロンプトを送信し、Claude Agent がストリーミングでレスポンスを返します。

## アーキテクチャ

```
Frontend (Next.js :3000) → Backend (FastAPI :8001) → AgentCore (Bedrock :8080)
        ブラウザ               SSE streaming            SSE streaming
```

## 技術スタック

### バックエンド (Python >= 3.11)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) - Anthropic の Agent SDK
- [Bedrock Agent Core](https://github.com/aws/bedrock-agentcore) - AWS Bedrock ランタイム
- FastAPI + sse-starlette - SSE ストリーミング対応の API サーバー
- httpx - AgentCore への非同期 HTTP クライアント

### フロントエンド
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui

## プロジェクト構成

```
agentcore/
  agent.py           # Claude Agent の実行ロジック
  app.py             # BedrockAgentCoreApp のエントリーポイント
backend/
  main.py            # FastAPI サーバー（AgentCore へのプロキシ）
frontend/
  src/
    app/page.tsx     # ルートページ
    components/      # Chat UI コンポーネント
    lib/             # SSE ストリーム処理
    types/           # 型定義
```

## セットアップ

```bash
# Python 依存ライブラリのインストール
uv sync

# フロントエンド依存ライブラリのインストール
cd frontend && npm install

# 環境変数の設定
cp .env.example .env
# .env に ANTHROPIC_API_KEY を設定
```

## 実行

3 つのプロセスをそれぞれ別ターミナルで起動します。

```bash
# 1. AgentCore サーバー (port 8080)
uv run python -m agentcore.app

# 2. FastAPI バックエンド (port 8001)
uv run uvicorn backend.main:app --port 8001

# 3. フロントエンド (port 3000)
cd frontend && npm run dev
```

http://localhost:3000 にアクセスしてチャットを開始できます。
