"use client";

import { useEffect, useState } from "react";

type RuntimeMode = "chat" | "agent";
type RuntimeEndpoint = "/chat" | "/agent";

type LastStatus = "idle" | "ok" | "error";

type HealthPayload = {
  version?: string;
  timestamp?: string;
};

export function RuntimeDebugPanel({
  mode,
  lastEndpoint,
  lastStatus,
  lastArgs,
}: {
  mode: RuntimeMode;
  lastEndpoint: RuntimeEndpoint;
  lastStatus: LastStatus;
  lastArgs?: Record<string, unknown>;
}) {
  const [health, setHealth] = useState<HealthPayload | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/health")
      .then((res) => res.json())
      .then((data) => setHealth(data as HealthPayload))
      .catch(() => setHealthError("unreachable"));
  }, []);

  const mismatch =
    (mode === "agent" && lastEndpoint === "/chat") ||
    (mode === "chat" && lastEndpoint === "/agent");

  const statusClass =
    lastStatus === "ok"
      ? "text-green-400"
      : lastStatus === "error"
        ? "text-red-400"
        : "text-yellow-400";

  return (
    <div className="fixed bottom-4 right-4 text-xs bg-black/70 border border-neutral-800 rounded-lg p-3 space-y-1 w-72 z-50">
      <div className="text-neutral-400">Runtime Debug</div>

      <div>
        <span className="text-neutral-500">mode:</span>{" "}
        <span className="text-white">{mode}</span>
      </div>

      <div>
        <span className="text-neutral-500">endpoint (last req):</span>{" "}
        <span className="text-white">{lastEndpoint}</span>
      </div>

      <div>
        <span className="text-neutral-500">last request:</span>{" "}
        <span className={statusClass}>{lastStatus}</span>
      </div>

      {lastArgs && (
        <div className="text-neutral-300 wrap-break-word">
          <span className="text-neutral-500">last args:</span>{" "}
          <span className="text-white">{JSON.stringify(lastArgs)}</span>
        </div>
      )}

      {mismatch && (
        <div className="text-red-400 border border-red-900/60 bg-red-950/40 rounded-md p-2">
          Warning: UI mode is <span className="font-semibold">{mode}</span> but
          last request targeted{" "}
          <span className="font-semibold">{lastEndpoint}</span>.
        </div>
      )}

      <div className="pt-1 border-t border-neutral-800">
        <span className="text-neutral-500">server:</span>{" "}
        {health ? (
          <span className="text-green-400">{health.version ?? "online"}</span>
        ) : healthError ? (
          <span className="text-red-400">offline</span>
        ) : (
          <span className="text-yellow-400">checking...</span>
        )}
      </div>

      {health?.timestamp && (
        <div className="text-neutral-600">ts: {health.timestamp}</div>
      )}
    </div>
  );
}
