# Claude Agent SDK Sample App

Claude Agent SDK と AWS Bedrock Agent Core を使ったサンプルアプリケーションです。チャット UI からプロンプトを送信し、Claude Agent がストリーミングでレスポンスを返します。

## アーキテクチャ

```
Frontend (Next.js :3000) → Backend (FastAPI :8001) → AgentCore (Bedrock :8080)
        ブラウザ               SSE streaming            SSE streaming
                                    ↕
                             SQLite (sessions.db)
```

Backend がセッション（会話履歴）を SQLite に永続化し、AgentCore にリクエストごとに履歴を渡すことでマルチターン会話を実現しています。

## 技術スタック

### バックエンド (Python >= 3.11)
- [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) - Anthropic の Agent SDK
- [Bedrock Agent Core](https://github.com/aws/bedrock-agentcore) - AWS Bedrock ランタイム
- FastAPI + sse-starlette - SSE ストリーミング対応の API サーバー
- httpx - AgentCore への非同期 HTTP クライアント
- [DBOS](https://docs.dbos.dev/) - FastAPI 統合（Phase 2 でワークフロー管理に活用予定）
- SQLite - セッション・メッセージの永続化

### フロントエンド
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui

## プロジェクト構成

```
agentcore/
  agent.py           # Claude Agent の実行ロジック（履歴をプロンプトに組み込み）
  app.py             # BedrockAgentCoreApp のエントリーポイント
backend/
  main.py            # FastAPI サーバー（セッション管理 + AgentCore プロキシ）
  dbos_config.py     # DBOS 初期化設定
  session.py         # セッション・メッセージ CRUD（SQLite）
  schema.sql         # DB スキーマ定義
frontend/
  src/
    app/page.tsx     # ルートページ
    components/      # Chat UI コンポーネント
    lib/             # SSE ストリーム処理（session_id 管理含む）
    types/           # 型定義
```

## セッション管理

### 仕組み

1. フロントエンドが `/chat` にリクエストを送信（初回は `session_id` なし）
2. Backend が新しいセッションを作成し、ユーザーメッセージを SQLite に保存
3. 会話履歴を取得して AgentCore に送信
4. AgentCore が履歴をプロンプトに組み込んで Claude に問い合わせ
5. アシスタントの応答を SQLite に保存し、`session_id` をフロントエンドに返却
6. 以降のリクエストでは同じ `session_id` を使用し、会話が継続される

### SQLite と DBOS の使い分け

- **SQLite（現在）**: セッション・メッセージの CRUD に使用。DBOS の `@transaction()` はワークフローコンテキストが必要で単純な CRUD には過剰なため、プレーン SQLite で実装
- **DBOS（現在）**: FastAPI ライフサイクル統合として初期化。Phase 2 で durable workflow 機能を活用予定
- **PostgreSQL（将来）**: 環境変数 `DBOS_DATABASE_URL` を設定すると DBOS 側は PostgreSQL に切り替わる。セッション DB も同様に PostgreSQL 対応予定

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

## ロードマップ

### Phase 1（完了）: DBOS + セッション管理 + マルチターン対応
- SQLite によるセッション・メッセージの永続化
- 会話履歴をプロンプトに組み込んでマルチターン会話を実現
- DBOS の FastAPI 統合

### Phase 2（予定）: Human-in-the-loop
- Agent が `ask_human` ツールを使い、フロントエンドにユーザー確認を求める
- DBOS の durable workflow を活用した中断・再開の管理
- Agent が reason / question / options を提示し、ユーザーの選択に基づいて処理を継続
