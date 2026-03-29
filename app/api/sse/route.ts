import { NextRequest, NextResponse } from "next/server";

// In-memory store for SSE clients
const sseClients = new Set<ReadableStreamDefaultController>();

export function POST(req: NextRequest) {
  // Notify all SSE clients about an update
  const body = req.body;

  sseClients.forEach((client) => {
    try {
      client.enqueue(`data: ${JSON.stringify(body)}\n\n`);
    } catch (error) {
      sseClients.delete(client);
    }
  });

  return NextResponse.json({ message: "Update broadcasted" });
}

export function GET(req: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      sseClients.add(controller);

      // Send initial connection message
      controller.enqueue('data: {"type":"connected"}\n\n');

      // Cleanup on client disconnect
      req.signal.addEventListener("abort", () => {
        sseClients.delete(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
