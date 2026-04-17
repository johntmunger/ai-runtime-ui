export type TraceEvent = {
  type: string;
  [key: string]: unknown;
};

type GroupedTrace =
  | { type: "planner"; decision: unknown }
  | {
      type: "tool";
      tool: unknown;
      args: unknown;
      steps: TraceEvent[];
    }
  | { type: "output"; outputType: unknown };

export function groupTrace(events: TraceEvent[]) {
  const groups: GroupedTrace[] = [];

  let currentTool: Extract<GroupedTrace, { type: "tool" }> | null = null;

  for (const event of events) {
    if (event.type === "planner") {
      groups.push({
        type: "planner",
        decision: event.decision,
      });
    }

    if (event.type === "tool_invocation") {
      currentTool = {
        type: "tool",
        tool: event.tool,
        args: event.args,
        steps: [],
      };
      groups.push(currentTool);
    }

    if (event.type === "enforcement" || event.type === "tool_result") {
      if (currentTool) {
        currentTool.steps.push(event);
      }
    }

    if (event.type === "kernel_output") {
      groups.push({
        type: "output",
        outputType: event.outputType,
      });
    }
  }

  return groups;
}
