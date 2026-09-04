// Deno server for static files with live reload via WebSockets
const port = 8000;

console.log(`Server running on http://localhost:${port}`);

// Set to store all active WebSocket connections
const wsClients = new Set<WebSocket>();

// Compile TypeScript files to JavaScript
async function compileTsToJs(tsPath: string, jsPath: string) {
  try {
    const tsCode = await Deno.readTextFile(tsPath);
    // Simple transpilation - remove TypeScript-specific syntax
    const jsCode = tsCode
      .replace(/ as [\w<>]+/g, '')  // Remove type assertions
      .replace(/\.ts('|")/g, '.js$1') // Fix import extensions
      .replace(/\.ts/g, '.js'); // Fix other .ts references
    
    await Deno.writeTextFile(jsPath, jsCode);
    console.log(`Compiled ${tsPath} -> ${jsPath}`);
  } catch (error) {
    console.error(`Failed to compile ${tsPath}:`, error);
  }
}

// Compile all TypeScript files on startup
try {
  await compileTsToJs("./main.ts", "./public/main.js");
  await compileTsToJs("./public/app.ts", "./public/app.js");
} catch (error) {
  console.error("Initial compilation failed:", error);
}

// Watch source files for changes and recompile + broadcast reload
(async () => {
  const watcher = Deno.watchFs(["./main.ts", "./public/app.ts"]);
  for await (const event of watcher) {
    if (event.kind === "modify") {
      const tsPath = event.paths[0];
      const jsPath = tsPath.replace('.ts', '.js').replace('./', './public/');
      await compileTsToJs(tsPath, jsPath);
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
  console.log("Change detected - broadcasting reload");
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
  if (path === "/main.js") {
    return serveFile("./public/main.js", "application/javascript");
  }
  if (path === "/app.js") {
    return serveFile("./public/app.js", "application/javascript");
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
