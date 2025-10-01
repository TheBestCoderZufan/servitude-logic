// src/app/api/workflow/events/route.js
import { NextResponse } from "next/server";
import { subscribeToWorkflowEvents } from "@/lib/notifications/workflowNotifications";

export const dynamic = "force-dynamic";

/**
 * Streams workflow events over Server-Sent Events so client dashboards can react in real time.
 *
 * @returns {Promise<NextResponse>} SSE response emitting workflow events.
 */
export async function GET() {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  const stream = new ReadableStream({
    start(controller) {
      function send(data) {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      }

      send({ type: "workflow.stream.ready" });

      const unsubscribe = subscribeToWorkflowEvents((event) => {
        send({ type: "workflow.event", event });
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":heartbeat\n\n"));
      }, 25000);

      cleanup = () => {
        clearInterval(keepAlive);
        unsubscribe();
      };
    },
    cancel() {
      cleanup();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
