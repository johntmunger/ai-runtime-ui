"use client";

import { groupTrace } from "@/lib/groupTrace";
import type { TraceEvent } from "@/lib/groupTrace";

export function TracePanel({ trace }: { trace: TraceEvent[] }) {
  const groups = groupTrace(trace);

  return (
    <div className="mt-3 text-xs bg-black/40 border border-neutral-800 rounded-lg p-3">
      <div className="border-l border-neutral-700 pl-3 space-y-2">
      {groups.map((group, i) => {
        if (group.type === "planner") {
          return (
            <div key={i}>
              <div className="text-neutral-400">Planner</div>
              <div className="text-white font-medium">
                {typeof group.decision === "string"
                  ? group.decision
                  : JSON.stringify(group.decision)}
              </div>
            </div>
          );
        }

        if (group.type === "tool") {
          return (
            <div key={i}>
              <div className="text-blue-400">
                Tool:{" "}
                {typeof group.tool === "string"
                  ? group.tool
                  : JSON.stringify(group.tool)}
              </div>

              <div className="text-neutral-500">
                args: {JSON.stringify(group.args)}
              </div>

              <div className="mt-1 space-y-1">
                {group.steps.map((step: TraceEvent, j: number) => {
                  if (step.type === "enforcement") {
                    return (
                      <div key={j} className="text-yellow-400">
                        enforcement:{" "}
                        {typeof step.decision === "string"
                          ? step.decision
                          : JSON.stringify(step.decision)}
                      </div>
                    );
                  }

                  if (step.type === "tool_result") {
                    return (
                      <div key={j} className="text-green-400">
                        result: {JSON.stringify(step.result ?? step.error)}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          );
        }

        if (group.type === "output") {
          return (
            <div key={i} className="text-green-500">
              output (
              {typeof group.outputType === "string"
                ? group.outputType
                : JSON.stringify(group.outputType)}
              )
            </div>
          );
        }

        return null;
      })}
      </div>
    </div>
  );
}
