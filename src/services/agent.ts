export interface AgentRequest {
  query: string;
}

export interface TraceEvent {
  type: string;
  [key: string]: any;
}

export interface AgentResponse {
  answer: string;
  trace: TraceEvent[];
}

export async function runAgent(query: string): Promise<AgentResponse> {
  const res = await fetch("http://localhost:3000/agent", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    throw new Error("Agent request failed");
  }

  return res.json();
}
