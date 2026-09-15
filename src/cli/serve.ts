import { createServer } from "vite";
import type { AddressInfo } from "node:net";

export async function serve(drawingFile: string): Promise<void> {
  const importPath = drawingFile.replace(/\.ts$/, "");
  const server = await createServer({
    configFile: false,
    env: {
      VITE_DRAWING_PATH: importPath,
    },
  });
  await server.listen();
  const address = server.httpServer?.address() as AddressInfo | null
  const port = address?.port || 5173
  console.log(`Server running at http://localhost:${port}`)
}
