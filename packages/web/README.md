# Web Application

NextAuth.js と AWS Cognito を使用した認証機能を持つ Next.js アプリケーションです。

## 目次

- [機能](#機能)
- [セットアップ手順](#セットアップ手順)
- [プロジェクト構成](#プロジェクト構成)
- [実装されている機能](#実装されている機能)
- [使い方](#使い方)
- [デプロイ](#デプロイ)
- [トラブルシューティング](#トラブルシューティング)

## 機能

- **認証**: AWS Cognito による OAuth 2.0 認証
- **セッション管理**: NextAuth.js によるセッション管理
- **TypeScript**: 完全な型安全性
- **Tailwind CSS**: モダンなUIデザイン
- **Server Components**: Next.js 14+ の App Router に対応

## セットアップ手順

### 前提条件

- AWS アカウント
- AWS CLI がインストールされ、設定されている
- Node.js と pnpm がインストールされている
- AWS CDK がインストールされている（`npm install -g aws-cdk`）

### 1. AWS Cognito User Pool のデプロイ

#### 1.1 CDK のブートストラップ（初回のみ）

```bash
cd packages/infra
pnpm install
pnpm cdk bootstrap
```

#### 1.2 AuthStack のデプロイ

```bash
pnpm cdk deploy AuthStack
```

デプロイが完了すると、以下の情報が出力されます：

```
Outputs:
AuthStack.UserPoolId = ap-northeast-1_XXXXXXXXX
AuthStack.UserPoolClientId = xxxxxxxxxxxxxxxxxxxx
AuthStack.CognitoIssuer = https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_XXXXXXXXX
AuthStack.CognitoDomain = langchain-agent-123456789012
```

これらの値をメモしておいてください。

### 2. Cognito Client Secret の取得

AWS CLIから取得：

```bash
aws cognito-idp describe-user-pool-client \
  --user-pool-id <UserPoolId> \
  --client-id <UserPoolClientId> \
  --query 'UserPoolClient.ClientSecret' \
  --output text
```

または、AWS Console から：
1. [Amazon Cognito Console](https://console.aws.amazon.com/cognito/) にアクセス
2. 該当のUser Poolを選択
3. "App integration" タブ → "App clients and analytics" を選択
4. 該当のApp Clientを選択
5. "Client Secret" の値をコピー

出力された Client Secret をメモしておいてください。

### 3. テストユーザーの作成

#### 管理者としてユーザーを作成

```bash
aws cognito-idp admin-create-user \
  --user-pool-id <UserPoolId> \
  --username admin@example.com \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --temporary-password "TempPassword123!" \
  --message-action SUPPRESS
```

#### パスワードを永続的に設定

```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id <UserPoolId> \
  --username admin@example.com \
  --password "YourSecurePassword123!" \
  --permanent
```

### 4. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定します：

```bash
cd packages/web
cp env.example .env.local
```

`.env.local` を編集：

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<openssl rand -base64 32 で生成>
COGNITO_CLIENT_ID=<UserPoolClientId>
COGNITO_CLIENT_SECRET=<Client Secret>
COGNITO_ISSUER=<CognitoIssuer>
```

#### NEXTAUTH_SECRET の生成

以下のコマンドで安全なシークレットを生成できます：

```bash
openssl rand -base64 32
```

生成された文字列を `NEXTAUTH_SECRET` に設定してください。

### 5. アプリケーションの起動

```bash
pnpm install
pnpm dev
```

ブラウザで `http://localhost:3000` を開き、作成したユーザーでログインテストを行います。

## プロジェクト構成

```
packages/web/
├── app/                      # Next.js App Router
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/  # NextAuth.js API routes
│   │   └── protected/          # 保護されたAPI例
│   ├── auth/
│   │   ├── signin/             # カスタムサインインページ
│   │   └── error/              # 認証エラーページ
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # ホームページ
├── components/
│   ├── auth/                   # 認証関連コンポーネント
│   │   ├── LoginButton.tsx
│   │   └── AccessToken.tsx
│   └── providers/              # React Context Providers
│       └── SessionProvider.tsx
├── lib/                        # ユーティリティ関数
└── types/                      # TypeScript型定義
    └── next-auth.d.ts         # NextAuth型拡張
```

## 実装されている機能

### 認証API

- **API Route**: `/app/api/auth/[...nextauth]/route.ts`
  - NextAuth.js の設定とハンドラー
  - Cognito Provider の設定
  - JWT と Session のカスタムコールバック

### コンポーネント

1. **NextAuthProvider** (`/components/providers/SessionProvider.tsx`)
   - セッション状態を管理するプロバイダー
   - クライアントコンポーネントとしてラップ

2. **LoginButton** (`/components/auth/LoginButton.tsx`)
   - サインイン/サインアウトボタン
   - セッション状態の表示

3. **AccessToken** (`/components/auth/AccessToken.tsx`)
   - アクセストークンの表示（ログイン時のみ）

### ページ

- `app/page.tsx`: ホームページ
- `app/auth/signin/page.tsx`: カスタムサインインページ
- `app/auth/error/page.tsx`: 認証エラーページ

### 保護されたAPI

- **Protected Route**: `/app/api/protected/route.ts`
  - 認証が必要なAPIエンドポイントの例
  - `getServerSession` を使用してサーバーサイドでセッションを確認

### 型定義

- **TypeScript Types**: `/types/next-auth.d.ts`
  - NextAuth.js のセッションとJWTの型拡張
  - カスタムプロパティ（accessToken）の追加

## 使い方

### クライアントサイドでのセッション取得

```tsx
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  
  if (session) {
    return <div>Signed in as {session.user?.email}</div>;
  }
  
  return <div>Not signed in</div>;
}
```

### サーバーサイドでのセッション取得

```tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ServerComponent() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    return <div>Signed in as {session.user?.email}</div>;
  }
  
  return <div>Not signed in</div>;
}
```

### サインイン/サインアウト

```tsx
import { signIn, signOut } from "next-auth/react";

// サインイン
<button onClick={() => signIn()}>Sign in</button>

// 特定のプロバイダーでサインイン
<button onClick={() => signIn("cognito")}>Sign in with Cognito</button>

// サインアウト
<button onClick={() => signOut()}>Sign out</button>
```

## 認証フロー

このアプリケーションは AWS Cognito を使用して認証を行います：

1. ユーザーが「Sign in」ボタンをクリック
2. カスタムサインインページ（`/auth/signin`）が表示される
3. 「Sign in with Cognito」をクリックすると、Cognito Hosted UI にリダイレクト
4. ユーザーがCognitoでログイン（メールアドレス/パスワード）
5. 認証成功後、コールバックURL（`/api/auth/callback/cognito`）経由でアプリに戻る
6. NextAuth.jsがセッションを作成し、ユーザーは認証済み状態に

## AWS Cognito の設定詳細

### Cognito User Pool の構成

このプロジェクトのCognito User Poolは以下の設定で構成されています：

- **サインイン方法**: メールアドレス
- **自己登録**: 有効
- **メール検証**: 自動
- **パスワードポリシー**: 
  - 最小8文字
  - 大文字、小文字、数字、記号を含む
- **OAuth フロー**: Authorization Code Grant
- **OAuth スコープ**: email, openid, profile

### Callback URL の更新

本番環境にデプロイする際は、`packages/infra/lib/auth-stack.ts` の `callbackUrls` を更新してください：

```typescript
callbackUrls: [
  "http://localhost:3000/api/auth/callback/cognito",
  "https://your-production-domain.com/api/auth/callback/cognito",
],
logoutUrls: [
  "http://localhost:3000",
  "https://your-production-domain.com",
],
```

その後、CDKを再デプロイします：

```bash
cd packages/infra
pnpm cdk deploy AuthStack
```

## 開発

```bash
# 開発サーバーの起動
pnpm dev

# ビルド
pnpm build

# 本番サーバーの起動
pnpm start

# リンター実行
pnpm lint
```

## 環境変数

必要な環境変数：

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated-secret>

# AWS Cognito
COGNITO_CLIENT_ID=<your-client-id>
COGNITO_CLIENT_SECRET=<your-client-secret>
COGNITO_ISSUER=https://cognito-idp.{region}.amazonaws.com/{UserPoolId}
```

## デプロイ

### Vercel へのデプロイ

#### 1. Vercel プロジェクトの作成

```bash
# Vercel CLI のインストール（初回のみ）
npm i -g vercel

# プロジェクトのリンク
cd packages/web
vercel link
```

#### 2. 本番環境の Callback URL を追加

まず、本番環境のURLを確認します（例: `https://your-app.vercel.app`）

CDK のコードを更新：

```typescript
// packages/infra/lib/auth-stack.ts
callbackUrls: [
  "http://localhost:3000/api/auth/callback/cognito",
  "https://your-app.vercel.app/api/auth/callback/cognito", // 追加
],
logoutUrls: [
  "http://localhost:3000",
  "https://your-app.vercel.app", // 追加
],
```

AuthStack を再デプロイ：

```bash
cd packages/infra
pnpm cdk deploy AuthStack
```

#### 3. Vercel の環境変数を設定

Vercel Dashboard で以下の環境変数を設定：

```env
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<本番用のシークレット>
COGNITO_CLIENT_ID=<UserPoolClientId>
COGNITO_CLIENT_SECRET=<Client Secret>
COGNITO_ISSUER=<CognitoIssuer>
```

または CLI から設定：

```bash
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add COGNITO_CLIENT_ID production
vercel env add COGNITO_CLIENT_SECRET production
vercel env add COGNITO_ISSUER production
```

#### 4. デプロイ

```bash
vercel --prod
```

### AWS Amplify へのデプロイ

1. AWS Amplify Console にアクセス
2. リポジトリを接続
3. ビルド設定を確認
4. 環境変数を設定（Vercel と同じ）
5. デプロイ

### Docker でのデプロイ

Dockerfileの例：

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

ビルドと実行：

```bash
docker build -t nextauth-app .
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=https://your-domain.com \
  -e NEXTAUTH_SECRET=<secret> \
  -e COGNITO_CLIENT_ID=<client-id> \
  -e COGNITO_CLIENT_SECRET=<client-secret> \
  -e COGNITO_ISSUER=<issuer> \
  nextauth-app
```

### デプロイ後の動作確認

#### 1. 基本的な認証フロー

1. アプリケーションにアクセス
2. "Sign in" ボタンをクリック
3. Cognito Hosted UI でログイン
4. リダイレクト後、ユーザー情報が表示されることを確認

#### 2. 保護されたAPIのテスト

```bash
# 未認証でのアクセス（401エラーが返る）
curl https://your-app.vercel.app/api/protected

# 認証後、ブラウザの開発者ツールでセッションCookieを確認し、
# Cookie付きでリクエストすると成功する
```

## トラブルシューティング

### Client Secret が見つからない

CDKでデプロイした直後は、Client Secretが出力に含まれません。AWS CLIまたはConsoleから取得してください。

### Callback URL エラー

**エラー**: `redirect_uri_mismatch`

**解決策**: 
- Cognito の App Client 設定で正しい Callback URL が登録されているか確認
- `NEXTAUTH_URL` 環境変数が正しく設定されているか確認
- CDK を再デプロイ

### Session が取得できない

**エラー**: `useSession` が常に `null` を返す

**解決策**:
- `NEXTAUTH_SECRET` が設定されているか確認
- ブラウザの Cookie が有効になっているか確認
- HTTPS を使用しているか確認（本番環境）

### ログインエラーが発生する

1. `.env.local` の環境変数が正しく設定されているか確認
2. `COGNITO_ISSUER` のフォーマットが正しいか確認（`https://cognito-idp.{region}.amazonaws.com/{UserPoolId}`）
3. Callback URLが正しく設定されているか確認
4. Cognitoユーザーが作成され、メール認証済みか確認

### Cognito ユーザーが見つからない

**エラー**: `User does not exist`

**解決策**:
- ユーザーが正しく作成されたか確認
- メールアドレスが検証済みか確認（`email_verified=true`）

## セキュリティのベストプラクティス

1. **NEXTAUTH_SECRET の管理**
   - 強力なランダム文字列を使用
   - 環境ごとに異なるシークレットを使用
   - シークレットマネージャーで管理（AWS Secrets Manager など）

2. **Cognito の設定**
   - MFA（多要素認証）を有効化
   - パスワードポリシーを強化
   - アカウントロックアウトポリシーを設定

3. **HTTPS の使用**
   - 本番環境では必ず HTTPS を使用
   - HSTS ヘッダーを設定

4. **CORS の設定**
   - 必要最小限のオリジンのみ許可

## モニタリング

### CloudWatch Logs

Cognito のログを確認：

```bash
aws logs tail /aws/cognito/userpools/<UserPoolId> --follow
```

### NextAuth デバッグモード

開発環境で詳細なログを有効化：

```env
# .env.local
NEXTAUTH_DEBUG=true
```

## コスト最適化

### Cognito の料金

- MAU（Monthly Active Users）ベースの課金
- 最初の50,000 MAU は無料
- 詳細: https://aws.amazon.com/cognito/pricing/

### Vercel の料金

- Hobby プランは無料（個人プロジェクト用）
- Pro プラン以上が商用利用に推奨
- 詳細: https://vercel.com/pricing

## 参考リンク

- [NextAuth.js Documentation](https://next-auth.js.org)
- [NextAuth.js Cognito Provider](https://next-auth.js.org/providers/cognito)
- [NextAuth.js Deployment](https://next-auth.js.org/deployment)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/overview)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [AWS CDK Cognito Documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_cognito-readme.html)
- [AWS CDK Best Practices](https://docs.aws.amazon.com/cdk/v2/guide/best-practices.html)
- [AWS Cognito Security Best Practices](https://docs.aws.amazon.com/cognito/latest/developerguide/security-best-practices.html)
