export interface ChatResponse {
  type: string;
  message: string;
}

const RUNTIME_API_URL = "http://localhost:3000";

export async function sendPrompt(prompt: string): Promise<ChatResponse> {
  const response = await fetch(`${RUNTIME_API_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as ChatResponse;
}
