import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      {
        error: "You must be signed in to use the agent.",
      },
      { status: 401 }
    );
  }

  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    // Agent Core APIエンドポイント
    const agentCoreUrl = process.env.AGENT_CORE_API_URL;
    if (!agentCoreUrl) {
      return NextResponse.json(
        {
          error: "Agent Core API URL is not configured.",
        },
        { status: 500 }
      );
    }

    // Agent Coreにリクエストを送信
    // agentCoreUrl は既に /invocations を含んでいる形式
    const response = await fetch(agentCoreUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({
        prompt: message,
      }),
    });
    
    console.log("response", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Agent Core API error:", errorText);
      return NextResponse.json(
        {
          error: `Agent Core API error: ${response.status}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error invoking agent:", error);
    return NextResponse.json(
      {
        error: "Failed to invoke agent.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

