// Deno server for static files with live reload via WebSockets
const port = 8000;

console.log(`Server running on http://localhost:${port}`);

// Set to store all active WebSocket connections
const wsClients = new Set<WebSocket>();

// Watch main.ts for changes and broadcast reload
(async () => {
  const watcher = Deno.watchFs("./main.ts");
  for await (const event of watcher) {
    if (event.kind === "modify") {
      broadcastReload();
    }
  }
})();

function broadcastReload() {
  const message = "reload";
  for (const ws of wsClients) {
    try {
      ws.send(message);
    } catch {
      wsClients.delete(ws);
    }
  }
  console.log("Change detected in main.ts - broadcasting reload");
}

Deno.serve({
  port,
}, async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/") {
    return serveFile("./public/index.html", "text/html");
  }
  if (path === "/app.css") {
    return serveFile("./public/app.css", "text/css");
  }
  if (path === "/main.ts") {
    return serveFile("./main.ts", "application/javascript");
  }

  // WebSocket upgrade for /ws endpoint
  if (path === "/ws") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  }

  return new Response("404 Not Found", { status: 404 });
});

function handleWebSocket(ws: WebSocket) {
  wsClients.add(ws);
  
  ws.onopen = () => {
    // Send initial connection confirmation
    ws.send("connected");
  };

  ws.onmessage = (e) => {
    // Handle any messages from client if needed
    if (e.data === "ping") {
      ws.send("pong");
    }
  };

  ws.onclose = () => {
    wsClients.delete(ws);
  };

  ws.onerror = () => {
    wsClients.delete(ws);
    ws.close();
  };
}

async function serveFile(filePath: string, contentType: string) {
  const file = await Deno.readTextFile(filePath);
  return new Response(file, { headers: { "Content-Type": contentType } });
}
