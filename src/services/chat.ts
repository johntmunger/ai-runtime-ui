export interface Source {
  id?: string;
  title?: string;
  url?: string;
  content?: string;
  excerpt?: string;
  [key: string]: unknown;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
}

export async function sendPrompt(message: string): Promise<ChatResponse> {
  const response = await fetch("http://localhost:3000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: message }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as ChatResponse;
}
