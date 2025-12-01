import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";
import * as agentcore from "@aws-cdk/aws-bedrock-agentcore-alpha";

export class AgentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ローカルのDockerイメージをビルド
    const agentRuntimeArtifact = agentcore.AgentRuntimeArtifact.fromAsset(
      path.join(__dirname, "../../agent"),
    );

    // AgentCore Runtime (L2 Construct)
    const runtime = new agentcore.Runtime(this, "AgentRuntime", {
      runtimeName: "LangChainAgent",
      agentRuntimeArtifact: agentRuntimeArtifact,
      description: "LangChain Agent with tools",
    });

    // 出力
    new cdk.CfnOutput(this, "RuntimeArn", {
      value: runtime.agentRuntimeArn,
    });
  }
}