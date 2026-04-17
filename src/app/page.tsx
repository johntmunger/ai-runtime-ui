"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { EmptyState } from "@/components/EmptyState";
import { MessageList } from "@/components/MessageList";
import { InputBar } from "@/components/InputBar";
import { SettingsPanel } from "@/components/SettingsPanel";
import { RuntimeDebugPanel } from "@/components/RuntimeDebugPanel";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { generateId } from "@/lib/utils";
import { sendPrompt } from "@/services/chat";
import { runAgent } from "@/services/agent";
import type { Message, Settings } from "@/types";
import type { TraceEvent } from "@/lib/groupTrace";

type RuntimeMode = "chat" | "agent";

function extractLastToolArgsFromTrace(
  trace: TraceEvent[] | undefined,
): Record<string, unknown> | undefined {
  if (!trace?.length) return undefined;
  for (let i = trace.length - 1; i >= 0; i--) {
    const e = trace[i];
    if (e.type !== "tool_invocation") continue;
    const args = (e as { args?: unknown }).args;
    if (args && typeof args === "object" && !Array.isArray(args)) {
      return args as Record<string, unknown>;
    }
    if (args !== undefined) {
      return { value: args as unknown };
    }
  }
  return undefined;
}

// Default settings
const defaultSettings: Settings = {
  theme: "system",
  answerStyle: "balanced",
  codeStyle: {
    preferModernSyntax: true,
    showTypeScriptVariations: false,
  },
  experimental: {
    stepByStepExplanations: false,
    showCompatibilityNotes: false,
  },
  verificationMode: false,
};

export default function Home() {
  const [mode, setMode] = useState<RuntimeMode>("agent");
  const [lastStatus, setLastStatus] = useState<"idle" | "ok" | "error">(
    "idle",
  );
  const [lastEndpoint, setLastEndpoint] = useState<"/chat" | "/agent">(
    "/agent",
  );
  const [lastArgs, setLastArgs] = useState<Record<string, unknown> | undefined>(
    undefined,
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useLocalStorage<Message[]>("messages", []);
  const [settings, setSettings] = useLocalStorage<Settings>(
    "settings",
    defaultSettings,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration errors by only rendering after mount
  useEffect(() => {
    queueMicrotask(() => setIsMounted(true));
  }, []);

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Call streaming API
    setIsGenerating(true);
    await callStreamingAPI(updatedMessages);
    setIsGenerating(false);
  };

  const callStreamingAPI = async (currentMessages: Message[]) => {
    const endpoint: "/chat" | "/agent" = mode === "chat" ? "/chat" : "/agent";
    setLastStatus("idle");
    setLastEndpoint(endpoint);
    setLastArgs(undefined);

    try {
      const lastUserMessage = currentMessages[currentMessages.length - 1];
      const content = lastUserMessage.content;

      let answer = "";
      let trace: Message["trace"];

      if (mode === "chat") {
        const result = await sendPrompt(content);
        answer = result.answer;
      } else {
        const result = await runAgent(content);
        answer = result.answer;
        trace = result.trace;
      }

      setLastArgs(extractLastToolArgsFromTrace(trace));
      setLastStatus("ok");

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: answer,
        timestamp: new Date().toISOString(),
        trace, // 👈 NEW
      };

      setMessages([...currentMessages, assistantMessage]);
    } catch (error) {
      console.error("Error calling API:", error);
      setLastStatus("error");

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: `# API Connection Error\n\nCould not connect to the runtime service at localhost:3000.\n\n**Error:** ${error instanceof Error ? error.message : String(error)}\n\n**Troubleshooting:**\n- Make sure rag-mdn is running on http://localhost:3000\n- Check that POST /chat is available`,
        timestamp: new Date().toISOString(),
      };

      setMessages([...currentMessages, assistantMessage]);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);

    setIsGenerating(true);
    await callStreamingAPI(messagesToKeep);
    setIsGenerating(false);
  };

  const handlePin = (messageId: string) => {
    setMessages(
      messages.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg,
      ),
    );
  };

  const handleCopy = async (content: string) => {
    await navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const conversationText = messages
      .map((msg) => `${msg.role.toUpperCase()}:\n${msg.content}\n`)
      .join("\n---\n\n");

    const blob = new Blob([conversationText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mdn-chat-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestart = () => {
    if (
      messages.length > 0 &&
      confirm("Clear the entire conversation and start over?")
    ) {
      setMessages([]);
    }
  };

  const quickSuggestions =
    messages.length > 0
      ? [
          "Summarize this answer",
          "Explain like I'm new to JS",
          "Give a shorter example",
        ]
      : [];

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <div className="h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-gray-50 dark:to-gray-900">
        <TopBar
          onSettingsClick={() => setIsSettingsOpen(true)}
          onDownload={handleDownload}
          onRestart={handleRestart}
          mode={mode}
          onModeChange={setMode}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col overflow-hidden">
            <EmptyState onExampleClick={handleSendMessage} />
          </div>

          <InputBar
            onSend={handleSendMessage}
            disabled={false}
            suggestions={[]}
            placeholder="Ask me anything related to JavaScript..."
          />
        </main>

        <RuntimeDebugPanel
          mode={mode}
          lastEndpoint={lastEndpoint}
          lastStatus={lastStatus}
          lastArgs={lastArgs}
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-[var(--background)] to-gray-50 dark:to-gray-900">
      <TopBar
        onSettingsClick={() => setIsSettingsOpen(true)}
        onDownload={handleDownload}
        onRestart={handleRestart}
        mode={mode}
        onModeChange={setMode}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 && !isGenerating ? (
            <EmptyState onExampleClick={handleSendMessage} />
          ) : (
            <MessageList
              messages={messages}
              isGenerating={isGenerating}
              mode={mode}
              onRegenerate={handleRegenerate}
              onPin={handlePin}
              onCopy={handleCopy}
            />
          )}
        </div>

        <InputBar
          onSend={handleSendMessage}
          disabled={isGenerating}
          suggestions={quickSuggestions}
          placeholder="Ask me anything related to JavaScript..."
        />
      </main>

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChange={setSettings}
      />

      <RuntimeDebugPanel
        mode={mode}
        lastEndpoint={lastEndpoint}
        lastStatus={lastStatus}
        lastArgs={lastArgs}
      />
    </div>
  );
}
