# CDK Infrastructure for ts-langchain-agent

このディレクトリには、CI/CD パイプライン（CodePipeline + CodeBuild + ECR）を構築する CDK コードが含まれています。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. コンテキスト設定ファイルの作成

`cdk.context.json.example` をコピーして `cdk.context.json` を作成し、実際の値を設定してください：

```bash
cp cdk.context.json.example cdk.context.json
```

`cdk.context.json` に以下の値を設定：

- `appUrl`: アプリケーションのURL（任意、デフォルト: `http://localhost:3000`）
- `callbackPath`: OAuth コールバックパス（任意、デフォルト: `/api/auth/callback/cognito`）

### 3. 環境変数の設定（任意）

`cdk.context.json` の代わりに、環境変数で設定することもできます：

```bash
export APP_URL=https://your-app-domain.com
export CALLBACK_PATH=/api/auth/callback/cognito
```

これらは設定しない場合、デフォルト値（`http://localhost:3000`）が使用されます。

### 4. デプロイ

```bash
npx cdk deploy
```

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## セキュリティ

`cdk.context.json` には機密情報（AWS リソース ARN など）が含まれるため、Git リポジトリにはコミットしないでください。
このファイルは `.gitignore` で除外されています。
